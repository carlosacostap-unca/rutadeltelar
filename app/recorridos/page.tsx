import Link from "next/link";
import { getSuggestedJourneys } from "@/app/lib/data";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

export default async function RecorridosPage() {
  const journeys = await getSuggestedJourneys();

  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Recorridos"
          title="Itinerarios sugeridos"
          description="Composiciones narrativas que combinan estacion, experiencias, actores e imperdibles de la ruta."
        />
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {journeys.map((journey) => (
          <SurfaceCard key={journey.slug} className="soft-shadow">
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--accent)]">
              {journey.station.locality}
            </p>
            <h2 className="display-font mt-3 text-3xl text-[color:var(--foreground)]">
              {journey.title}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[color:var(--foreground)]">
              {journey.theme}
            </p>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-muted)]">
              {journey.description}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm text-[color:var(--text-muted)]">
              <span>{journey.duration}</span>
              <span>{journey.steps.length} momentos</span>
            </div>
            <Link
              href={`/recorridos/${journey.slug}`}
              className="mt-5 inline-flex rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] hover:-translate-y-0.5 hover:border-[color:var(--accent)]"
            >
              Abrir recorrido
            </Link>
          </SurfaceCard>
        ))}
      </section>
    </main>
  );
}
