import WorkPageClient from "./WorkPageClient";
import fallbackCards from "./work-cards-fallback.json";
import { client } from "../../../sanity/lib/client";
import { workCardsQuery } from "../../../sanity/lib/queries";

export const revalidate = 300;

function normalizeLookup(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

const fallbackMediaById = new Map(
  fallbackCards
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
  fallbackCards
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

async function getWorkCardsServer() {
  try {
    const data = await client.withConfig({ useCdn: true }).fetch(workCardsQuery);
    const cards = Array.isArray(data) && data.length > 0 ? data : fallbackCards;
    return attachTileMedia(cards);
  } catch {
    return attachTileMedia(fallbackCards);
  }
}

export default async function WorkPage() {
  const initialCards = await getWorkCardsServer();
  return <WorkPageClient initialCards={initialCards} />;
}
