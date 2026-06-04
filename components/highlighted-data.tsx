type HighlightedDataProps = {
  value?: string;
  compact?: boolean;
  className?: string;
  variant?: "default" | "onDark";
};

export function HighlightedData({
  value,
  compact = false,
  className = "",
  variant = "default",
}: HighlightedDataProps) {
  const text = value?.trim();

  if (!text) {
    return null;
  }

  const onDark = variant === "onDark";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.15rem] border px-4 py-3 shadow-sm ${
        onDark
          ? "border-[#efd4b0]/40 bg-[rgba(239,212,176,0.12)] text-[#f3d7b4]"
          : "border-[#8a452b]/20 bg-[rgba(138,69,43,0.08)] text-[#123a55]"
      } ${className}`}
    >
      <div
        className={`pointer-events-none absolute inset-y-3 left-0 w-1 rounded-r-full ${
          onDark ? "bg-[#efd4b0]" : "bg-[#8a452b]"
        }`}
      />
      <div className="flex gap-3">
        <span
          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
            onDark
              ? "border-[#efd4b0]/45 bg-[#efd4b0]/15 text-[#efd4b0]"
              : "border-[#8a452b]/20 bg-white/55 text-[#8a452b]"
          }`}
          aria-hidden="true"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 3.75 14.43 8.8l5.57.8-4.03 3.92.95 5.54L12 16.45l-4.92 2.61.95-5.54L4 9.6l5.57-.8L12 3.75Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.8"
            />
          </svg>
        </span>
        <div>
          <p
            className={`text-[0.68rem] font-black uppercase leading-none tracking-normal ${
              onDark ? "text-[#efd4b0]" : "text-[#8a452b]"
            }`}
          >
            Dato destacado
          </p>
          <p
            className={`mt-1.5 font-semibold ${
              compact ? "line-clamp-2 text-xs leading-5" : "text-sm leading-6"
            } ${onDark ? "text-white/90" : "text-[#123a55]"}`}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}
