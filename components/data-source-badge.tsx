type DataSourceBadgeProps = {
  source: "pocketbase" | "mock";
  error?: string;
};

export function DataSourceBadge({
  source,
  error,
}: DataSourceBadgeProps) {
  const shouldShow =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_SHOW_DATA_SOURCE_BADGE === "true";
  const isPocketBase = source === "pocketbase";

  if (!shouldShow) {
    return null;
  }

  if (isPocketBase && !error) {
    return null;
  }

  return (
    <div
      className={`inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border px-3 py-2 text-xs ${
        isPocketBase
          ? "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--secondary)]"
          : "border-[rgba(138,69,43,0.2)] bg-[rgba(138,69,43,0.07)] text-[color:var(--accent-strong)]"
      }`}
    >
      <span className="font-semibold uppercase tracking-wider">
        {isPocketBase ? "Datos conectados" : "Fallback local"}
      </span>
      {error ? <span className="truncate">({error})</span> : null}
    </div>
  );
}
