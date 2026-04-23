"use client";

type Props = {
  title: string;
  description?: string;
  location?: string;
  startIso: string; // UTC ISO string from PocketBase
};

function formatIcsDate(isoString: string): string {
  // Format: YYYYMMDDTHHMMSSZ (UTC)
  return isoString.replace(/[-:]/g, "").replace(/\.\d{3}/, "").replace(" ", "T");
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

export function IcsDownloadButton({ title, description, location, startIso }: Props) {
  const handleDownload = () => {
    const start = formatIcsDate(startIso);

    // Default duration: 2 hours
    const startDate = new Date(startIso);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
    const end = formatIcsDate(endDate.toISOString());

    const uid = `${Date.now()}@rutadeltelar`;
    const now = formatIcsDate(new Date().toISOString());

    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Ruta del Telar//ES",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(title)}`,
      description ? `DESCRIPTION:${escapeIcsText(description)}` : "",
      location ? `LOCATION:${escapeIcsText(location)}` : "",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .filter(Boolean)
      .join("\r\n");

    const blob = new Blob([lines], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-5 py-2.5 text-sm font-semibold text-[color:var(--foreground)] transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      Agregar al calendario
    </button>
  );
}
