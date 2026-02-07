import { NextResponse } from "next/server";
import { client } from "../../../../sanity/lib/client";
import {
  mediaAssetByNameQuery,
  mediaAssetsQuery,
} from "../../../../sanity/lib/queries";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  try {
    const data = name
      ? await client.fetch(mediaAssetByNameQuery, { name })
      : await client.fetch(mediaAssetsQuery);

    return NextResponse.json(data ?? (name ? null : []));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch media assets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
