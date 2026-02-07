import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  useCdn: true, // Set to false if statically generating pages, using ISR or using the Sanity API with a token
  apiVersion: "2024-01-01", // Use current date (YYYY-MM-DD) to target the latest API version
});
