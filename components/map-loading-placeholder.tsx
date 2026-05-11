type MapLoadingPlaceholderProps = {
  className?: string;
  label?: string;
  compact?: boolean;
};

export function MapLoadingPlaceholder({
  className = "",
  label = "Preparando mapa...",
  compact = false,
}: MapLoadingPlaceholderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative isolate flex ${compact ? "h-[280px]" : "h-[360px] sm:h-[460px]"} overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[linear-gradient(180deg,var(--surface)_0%,var(--surface-strong)_100%)] ${className}`.trim()}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.42),transparent)] motion-safe:animate-pulse" />
      <div className="m-auto flex flex-col items-center gap-3 text-center text-sm text-[color:var(--text-muted)]">
        <span className="h-10 w-10 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] soft-shadow" />
        <span>{label}</span>
      </div>
    </div>
  );
}
