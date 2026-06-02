"use client";

import { useState } from "react";

type ShareButtonProps = {
  title: string;
  text?: string;
  label?: string;
  url?: string;
  variant?: "default" | "onDark";
};

export function ShareButton({
  title,
  text,
  label = "Compartir",
  url,
  variant = "default",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const onDark = variant === "onDark";

  async function handleShare() {
    const shareUrl = url ?? window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {
        // usuario canceló o no compatible — fallback a clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard tampoco disponible
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`${label}: ${title}`}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 active:scale-95 ${
        onDark
          ? "border-[#efd4b0]/35 bg-[#efd4b0]/10 text-[#efd4b0] hover:border-[#efd4b0] hover:bg-[#efd4b0] hover:text-[#123a55]"
          : "border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:border-[color:var(--accent)]"
      }`}
    >
      {copied ? (
        <>
          <svg className={`h-4 w-4 ${onDark ? "" : "text-[color:var(--accent)]"}`} viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          ¡Copiado!
        </>
      ) : (
        <>
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
