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
      <p className="text-sm uppercase tracking-[0.24em] text-[color:var(--text-muted)]">
        {eyebrow}
      </p>
      <h2 className="display-font text-4xl text-[color:var(--foreground)]">
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-sm leading-6 text-[color:var(--text-muted)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
