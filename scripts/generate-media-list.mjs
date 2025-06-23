// scripts/generate-media-list.mjs
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, "..", "public");
const imagesDir = path.join(publicDir, "images");
const videosDir = path.join(publicDir, "videos");
const outputFile = path.join(__dirname, "..", "src", "app", "media-list.json");

// --- IMPORTANT: Placeholder for image/video dimensions ---
// You\'ll need a more robust way to get actual dimensions.
// For images, libraries like 'image-size' can be used.
// For videos, 'ffprobe' (from ffmpeg) or other video libraries are needed.
// For now, we use placeholders.
const getDefaultDimensions = (type) => {
  if (type === "video") {
    return { width: 1280, height: 720 }; // Default for videos
  }
  return { width: 800, height: 600 }; // Default for images/gifs
};
// --- End Placeholder ---

async function getMediaList() {
  const mediaList = [];
  let idCounter = 1;

  // Try to read existing media list to preserve IDs
  let existingMediaList = [];
  try {
    const existingData = await fs.readFile(outputFile, "utf8");
    existingMediaList = JSON.parse(existingData);
  } catch (error) {
    console.log(
      "No existing media list found or error reading it. Starting fresh."
    );
  }

  // Create a map of existing items by src
  const existingItems = new Map(
    existingMediaList.map((item) => [item.src, item])
  );

  try {
    // Process images
    const imageFiles = await fs.readdir(imagesDir);
    for (const file of imageFiles) {
      const ext = path.extname(file).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
        const src = `/images/${file}`;
        const existingItem = existingItems.get(src);
        const dimensions = getDefaultDimensions(
          ext === ".gif" ? "gif" : "image"
        );

        mediaList.push({
          id: existingItem?.id || idCounter++,
          type: ext === ".gif" ? "gif" : "image",
          src,
          alt: file,
          ...dimensions,
        });
      }
    }
  } catch (error) {
    console.warn(
      `Could not read images directory: ${imagesDir}. Skipping images. Error: ${error.message}`
    );
  }

  try {
    // Process videos
    const videoFiles = await fs.readdir(videosDir);
    for (const file of videoFiles) {
      const ext = path.extname(file).toLowerCase();
      if ([".mp4", ".webm", ".ogg"].includes(ext)) {
        const src = `/videos/${file}`;
        const existingItem = existingItems.get(src);
        const dimensions = getDefaultDimensions("video");

        mediaList.push({
          id: existingItem?.id || idCounter++,
          type: "video",
          src,
          alt: file,
          ...dimensions,
        });
      }
    }
  } catch (error) {
    console.warn(
      `Could not read videos directory: ${videosDir}. Skipping videos. Error: ${error.message}`
    );
  }

  // Sort media list by id
  mediaList.sort((a, b) => a.id - b.id);

  try {
    await fs.writeFile(outputFile, JSON.stringify(mediaList, null, 2));
    console.log(`Media list generated successfully at ${outputFile}`);
  } catch (error) {
    console.error(`Error writing media list to ${outputFile}:`, error);
  }
}

getMediaList();
