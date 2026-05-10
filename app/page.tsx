import Image from "next/image";
import Link from "next/link";
import {
  getArtisansResult,
  getHighlightSpotsResult,
  getProductsResult,
  getStationsResult,
} from "@/app/lib/data";
import { HomeCarousel } from "@/components/home-carousel";
import { PbImage } from "@/components/pb-image";
import { SurfaceCard } from "@/components/surface-card";

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
}

export default async function Home() {
  const now = new Date();
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [stationsResult, artisansResult, productsResult, highlightSpotsResult] =
    await Promise.all([
      getStationsResult(),
      getArtisansResult(),
      getProductsResult(),
      getHighlightSpotsResult(),
    ]);

  const stations = stationsResult.items;
  const products = productsResult.items;

  // Artesanos: solo tipo artesano
  const artisans = artisansResult.items.filter((a) =>
    (a.actorType ?? "artesano").toLowerCase().includes("artesan"),
  );

  // Próximos imperdibles: tipo evento con fecha en próximos 30 días
  const upcomingEvents = highlightSpotsResult.items
    .filter((s) => {
      if (s.type.toLowerCase() !== "evento" || !s.eventDate) return false;
      const d = new Date(s.eventDate);
      return d >= now && d <= in30days;
    })
    .sort((a, b) => new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime());

  return (
    <main className="flex flex-1 flex-col">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#a85d41_0%,#8a452b_100%)]">
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50">
              Ruta del Telar · Catamarca
            </p>
            <h1 className="display-font mt-4 text-5xl leading-[1.1] text-white sm:text-6xl">
              El tejido
              <br />
              como camino
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
              Un recorrido cultural por comunidades artesanas de Catamarca donde
              el telar es identidad, oficio y territorio vivo.
            </p>
          </div>
          {/* decoración textil abstracta */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-1/3 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.03)_0px,rgba(255,255,255,0.03)_2px,transparent_2px,transparent_12px)]"
          />
        </div>
      </section>

      {/* ── Próximos imperdibles ───────────────────────────────── */}
      {upcomingEvents.length > 0 && (
        <section className="mb-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                Agenda
              </p>
              <h2 className="display-font mt-1 text-2xl leading-tight text-[color:var(--foreground)]">
                Próximos imperdibles
              </h2>
            </div>
            <Link
              href="/imperdibles"
              className="text-sm font-semibold text-[color:var(--accent)] transition hover:underline"
            >
              Ver agenda →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingEvents.map((event) => (
              <Link
                key={event.slug}
                href={`/imperdibles/${event.slug}`}
                className="group"
              >
                <SurfaceCard className="soft-shadow flex items-center gap-4 transition group-hover:border-[color:var(--accent)]">
                  {event.eventDate && (
                    <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[color:var(--accent)] py-3 text-white">
                      <span className="text-xs font-semibold uppercase leading-none">
                        {new Date(event.eventDate).toLocaleDateString("es-AR", { month: "short" })}
                      </span>
                      <span className="display-font mt-0.5 text-2xl font-bold leading-none">
                        {new Date(event.eventDate).getDate()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                      {event.location}
                      {event.eventDate && ` · ${formatEventDate(event.eventDate)}`}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-[color:var(--foreground)] group-hover:text-[color:var(--accent)]">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-xs text-[color:var(--text-muted)] line-clamp-1">
                      {event.subtitle}
                    </p>
                  </div>
                  {event.imageUrl && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="64px" />
                    </div>
                  )}
                </SurfaceCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Explorá las estaciones ────────────────────────────── */}
      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
              Territorio
            </p>
            <h2 className="display-font mt-1 text-2xl leading-tight text-[color:var(--foreground)]">
              Explorá las estaciones
            </h2>
          </div>
          <Link
            href="/estaciones"
            className="text-sm font-semibold text-[color:var(--accent)] transition hover:underline"
          >
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {stations.map((station) => (
            <Link
              key={station.slug}
              href={`/estaciones/${station.slug}`}
              className="group"
            >
              <SurfaceCard className="soft-shadow overflow-hidden !p-0 transition group-hover:border-[color:var(--accent)]">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl">
                  {station.imageUrl ? (
                    <PbImage
                      src={station.imageUrl}
                      alt={station.name}
                      fill
                      className="object-cover transition group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 50vw, 33vw"
                      fallback={
                        <div className="flex h-full items-center justify-center bg-[linear-gradient(160deg,#c4896a_0%,#8a452b_100%)] text-xs font-semibold uppercase tracking-wider text-white">
                          Estacion
                        </div>
                      }
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(160deg,#c4896a_0%,#8a452b_100%)] text-4xl">
                      🗺️
                    </div>
                  )}
                  {station.hasInauguratedStation && (
                    <span className="absolute left-2 top-2 rounded-full bg-[color:var(--accent)] px-2 py-0.5 text-[10px] font-semibold text-white">
                      Inaugurada
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--text-muted)]">
                    {station.department ?? station.locality}
                  </p>
                  <h3 className="mt-0.5 text-sm font-semibold leading-snug text-[color:var(--foreground)]">
                    {station.locality}
                  </h3>
                </div>
              </SurfaceCard>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Productos destacados ──────────────────────────────── */}
      <HomeCarousel eyebrow="Artesanía" title="Productos destacados" href="/productos">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/productos/${product.slug}`}
            className="group w-[220px] shrink-0 [scroll-snap-align:start]"
          >
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {product.imageUrl ? (
                <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="220px"
                  />
                </div>
              ) : (
                <div className="mb-3 flex aspect-square items-center justify-center rounded-xl bg-[color:var(--surface)] text-4xl">
                  🧵
                </div>
              )}
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
                {product.subcategory ?? product.category}
              </p>
              <h3 className="mt-1 text-sm font-semibold leading-snug text-[color:var(--foreground)]">
                {product.name}
              </h3>
              {product.techniques.length > 0 && (
                <p className="mt-1 text-[10px] text-[color:var(--text-muted)]">
                  {product.techniques.slice(0, 2).join(" · ")}
                </p>
              )}
            </SurfaceCard>
          </Link>
        ))}
      </HomeCarousel>

      {/* ── Conocé a los artesanos ────────────────────────────── */}
      <HomeCarousel eyebrow="Comunidad" title="Conocé a los artesanos" href="/artesanas">
        {artisans.map((actor) => (
          <Link
            key={actor.slug}
            href={`/artesanas/${actor.slug}`}
            className="group w-[200px] shrink-0 [scroll-snap-align:start]"
          >
            <SurfaceCard className="soft-shadow h-full transition group-hover:border-[color:var(--accent)]">
              {actor.imageUrl ? (
                <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-full border-2 border-[color:var(--border)]">
                  <Image
                    src={actor.imageUrl}
                    alt={actor.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="display-font mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--surface)] text-3xl text-[color:var(--accent-strong)]">
                  {actor.name.slice(0, 1)}
                </div>
              )}
              <h3 className="text-sm font-semibold text-[color:var(--foreground)]">
                {actor.name}
              </h3>
              <p className="mt-0.5 text-[10px] font-medium text-[color:var(--accent-mid)]">
                {actor.craft}
              </p>
              <p className="mt-0.5 text-[10px] text-[color:var(--text-muted)]">
                {actor.place}
              </p>
            </SurfaceCard>
          </Link>
        ))}
      </HomeCarousel>
    </main>
  );
}
