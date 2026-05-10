type MediaFallbackProps = {
  label?: string;
  className?: string;
};

export function MediaFallback({
  label = "Ruta del Telar",
  className = "",
}: MediaFallbackProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#c4896a_0%,#f3d2a3_52%,#7c6a35_100%)] text-center text-[11px] font-semibold uppercase tracking-wider text-white ${className}`}
    >
      <span className="max-w-[80%] rounded-full bg-black/15 px-3 py-1">
        {label}
      </span>
    </div>
  );
}
