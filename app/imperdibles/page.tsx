import { getHighlightSpotsResult } from "@/app/lib/data";
import { DataSourceBadge } from "@/components/data-source-badge";
import { ImperdiblesClient } from "@/components/imperdibles-client";
import { SectionHeading } from "@/components/section-heading";

export default async function ImperdiblesPage() {
  const highlightSpotsResult = await getHighlightSpotsResult();
  const spots = highlightSpotsResult.items;

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const hasUpcoming = spots.some((s) => {
    if (s.type.toLowerCase() !== "evento" || !s.eventDate) return false;
    const d = new Date(s.eventDate);
    return d >= now && d <= in30;
  });

  // Tipos de imperdibles atemporales (sin "evento")
  const types = [
    ...new Set(
      spots
        .filter((s) => s.type.toLowerCase() !== "evento")
        .map((s) => s.type)
        .filter(Boolean),
    ),
  ].sort();

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-6">
        <SectionHeading
          eyebrow="Imperdibles"
          title="Atractivos, actividades y eventos"
          description="La agenda de eventos próximos y los atractivos atemporales que no podés perderte en la ruta."
        />
        <div className="mt-4">
          <DataSourceBadge
            source={highlightSpotsResult.source}
            error={highlightSpotsResult.error}
          />
        </div>
      </header>

      <ImperdiblesClient spots={spots} types={types} hasUpcoming={hasUpcoming} />
    </main>
  );
}

