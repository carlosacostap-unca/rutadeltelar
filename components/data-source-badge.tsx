type DataSourceBadgeProps = {
  source: "pocketbase" | "mock";
  error?: string;
};

export function DataSourceBadge({
  source,
  error,
}: DataSourceBadgeProps) {
  const isPocketBase = source === "pocketbase";

  if (isPocketBase && !error) {
    return null;
  }

  return (
    <div
      className={`inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-3 py-2 text-xs ${
        isPocketBase
          ? "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--olive)]"
          : "border-[rgba(157,77,46,0.2)] bg-[rgba(157,77,46,0.08)] text-[color:var(--accent-strong)]"
      }`}
    >
      <span className="font-semibold uppercase tracking-[0.16em]">
        {isPocketBase ? "Datos conectados" : "Fallback local"}
      </span>
      {error ? <span className="truncate">({error})</span> : null}
    </div>
  );
}
