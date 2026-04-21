import { agenda } from "@/app/lib/content";
import { SectionHeading } from "@/components/section-heading";
import { SurfaceCard } from "@/components/surface-card";

const reservationStates = [
  { label: "Cupos disponibles", value: "08" },
  { label: "Salidas guiadas", value: "03" },
  { label: "Eventos destacados", value: "06" },
];

export default function AgendaPage() {
  return (
    <main className="flex flex-1 flex-col">
      <header className="mb-8">
        <SectionHeading
          eyebrow="Agenda"
          title="Talleres, visitas y fechas clave"
          description="Pantalla preparada para reservas, estados de cupo y recordatorios."
        />
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {reservationStates.map((item) => (
          <SurfaceCard key={item.label} className="p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
              {item.label}
            </p>
            <p className="display-font mt-2 text-4xl text-[color:var(--accent)]">
              {item.value}
            </p>
          </SurfaceCard>
        ))}
      </section>

      <section className="mt-12 grid gap-4">
        {agenda.map((item) => (
          <SurfaceCard key={item.title} className="soft-shadow">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[color:var(--accent)]">
                  {item.day}
                </p>
                <h2 className="mt-3 text-xl font-semibold text-[color:var(--foreground)]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  {item.meta}
                </p>
              </div>
              <button className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:bg-[color:var(--accent-strong)]">
                Reservar
              </button>
            </div>
          </SurfaceCard>
        ))}
      </section>
    </main>
  );
}
