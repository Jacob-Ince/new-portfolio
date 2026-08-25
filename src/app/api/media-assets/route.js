import { NextResponse } from "next/server";
import { client } from "../../../../sanity/lib/client";
import {
  mediaAssetByNameQuery,
  mediaAssetsQuery,
} from "../../../../sanity/lib/queries";
import fallbackMediaList from "../../media-list.json";

export const revalidate = 300;

function normalizeName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

const fallbackTileSrcByName = new Map(
  fallbackMediaList
    .filter(
      (asset) =>
        asset &&
        typeof asset.name === "string" &&
        typeof asset.src === "string" &&
        asset.src.length > 0,
    )
    .map((asset) => [normalizeName(asset.name), asset.src]),
);

function attachTileSrc(asset) {
  if (!asset || typeof asset !== "object") return asset;
  const tileSrc = fallbackTileSrcByName.get(normalizeName(asset.name));
  return {
    ...asset,
    tileSrc: tileSrc || asset.tileSrc || asset.assetUrl || asset.src || "",
  };
}

function getFallbackMediaAssetByName(name) {
  const normalizedTarget = normalizeName(name);
  if (!normalizedTarget) return null;

  return (
    fallbackMediaList.find((asset) => {
      const candidateNames = [
        asset?.name,
        asset?.displayName,
        typeof asset?.src === "string" ? decodeURIComponent(asset.src.split("/").pop() || "") : "",
      ];
      return candidateNames.some(
        (candidate) => normalizeName(candidate) === normalizedTarget,
      );
    }) ?? null
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  try {
    const cachedClient = client.withConfig({ useCdn: true });
    const data = name
      ? await cachedClient.fetch(mediaAssetByNameQuery, { name })
      : await cachedClient.fetch(mediaAssetsQuery);
    const payload = Array.isArray(data)
      ? data.map(attachTileSrc)
      : data
        ? attachTileSrc(data)
        : name
          ? null
          : [];

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    const fallbackData = name
      ? attachTileSrc(getFallbackMediaAssetByName(name))
      : fallbackMediaList.map(attachTileSrc);

    if (fallbackData) {
      return NextResponse.json(fallbackData, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          "X-Content-Fallback": "media-list-json",
        },
      });
    }

    const message =
      error instanceof Error ? error.message : "Failed to fetch media assets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
