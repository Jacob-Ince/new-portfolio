// Fetch all media assets
export async function getAllMediaAssets() {
  try {
    const response = await fetch("/api/media-assets", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Media assets request failed: ${response.status}`);
    }
    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error("Error fetching media assets:", error);
    return [];
  }
}

// Fetch a single media asset by name
export async function getMediaAssetByName(name) {
  try {
    const response = await fetch(
      `/api/media-assets?name=${encodeURIComponent(name)}`,
      { cache: "no-store" }
    );
    if (!response.ok) {
      throw new Error(`Media asset request failed: ${response.status}`);
    }
    const data = await response.json();
    return data || null;
  } catch (error) {
    console.error("Error fetching media asset:", error);
    return null;
  }
}

// Transform Sanity media asset to match the old media-list.json format
export function transformSanityMedia(mediaAsset) {
  if (!mediaAsset) return null;

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

  return {
    id: orderValue, // Keep orderRank as id for sorting purposes
    type: mediaAsset.type,
    src: fileUrl || "",
    name: mediaAsset.name,
    alt: mediaAsset.alt || mediaAsset.name,
    displayName: mediaAsset.displayName || "",
    width: mediaAsset.width,
    height: mediaAsset.height,
    invertColor: mediaAsset.invertColor === "yes",
    projectTypes: mediaAsset.projectTypes || [],
    orderRank: orderValue, // Also include orderRank for reference
  };
}
