"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type BackButtonProps = {
  fallbackHref: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

export function BackButton({
  fallbackHref,
  children,
  className,
  ariaLabel,
}: BackButtonProps) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <button type="button" onClick={goBack} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
