import {
  getArtisansResult,
  getExperiencesResult,
  getHighlightSpotsResult,
  getProductsResult,
  getStationsResult,
} from "@/app/lib/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const expectedToken = process.env.RUTA_EXPO_PREPARE_TOKEN;
  if (!expectedToken || request.headers.get("x-expo-prepare-token") !== expectedToken) {
    return new Response("Not found", { status: 404 });
  }

  const [stations, artisans, products, experiences, highlightSpots] = await Promise.all([
    getStationsResult(),
    getArtisansResult(),
    getProductsResult(),
    getExperiencesResult(),
    getHighlightSpotsResult(),
  ]);
  const results = { stations, artisans, products, experiences, highlightSpots };
  const invalid = Object.entries(results).filter(([, result]) => result.source !== "pocketbase");

  if (invalid.length > 0) {
    return Response.json(
      {
        ok: false,
        error: "PocketBase did not provide every exhibition collection",
        details: invalid.map(([key, result]) => ({ key, source: result.source, error: result.error })),
      },
      { status: 503 },
    );
  }

  return Response.json({
    ok: true,
    data: Object.fromEntries(
      Object.entries(results).map(([key, result]) => [key, result.items]),
    ),
  });
}
