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

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function toReferenceKey(projectRelativePath) {
  return projectRelativePath.replace(/^public\//, "");
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
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

async function collectFilesRecursively(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return collectFilesRecursively(fullPath);
      }
      if (entry.isFile()) {
        return [fullPath];
      }
      return [];
    }),
  );
  return nested.flat();
}

async function main() {
  const [mediaList, workCards] = await Promise.all([
    readJson(mediaListPath),
    readJson(workFallbackPath),
  ]);
  const referenced = buildReferenceSet(mediaList, workCards);

  let allFiles = [];
  try {
    allFiles = await collectFilesRecursively(fallbackMediaDir);
  } catch {
    console.log("No fallback media directory found.");
    return;
  }

  const filesToDelete = allFiles.filter((fullPath) => {
    const relative = toPosix(path.relative(projectRoot, fullPath));
    return !referenced.has(toReferenceKey(relative));
  });

  await Promise.all(filesToDelete.map((filePath) => fs.unlink(filePath)));
  console.log(`Deleted ${filesToDelete.length} unreferenced fallback media files.`);
}

main().catch((error) => {
  console.error("Failed to prune fallback media:", error.message);
  process.exit(1);
});
