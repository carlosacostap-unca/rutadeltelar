type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--accent-mid)]">
        {eyebrow}
      </p>
      <h2 className="display-font text-[2rem] leading-tight text-[color:var(--foreground)]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-sm leading-relaxed text-[color:var(--text-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
