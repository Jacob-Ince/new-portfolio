import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

const fallbackMediaDir = path.join(projectRoot, "public", "fallback-media");
const mediaListPath = path.join(projectRoot, "src", "app", "media-list.json");
const workFallbackPath = path.join(
  projectRoot,
  "src",
  "app",
  "work",
  "work-cards-fallback.json",
);
const outputDir = path.join(projectRoot, "reports");
const outputPath = path.join(outputDir, "media-bandwidth-report.md");

const TOP_COUNT = 15;

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function humanBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function isVideoPath(filePath) {
  return /\.(mp4|webm|mov|m4v|ogg)$/i.test(filePath);
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function collectFilesRecursively(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return collectFilesRecursively(fullPath);
      }
      if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        return [
          {
            fullPath,
            relativePath: toPosix(path.relative(projectRoot, fullPath)),
            bytes: stats.size,
          },
        ];
      }
      return [];
    }),
  );
  return nested.flat();
}

function buildReferenceSet(mediaList, workCards) {
  const referenced = new Set();
  const addIfLocal = (value) => {
    if (typeof value !== "string") return;
    if (!value.startsWith("/fallback-media/")) return;
    referenced.add(value.replace(/^\//, ""));
  };

  for (const item of Array.isArray(mediaList) ? mediaList : []) {
    addIfLocal(item?.src);
    addIfLocal(item?.tileSrc);
  }
  for (const card of Array.isArray(workCards) ? workCards : []) {
    addIfLocal(card?.mediaUrl);
    addIfLocal(card?.tileMediaUrl);
  }

  return referenced;
}

function toReferenceKey(projectRelativePath) {
  return projectRelativePath.replace(/^public\//, "");
}

async function main() {
  const [mediaList, workCards] = await Promise.all([
    readJson(mediaListPath),
    readJson(workFallbackPath),
  ]);

  let files = [];
  try {
    files = await collectFilesRecursively(fallbackMediaDir);
  } catch {
    console.log("No fallback media directory found. Run sync-fallbacks:mirror first.");
    return;
  }

  const referencedPaths = buildReferenceSet(mediaList, workCards);
  const rows = files.map((file) => {
    const normalized = toPosix(file.relativePath);
    return {
      ...file,
      referenced: referencedPaths.has(toReferenceKey(normalized)),
      isVideo: isVideoPath(normalized),
    };
  });

  const sorted = [...rows].sort((a, b) => b.bytes - a.bytes);
  const top = sorted.slice(0, TOP_COUNT);
  const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0);
  const videoBytes = rows
    .filter((row) => row.isVideo)
    .reduce((sum, row) => sum + row.bytes, 0);
  const imageBytes = totalBytes - videoBytes;
  const unreferenced = rows.filter((row) => !row.referenced);
  const unreferencedBytes = unreferenced.reduce((sum, row) => sum + row.bytes, 0);

  const lines = [
    "# Media Bandwidth Report",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Summary",
    `- Total mirrored files: ${rows.length}`,
    `- Total size: ${humanBytes(totalBytes)}`,
    `- Video size: ${humanBytes(videoBytes)} (${((videoBytes / Math.max(totalBytes, 1)) * 100).toFixed(1)}%)`,
    `- Image size: ${humanBytes(imageBytes)} (${((imageBytes / Math.max(totalBytes, 1)) * 100).toFixed(1)}%)`,
    `- Unreferenced files: ${unreferenced.length} (${humanBytes(unreferencedBytes)})`,
    "",
    "## Top Offenders",
    "| Rank | Size | Type | Referenced | File |",
    "| --- | ---: | --- | --- | --- |",
    ...top.map(
      (row, index) =>
        `| ${index + 1} | ${humanBytes(row.bytes)} | ${row.isVideo ? "video" : "image"} | ${row.referenced ? "yes" : "no"} | \`${row.relativePath}\` |`,
    ),
    "",
    "## Largest Unreferenced Files",
    "| Rank | Size | Type | File |",
    "| --- | ---: | --- | --- |",
    ...unreferenced
      .sort((a, b) => b.bytes - a.bytes)
      .slice(0, 10)
      .map(
        (row, index) =>
          `| ${index + 1} | ${humanBytes(row.bytes)} | ${row.isVideo ? "video" : "image"} | \`${row.relativePath}\` |`,
      ),
    "",
  ];

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");

  console.log(`Wrote ${path.relative(projectRoot, outputPath)}`);
  console.log(`Total mirrored size: ${humanBytes(totalBytes)}`);
  if (top[0]) {
    console.log(`Largest file: ${top[0].relativePath} (${humanBytes(top[0].bytes)})`);
  }
}

main().catch((error) => {
  console.error("Failed to generate media report:", error.message);
  process.exit(1);
});
