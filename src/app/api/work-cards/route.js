import { NextResponse } from "next/server";
import { client } from "../../../../sanity/lib/client";
import { workCardsQuery } from "../../../../sanity/lib/queries";
import fallbackWorkCards from "../../work/work-cards-fallback.json";

export const revalidate = 300;

function normalizeLookup(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

const fallbackMediaById = new Map(
  fallbackWorkCards
    .filter(
      (card) =>
        card &&
        typeof card._id === "string" &&
        typeof card.mediaUrl === "string" &&
        card.mediaUrl.length > 0,
    )
    .map((card) => [card._id, card.mediaUrl]),
);

const fallbackMediaByTitle = new Map(
  fallbackWorkCards
    .filter(
      (card) =>
        card &&
        typeof card.title === "string" &&
        typeof card.mediaUrl === "string" &&
        card.mediaUrl.length > 0,
    )
    .map((card) => [normalizeLookup(card.title), card.mediaUrl]),
);

function attachTileMedia(cards) {
  return cards.map((card) => {
    const tileMediaUrl =
      fallbackMediaById.get(card._id) ||
      fallbackMediaByTitle.get(normalizeLookup(card.title)) ||
      card.mediaUrl ||
      "";

    return {
      ...card,
      tileMediaUrl,
    };
  });
}

export async function GET() {
  try {
    const data = await client.withConfig({ useCdn: true }).fetch(workCardsQuery);
    const cards = attachTileMedia(
      Array.isArray(data) && data.length > 0 ? data : fallbackWorkCards,
    );
    return NextResponse.json(cards, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    if (Array.isArray(fallbackWorkCards) && fallbackWorkCards.length > 0) {
      return NextResponse.json(attachTileMedia(fallbackWorkCards), {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
          "X-Content-Fallback": "work-cards-json",
        },
      });
    }

    const message =
      error instanceof Error ? error.message : "Failed to fetch work cards";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
