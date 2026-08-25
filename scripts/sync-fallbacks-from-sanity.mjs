import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@sanity/client";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const shouldMirrorAssets = process.argv.includes("--mirror-assets");

const mediaFallbackPath = path.join(projectRoot, "src", "app", "media-list.json");
const workFallbackPath = path.join(
  projectRoot,
  "src",
  "app",
  "work",
  "work-cards-fallback.json",
);
const mirroredImagesDir = path.join(projectRoot, "public", "fallback-media", "images");
const mirroredVideosDir = path.join(projectRoot, "public", "fallback-media", "videos");
const mirroredUrlBySource = new Map();

async function loadEnvFile() {
  const envPath = path.join(projectRoot, ".env.local");

  try {
    const envFile = await fs.readFile(envPath, "utf8");
    for (const rawLine of envFile.split("\n")) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const equalsIndex = line.indexOf("=");
      if (equalsIndex < 0) continue;
      const key = line.slice(0, equalsIndex).trim();
      const value = line
        .slice(equalsIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // Optional: process.env may already be provided by CI/runtime shell.
  }
}

function createSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_TOKEN || "";

  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID is required in environment or .env.local",
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: true,
    token: token || undefined,
    perspective: "published",
  });
}

async function readExistingMediaIds() {
  try {
    const raw = await fs.readFile(mediaFallbackPath, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Map();
    return new Map(
      parsed
        .filter((item) => item && typeof item.name === "string")
        .map((item) => [item.name, item.id]),
    );
  } catch {
    return new Map();
  }
}

function getVideoMimeTypeFromUrl(url) {
  const normalized = typeof url === "string" ? url.toLowerCase() : "";
  if (normalized.endsWith(".webm")) return "video/webm";
  if (normalized.endsWith(".mov")) return "video/quicktime";
  return "video/mp4";
}

function getImageMimeTypeFromUrl(url) {
  const normalized = typeof url === "string" ? url.toLowerCase() : "";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".gif")) return "image/gif";
  if (normalized.endsWith(".avif")) return "image/avif";
  return "image/jpeg";
}

function inferMediaType(type, url) {
  if (type === "video") return "video";
  if (type === "image") return "image";
  const normalized = typeof url === "string" ? url.toLowerCase() : "";
  if (
    normalized.endsWith(".mp4") ||
    normalized.endsWith(".webm") ||
    normalized.endsWith(".mov")
  ) {
    return "video";
  }
  return "image";
}

function normalizeInvertColor(value) {
  if (value === true) return true;
  if (value === false || value == null) return false;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "yes" || normalized === "true" || normalized === "1";
  }
  if (typeof value === "number") {
    return value === 1;
  }
  return false;
}

function sanitizeFileName(value) {
  return String(value || "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getFileExtensionFromUrl(url, fallback = "") {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname);
    if (ext) return ext.toLowerCase();
  } catch {
    // Ignore parse errors and use fallback below.
  }
  return fallback;
}

async function mirrorAssetToPublic({ url, type, name, id }) {
  if (!shouldMirrorAssets) return null;
  if (typeof url !== "string" || !url.length) return null;
  if (mirroredUrlBySource.has(url)) {
    return mirroredUrlBySource.get(url);
  }

  const isVideo = type === "video";
  const destinationDir = isVideo ? mirroredVideosDir : mirroredImagesDir;
  const fallbackExtension = isVideo ? ".mp4" : ".jpg";
  const extension = getFileExtensionFromUrl(url, fallbackExtension);
  const baseName = sanitizeFileName(name || `asset-${id}`);
  const finalFileName = `${baseName || `asset-${id}`}${extension}`;
  const destinationPath = path.join(destinationDir, finalFileName);

  await fs.mkdir(destinationDir, { recursive: true });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download asset ${url}: ${response.status}`);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(destinationPath, bytes);

  const relativeUrl = isVideo
    ? `/fallback-media/videos/${finalFileName}`
    : `/fallback-media/images/${finalFileName}`;
  const encoded = encodeURI(relativeUrl);
  mirroredUrlBySource.set(url, encoded);
  return encoded;
}

function compareOrderRank(a, b) {
  const rankA = typeof a?.orderRank === "string" ? a.orderRank : "";
  const rankB = typeof b?.orderRank === "string" ? b.orderRank : "";
  return rankA.localeCompare(rankB);
}

async function writeJson(filePath, data) {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, json, "utf8");
}

async function syncFallbacks() {
  await loadEnvFile();
  const client = createSanityClient();
  const existingIdByName = await readExistingMediaIds();

  const mediaQuery = `*[_type == "mediaAsset" && !(_id in path("drafts.**"))] | order(orderRank asc) {
    _id,
    name,
    type,
    alt,
    displayName,
    projectDescription,
    invertColor,
    projectTypes,
    orderRank,
    width,
    height,
    "assetUrl": coalesce(asset.asset->url, asset->url),
    "assetWidth": coalesce(asset.asset->metadata.dimensions.width, asset->metadata.dimensions.width),
    "assetHeight": coalesce(asset.asset->metadata.dimensions.height, asset->metadata.dimensions.height)
  }`;

  const workCardsQuery = `*[_type == "workCard" && !(_id in path("drafts.**"))] | order(orderRank asc, _createdAt asc) {
    _id,
    title,
    url,
    "categories": coalesce(categories, select(defined(category) => [category], [])),
    "mediaUrl": coalesce(media.asset->url, media->url),
    "mediaMimeType": coalesce(media.asset->mimeType, media->mimeType),
    mediaAlt,
    designStudio,
    designStudioUrl,
    builtAtStudio,
    builtAtStudioUrl,
    orderRank
  }`;

  const [mediaAssets, workCards] = await Promise.all([
    client.fetch(mediaQuery),
    client.fetch(workCardsQuery),
  ]);

  const sortedMediaAssets = Array.isArray(mediaAssets)
    ? [...mediaAssets].sort(compareOrderRank)
    : [];
  const sortedWorkCards = Array.isArray(workCards)
    ? [...workCards].sort(compareOrderRank)
    : [];

  let nextId = 1;
  const usedIds = new Set();

  const mediaFallbackBase = sortedMediaAssets
    .filter((item) => item && typeof item.assetUrl === "string" && item.assetUrl.length > 0)
    .map((item) => {
      const name = item.name || item.displayName || item._id;
      let id = existingIdByName.get(name);
      if (!Number.isInteger(id) || id <= 0 || usedIds.has(id)) {
        while (usedIds.has(nextId)) nextId += 1;
        id = nextId;
        nextId += 1;
      }
      usedIds.add(id);

      const inferredType = inferMediaType(item.type, item.assetUrl);
      const parsedAssetWidth = Number(item.assetWidth);
      const parsedAssetHeight = Number(item.assetHeight);
      const parsedDocWidth = Number(item.width);
      const parsedDocHeight = Number(item.height);

      return {
        id,
        type: inferredType,
        src: item.assetUrl,
        name,
        alt: item.alt || name,
        displayName: item.displayName || "",
        projectDescription: item.projectDescription || "",
        width:
          Number.isFinite(parsedAssetWidth) && parsedAssetWidth > 0
            ? parsedAssetWidth
            : Number.isFinite(parsedDocWidth) && parsedDocWidth > 0
              ? parsedDocWidth
              : inferredType === "video"
                ? 1280
                : 800,
        height:
          Number.isFinite(parsedAssetHeight) && parsedAssetHeight > 0
            ? parsedAssetHeight
            : Number.isFinite(parsedDocHeight) && parsedDocHeight > 0
              ? parsedDocHeight
              : inferredType === "video"
                ? 720
                : 600,
        invertColor: normalizeInvertColor(item.invertColor),
        projectTypes: Array.isArray(item.projectTypes) ? item.projectTypes : [],
        orderRank: item.orderRank || "",
      };
    })
    .sort((a, b) => a.id - b.id);

  const mediaFallback = await Promise.all(
    mediaFallbackBase.map(async (item) => {
      try {
        const mirroredUrl = await mirrorAssetToPublic({
          url: item.src,
          type: item.type,
          name: item.name,
          id: item.id,
        });
        return mirroredUrl ? { ...item, src: mirroredUrl } : item;
      } catch (error) {
        console.warn(
          `Could not mirror asset "${item.name}" (${item.src}): ${error.message}`,
        );
        return item;
      }
    }),
  );

  const workFallback = await Promise.all(
    sortedWorkCards.map(async (item, index) => {
      const inferredType = inferMediaType(
        typeof item.mediaMimeType === "string" && item.mediaMimeType.startsWith("video/")
          ? "video"
          : "image",
        item.mediaUrl,
      );
      let mediaUrl = item.mediaUrl || "";
      if (mediaUrl) {
        try {
          const mirrored = await mirrorAssetToPublic({
            url: mediaUrl,
            type: inferredType,
            name: item.title || item._id || `work-card-${index + 1}`,
            id: index + 1,
          });
          if (mirrored) mediaUrl = mirrored;
        } catch (error) {
          console.warn(
            `Could not mirror work card media "${item.title}" (${mediaUrl}): ${error.message}`,
          );
        }
      }

      return {
        _id: item._id,
        title: item.title || "Untitled project",
        url: item.url || "",
        categories: Array.isArray(item.categories)
          ? item.categories.filter(
              (category) => typeof category === "string" && category.trim(),
            )
          : [],
        mediaUrl,
        mediaMimeType:
          item.mediaMimeType ||
          (inferredType === "video"
            ? getVideoMimeTypeFromUrl(mediaUrl)
            : getImageMimeTypeFromUrl(mediaUrl)),
        mediaAlt: item.mediaAlt || item.title || "Work card media",
        designStudio: item.designStudio || "",
        designStudioUrl: item.designStudioUrl || "",
        builtAtStudio: item.builtAtStudio || "",
        builtAtStudioUrl: item.builtAtStudioUrl || "",
        orderRank: item.orderRank || "",
      };
    }),
  );

  await Promise.all([
    writeJson(mediaFallbackPath, mediaFallback),
    writeJson(workFallbackPath, workFallback),
  ]);

  console.log(
    `Synced fallbacks from Sanity: ${mediaFallback.length} media items, ${workFallback.length} work cards.`,
  );
  if (shouldMirrorAssets) {
    console.log("Mirrored fallback media into public/fallback-media.");
  }
  console.log(`Updated ${path.relative(projectRoot, mediaFallbackPath)}`);
  console.log(`Updated ${path.relative(projectRoot, workFallbackPath)}`);
}

syncFallbacks().catch((error) => {
  console.error("Failed to sync fallback JSON from Sanity:", error.message);
  process.exit(1);
});
