"use client";

import { getActorSocialLinks } from "@/app/lib/contact-links";
import { getSatelliteMapUrl, type MapPoint } from "@/app/lib/map-links";
import { useExpoMode } from "@/components/expo-mode-provider";

type ContactButtonsProps = {
  phone?: string;
  email?: string;
  address?: string;
  mapPoint?: MapPoint;
  facebook_url?: string;
  instagram_url?: string;
  pagina_web_url?: string;
};

type ContactIconType =
  | "whatsapp"
  | "phone"
  | "email"
  | "map"
  | "facebook"
  | "instagram"
  | "web";

const contactChipClass =
  "inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-[#123a55]/15 bg-white/70 px-3.5 py-2 text-left text-sm font-black leading-tight text-[#082d49] shadow-sm transition [overflow-wrap:anywhere] hover:-translate-y-0.5 hover:border-[#123a55]/35 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#123a55]/30";

const contactIconClass =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#123a55] text-[#efd4b0]";

function cleanPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function ContactIcon({ type }: { type: ContactIconType }) {
  if (type === "whatsapp") {
    return (
      <span className={contactIconClass} aria-hidden="true">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.69.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35Z" />
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.89.53 3.66 1.44 5.17L2 22l4.98-1.3A9.96 9.96 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.96 7.96 0 0 1-4.08-1.12l-.29-.17-3.03.8.81-2.96-.19-.3A7.96 7.96 0 0 1 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8Z" />
        </svg>
      </span>
    );
  }

  if (type === "facebook") {
    return (
      <span className={contactIconClass} aria-hidden="true">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.2 8.2V6.9c0-.65.43-.8.74-.8h1.88V3.28L14.24 3.27c-2.86 0-3.51 2.14-3.51 3.51V8.2H8.92v2.91h1.81V19h3.09v-7.89h2.58l.35-2.91h-2.55Z" />
        </svg>
      </span>
    );
  }

  if (type === "instagram") {
    return (
      <span className={contactIconClass} aria-hidden="true">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <rect x="5" y="5" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path d="M16.4 7.8h.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
        </svg>
      </span>
    );
  }

  if (type === "email") {
    return (
      <span className={contactIconClass} aria-hidden="true">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16v12H4V6Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          <path d="m5 7 7 6 7-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </span>
    );
  }

  if (type === "map") {
    return (
      <span className={contactIconClass} aria-hidden="true">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <path d="M12 21s6-6.2 6-11a6 6 0 1 0-12 0c0 4.8 6 11 6 11Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.8" />
          <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
    );
  }

  if (type === "web") {
    return (
      <span className={contactIconClass} aria-hidden="true">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M4.5 12h15M12 4.5c2 2.1 3 4.6 3 7.5s-1 5.4-3 7.5c-2-2.1-3-4.6-3-7.5s1-5.4 3-7.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </span>
    );
  }

  return (
    <span className={contactIconClass} aria-hidden="true">
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11l-.94.95a16 16 0 0 0 6 6l.86-.85a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7a2 2 0 0 1 1.72 2.03Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      </svg>
    </span>
  );
}

function getSocialIconType(label: string): ContactIconType {
  if (label === "Facebook") return "facebook";
  if (label === "Instagram") return "instagram";
  return "web";
}

export function ContactButtons({
  phone,
  email,
  address,
  mapPoint,
  facebook_url,
  instagram_url,
  pagina_web_url,
}: ContactButtonsProps) {
  const { expoOffline } = useExpoMode();
  const socialLinks = expoOffline ? [] : getActorSocialLinks({
    facebook_url,
    instagram_url,
    pagina_web_url,
  });
  const addressMapUrl = !expoOffline && mapPoint ? getSatelliteMapUrl(mapPoint) : null;

  if (!phone && !email && !address && socialLinks.length === 0) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {phone && !expoOffline ? (
        <a
          href={`https://wa.me/${cleanPhone(phone)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={contactChipClass}
        >
          <ContactIcon type="whatsapp" />
          WhatsApp
        </a>
      ) : null}

      {phone ? (
        <a href={`tel:${phone}`} className={contactChipClass}>
          <ContactIcon type="phone" />
          Llamar
        </a>
      ) : null}

      {email ? (
        <a href={`mailto:${email}`} className={contactChipClass}>
          <ContactIcon type="email" />
          {email}
        </a>
      ) : null}

      {address && addressMapUrl ? (
        <a
          href={addressMapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={contactChipClass}
        >
          <ContactIcon type="map" />
          {address}
        </a>
      ) : null}

      {address && !addressMapUrl ? (
        <span className={contactChipClass}>
          <ContactIcon type="map" />
          {address}
        </span>
      ) : null}

      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target={link.target}
          rel={link.rel}
          className={contactChipClass}
        >
          <ContactIcon type={getSocialIconType(link.label)} />
          {link.label}
        </a>
      ))}
    </div>
  );
}
