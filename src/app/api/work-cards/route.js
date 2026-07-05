import { NextResponse } from "next/server";
import { client } from "../../../../sanity/lib/client";
import { workCardsQuery } from "../../../../sanity/lib/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const data = await client.withConfig({ useCdn: false }).fetch(workCardsQuery);
    return NextResponse.json(data ?? []);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch work cards";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
