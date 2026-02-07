import { groq } from "next-sanity";

// Get all media assets, ordered by display order
export const mediaAssetsQuery = groq`
  *[_type == "mediaAsset"] | order(orderRank asc) {
    _id,
    name,
    type,
    asset,
    "assetUrl": coalesce(asset.asset->url, asset->url),
    "assetRef": coalesce(asset.asset._ref, asset._ref),
    alt,
    displayName,
    width,
    height,
    invertColor,
    projectTypes,
    orderRank
  }
`;

// Get a single media asset by name
export const mediaAssetByNameQuery = groq`
  *[_type == "mediaAsset" && name == $name][0] {
    _id,
    name,
    type,
    asset,
    "assetUrl": coalesce(asset.asset->url, asset->url),
    "assetRef": coalesce(asset.asset._ref, asset._ref),
    alt,
    displayName,
    width,
    height,
    invertColor,
    projectTypes,
    orderRank
  }
`;
