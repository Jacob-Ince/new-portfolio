import fallbackMediaList from "../app/media-list.json";
import fallbackWorkCards from "../app/work/work-cards-fallback.json";

const CACHE_TTL_MS = 5 * 60 * 1000;

let mediaAssetsCache = null;
let mediaAssetsCacheAt = 0;
let mediaAssetsPromise = null;

const mediaAssetByNameCache = new Map();
const mediaAssetByNamePromises = new Map();

let workCardsCache = null;
let workCardsCacheAt = 0;
let workCardsPromise = null;

function isCacheFresh(cachedAt) {
  return Date.now() - cachedAt < CACHE_TTL_MS;
}

function normalizeLookup(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getLookupKeys(value) {
  const normalized = normalizeLookup(value);
  if (!normalized) return [];

  const loose = normalized.replace(/[^a-z0-9]+/g, "");
  if (!loose || loose === normalized) return [normalized];
  return [normalized, loose];
}

function getPathNameCandidates(value) {
  if (typeof value !== "string") return [];

  const decoded = decodeURIComponent(
    value.split("?")[0].split("#")[0].split("/").pop() || "",
  );
  if (!decoded) return [];

  const stem = decoded.replace(/\.[^/.]+$/, "");
  return stem && stem !== decoded ? [decoded, stem] : [decoded];
}

// Default to mirrored local media to reduce third-party CDN bandwidth.
// Set NEXT_PUBLIC_PREFER_LOCAL_MEDIA=false to force Sanity-hosted media.
const preferLocalMirroredMedia =
  process.env.NEXT_PUBLIC_PREFER_LOCAL_MEDIA !== "false";

const mediaTileSrcByName = (() => {
  const lookupMap = new Map();
  const mediaItems = Array.isArray(fallbackMediaList) ? fallbackMediaList : [];

  mediaItems.forEach((item) => {
    if (!item || typeof item.src !== "string" || !item.src.startsWith("/fallback-media/")) {
      return;
    }

    const candidates = [
      item.name,
      item.displayName,
      item.alt,
      ...getPathNameCandidates(item.src),
    ];

    candidates.forEach((candidate) => {
      getLookupKeys(candidate).forEach((key) => {
        if (!lookupMap.has(key)) {
          lookupMap.set(key, item.src);
        }
      });
    });
  });

  return lookupMap;
})();

const workTileSrcById = new Map(
  (Array.isArray(fallbackWorkCards) ? fallbackWorkCards : [])
    .filter(
      (card) =>
        card &&
        typeof card._id === "string" &&
        typeof card.mediaUrl === "string" &&
        card.mediaUrl.startsWith("/fallback-media/"),
    )
    .map((card) => [card._id, card.mediaUrl]),
);

const workTileSrcByTitle = new Map(
  (Array.isArray(fallbackWorkCards) ? fallbackWorkCards : [])
    .filter(
      (card) =>
        card &&
        typeof card.title === "string" &&
        typeof card.mediaUrl === "string" &&
        card.mediaUrl.startsWith("/fallback-media/"),
    )
    .map((card) => [normalizeLookup(card.title), card.mediaUrl]),
);

function getTileSrcByMediaName(mediaName) {
  const keys = getLookupKeys(mediaName);
  for (const key of keys) {
    const tileSrc = mediaTileSrcByName.get(key);
    if (tileSrc) return tileSrc;
  }
  return null;
}

function getTileSrcByMediaCandidates(candidates) {
  if (!Array.isArray(candidates)) return null;

  for (const candidate of candidates) {
    const tileSrc = getTileSrcByMediaName(candidate);
    if (tileSrc) return tileSrc;
  }

  return null;
}

function getLocalMediaAssetByName(name) {
  const lookupKeys = getLookupKeys(name);
  if (lookupKeys.length === 0) return null;

  return (
    (Array.isArray(fallbackMediaList) ? fallbackMediaList : []).find((asset) => {
      const candidateNames = [
        asset?.name,
        asset?.displayName,
        asset?.alt,
        typeof asset?.src === "string"
          ? decodeURIComponent(asset.src.split("/").pop() || "")
          : "",
      ];

      return candidateNames.some((candidate) => {
        const candidateKeys = getLookupKeys(candidate);
        return candidateKeys.some((candidateKey) => lookupKeys.includes(candidateKey));
      });
    }) ?? null
  );
}

function attachWorkCardTileSource(card) {
  if (!card || typeof card !== "object") return card;

  const tileMediaUrl =
    workTileSrcById.get(card._id) ||
    workTileSrcByTitle.get(normalizeLookup(card.title)) ||
    null;

  if (!tileMediaUrl) {
    return { ...card, tileMediaUrl: card.mediaUrl || "" };
  }

  return {
    ...card,
    tileMediaUrl,
  };
}

// Fetch all media assets
export async function getAllMediaAssets() {
  if (preferLocalMirroredMedia && Array.isArray(fallbackMediaList) && fallbackMediaList.length > 0) {
    return fallbackMediaList;
  }

  if (mediaAssetsCache && isCacheFresh(mediaAssetsCacheAt)) {
    return mediaAssetsCache;
  }

  if (mediaAssetsPromise) {
    return mediaAssetsPromise;
  }

  try {
    mediaAssetsPromise = fetch("/api/media-assets", { cache: "default" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Media assets request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const nextData = Array.isArray(data) ? data : [];
        mediaAssetsCache = nextData;
        mediaAssetsCacheAt = Date.now();
        return nextData;
      })
      .finally(() => {
        mediaAssetsPromise = null;
      });

    return await mediaAssetsPromise;
  } catch (error) {
    mediaAssetsPromise = null;
    console.error("Error fetching media assets:", error);
    return [];
  }
}

// Fetch a single media asset by name
export async function getMediaAssetByName(name) {
  const normalizedName = typeof name === "string" ? name.trim() : "";
  if (!normalizedName) return null;

  if (preferLocalMirroredMedia) {
    const localAsset = getLocalMediaAssetByName(normalizedName);
    if (localAsset) return localAsset;
  }

  const cached = mediaAssetByNameCache.get(normalizedName);
  if (cached && isCacheFresh(cached.cachedAt)) {
    return cached.data;
  }

  if (mediaAssetByNamePromises.has(normalizedName)) {
    return mediaAssetByNamePromises.get(normalizedName);
  }

  try {
    const requestPromise = fetch(
      `/api/media-assets?name=${encodeURIComponent(normalizedName)}`,
      { cache: "default" },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Media asset request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const nextData = data || null;
        mediaAssetByNameCache.set(normalizedName, {
          data: nextData,
          cachedAt: Date.now(),
        });
        return nextData;
      })
      .finally(() => {
        mediaAssetByNamePromises.delete(normalizedName);
      });

    mediaAssetByNamePromises.set(normalizedName, requestPromise);
    return await requestPromise;
  } catch (error) {
    mediaAssetByNamePromises.delete(normalizedName);
    console.error("Error fetching media asset:", error);
    return null;
  }
}

// Fetch all work cards
export async function getAllWorkCards() {
  if (
    preferLocalMirroredMedia &&
    Array.isArray(fallbackWorkCards) &&
    fallbackWorkCards.length > 0
  ) {
    return fallbackWorkCards.map(attachWorkCardTileSource);
  }

  if (workCardsCache && isCacheFresh(workCardsCacheAt)) {
    return workCardsCache;
  }

  if (workCardsPromise) {
    return workCardsPromise;
  }

  try {
    workCardsPromise = fetch("/api/work-cards", { cache: "default" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Work cards request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const nextData = (Array.isArray(data) ? data : []).map(
          attachWorkCardTileSource,
        );
        workCardsCache = nextData;
        workCardsCacheAt = Date.now();
        return nextData;
      })
      .finally(() => {
        workCardsPromise = null;
      });

    return await workCardsPromise;
  } catch (error) {
    workCardsPromise = null;
    console.error("Error fetching work cards:", error);
    return [];
  }
}

// Transform Sanity media asset to match the old media-list.json format
export function transformSanityMedia(mediaAsset) {
  if (!mediaAsset) return null;

  const isLegacyMediaItem =
    typeof mediaAsset.src === "string" &&
    mediaAsset.src.length > 0 &&
    !mediaAsset.assetUrl &&
    !mediaAsset.assetRef;

  if (isLegacyMediaItem) {
    const width =
      Number.isFinite(Number(mediaAsset.width)) && Number(mediaAsset.width) > 0
        ? Number(mediaAsset.width)
        : 800;
    const height =
      Number.isFinite(Number(mediaAsset.height)) && Number(mediaAsset.height) > 0
        ? Number(mediaAsset.height)
        : 600;

    const tileSrc = getTileSrcByMediaCandidates([
      mediaAsset.name,
      mediaAsset.displayName,
      mediaAsset.alt,
      mediaAsset.src,
    ]);

    return {
      id: mediaAsset._id || mediaAsset.id || mediaAsset.name || mediaAsset.src,
      type: mediaAsset.type || "image",
      src: mediaAsset.src,
      tileSrc: tileSrc || mediaAsset.src,
      name: mediaAsset.name || mediaAsset.displayName || mediaAsset.src,
      alt:
        mediaAsset.alt ||
        mediaAsset.displayName ||
        mediaAsset.name ||
        "Portfolio media",
      displayName: mediaAsset.displayName || "",
      projectDescription: mediaAsset.projectDescription || "",
      width,
      height,
      invertColor: mediaAsset.invertColor === "yes" || mediaAsset.invertColor === true,
      projectTypes: Array.isArray(mediaAsset.projectTypes)
        ? mediaAsset.projectTypes
        : [],
      orderRank: mediaAsset.orderRank || `z-${mediaAsset.id || 0}`,
    };
  }

  // Try to get the URL from the query result
  let fileUrl = mediaAsset.assetUrl;

  // Fallback: construct URL from assetRef if assetUrl is not available
  if (!fileUrl && mediaAsset.assetRef) {
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

    if (projectId) {
      // Construct URL from asset reference (format: file-{hash}-{ext})
      fileUrl = `https://cdn.sanity.io/files/${projectId}/${dataset}/${mediaAsset.assetRef}`;
    }
  }

  // If still no URL, log for debugging
  if (!fileUrl) {
    console.warn(`No assetUrl found for media asset: ${mediaAsset.name}`, {
      asset: mediaAsset.asset,
      assetUrl: mediaAsset.assetUrl,
      assetRef: mediaAsset.assetRef,
    });
  }

  // Use orderRank for ordering, fallback to 0 if not set
  // orderRank is a string like "a0", "a1", etc. - we'll use it as-is for sorting
  // For the id field, we can use a numeric representation or keep orderRank
  const orderValue = mediaAsset.orderRank || "a0";

  const normalizeProjectType = (type) => {
    if (typeof type !== "string") return type;
    const normalized = type.trim();
    return normalized.toLowerCase() === "3d" ? "3D" : normalized;
  };

  const parsedAssetWidth = Number(mediaAsset.assetWidth);
  const parsedAssetHeight = Number(mediaAsset.assetHeight);
  const parsedDocWidth = Number(mediaAsset.width);
  const parsedDocHeight = Number(mediaAsset.height);
  const width =
    Number.isFinite(parsedAssetWidth) && parsedAssetWidth > 0
      ? parsedAssetWidth
      : Number.isFinite(parsedDocWidth) && parsedDocWidth > 0
        ? parsedDocWidth
        : 800;
  const height =
    Number.isFinite(parsedAssetHeight) && parsedAssetHeight > 0
      ? parsedAssetHeight
      : Number.isFinite(parsedDocHeight) && parsedDocHeight > 0
        ? parsedDocHeight
        : 600;

  const tileSrc = getTileSrcByMediaCandidates([
    mediaAsset.name,
    mediaAsset.displayName,
    mediaAsset.alt,
    fileUrl,
    mediaAsset.assetUrl,
    mediaAsset.assetRef,
  ]);

  return {
    // Use Sanity document id as the stable identity for React keys/state.
    // orderRank can change and may not be globally unique in all states.
    id: mediaAsset._id || orderValue,
    type: mediaAsset.type,
    src: fileUrl || "",
    tileSrc: tileSrc || fileUrl || "",
    name: mediaAsset.name,
    alt: mediaAsset.alt || mediaAsset.name,
    displayName: mediaAsset.displayName || "",
    projectDescription: mediaAsset.projectDescription || "",
    width,
    height,
    invertColor: mediaAsset.invertColor === "yes",
    projectTypes: Array.isArray(mediaAsset.projectTypes)
      ? mediaAsset.projectTypes.map(normalizeProjectType)
      : [],
    orderRank: orderValue, // Also include orderRank for reference
  };
}
