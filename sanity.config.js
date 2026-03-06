import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { mediaAssetSchema } from "./sanity/schemas/mediaAsset";
import { structure } from "./sanity/structure";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
  "run4fg82";
const dataset =
  process.env.SANITY_STUDIO_DATASET ||
  process.env.NEXT_PUBLIC_SANITY_DATASET ||
  "production";

export default defineConfig({
  name: "default",
  title: "Grid Portfolio",

  projectId,
  dataset,

  basePath: "/studio",

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: [mediaAssetSchema],
  },
});
