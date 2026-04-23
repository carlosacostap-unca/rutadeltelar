"use client";

import { useState } from "react";

type ShareButtonProps = {
  title: string;
  text?: string;
};

export function ShareButton({ title, text }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // usuario canceló o no compatible — fallback a clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
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
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-2 text-sm font-semibold text-[color:var(--foreground)] transition hover:-translate-y-0.5 hover:border-[color:var(--accent)] active:scale-95"
    >
      {copied ? (
        <>
          <svg className="h-4 w-4 text-[color:var(--accent)]" viewBox="0 0 24 24" fill="none">
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
          Compartir
        </>
      )}
    </button>
  );
}
