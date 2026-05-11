export function RouteLoadingSkeleton() {
  return (
    <main className="flex flex-1 flex-col" aria-busy="true" aria-label="Cargando contenido">
      <section className="mb-8">
        <div className="h-3 w-28 rounded-full bg-[color:var(--surface-strong)] motion-safe:animate-pulse" />
        <div className="mt-4 h-10 w-3/4 max-w-xl rounded-xl bg-[color:var(--surface-strong)] motion-safe:animate-pulse" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded-full bg-[color:var(--surface)] motion-safe:animate-pulse" />
        <div className="mt-2 h-4 w-2/3 max-w-lg rounded-full bg-[color:var(--surface)] motion-safe:animate-pulse" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="aspect-[16/10] rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] motion-safe:animate-pulse" />
        <div className="space-y-3 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-5">
          <div className="h-5 w-2/3 rounded-full bg-[color:var(--surface-strong)] motion-safe:animate-pulse" />
          <div className="h-4 w-full rounded-full bg-[color:var(--surface)] motion-safe:animate-pulse" />
          <div className="h-4 w-5/6 rounded-full bg-[color:var(--surface)] motion-safe:animate-pulse" />
          <div className="h-10 w-40 rounded-full bg-[color:var(--surface-strong)] motion-safe:animate-pulse" />
        </div>
      </section>
    </main>
  );
}
