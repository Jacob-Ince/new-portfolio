import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { mediaAssetSchema } from "./sanity/schemas/mediaAsset";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "default",
  title: "Grid Portfolio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",

  basePath: "/studio",

  plugins: [structureTool({ structure }), visionTool()],

  schema: {
    types: [mediaAssetSchema],
  },
});
