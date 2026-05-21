type HighlightedDataProps = {
  value?: string;
  compact?: boolean;
  className?: string;
};

export function HighlightedData({
  value,
  compact = false,
  className = "",
}: HighlightedDataProps) {
  const text = value?.trim();

  if (!text) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border border-[rgba(138,69,43,0.22)] bg-[rgba(138,69,43,0.07)] px-3 py-2 ${className}`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--accent)]">
        Dato destacado
      </p>
      <p
        className={`mt-0.5 font-medium text-[color:var(--foreground)] ${
          compact ? "text-xs leading-5 line-clamp-2" : "text-sm leading-6"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
