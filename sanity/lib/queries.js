import { groq } from "next-sanity";

// Get all media assets, ordered by display order
export const mediaAssetsQuery = groq`
  *[_type == "mediaAsset" && !(_id in path("drafts.**"))] | order(orderRank asc) {
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
    "assetWidth": coalesce(asset.asset->metadata.dimensions.width, asset->metadata.dimensions.width),
    "assetHeight": coalesce(asset.asset->metadata.dimensions.height, asset->metadata.dimensions.height),
    invertColor,
    projectTypes,
    orderRank
  }
`;

// Get a single media asset by name
export const mediaAssetByNameQuery = groq`
  *[_type == "mediaAsset" && name == $name && !(_id in path("drafts.**"))][0] {
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
    "assetWidth": coalesce(asset.asset->metadata.dimensions.width, asset->metadata.dimensions.width),
    "assetHeight": coalesce(asset.asset->metadata.dimensions.height, asset->metadata.dimensions.height),
    invertColor,
    projectTypes,
    orderRank
  }
`;

// Get all work cards, ordered by display order
export const workCardsQuery = groq`
  *[_type == "workCard" && !(_id in path("drafts.**"))] | order(orderRank asc, _createdAt asc) {
    _id,
    title,
    "categories": coalesce(categories, select(defined(category) => [category], [])),
    media,
    "mediaUrl": coalesce(media.asset->url, media->url),
    "mediaRef": coalesce(media.asset._ref, media._ref),
    "mediaMimeType": coalesce(media.asset->mimeType, media->mimeType),
    mediaAlt,
    orderRank
  }
`;
