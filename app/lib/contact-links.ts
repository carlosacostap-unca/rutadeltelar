type ActorContactLinkInput = {
  facebook_url?: string;
  instagram_url?: string;
  pagina_web_url?: string;
};

export type ActorSocialLink = {
  label: "Facebook" | "Instagram" | "Página web";
  href: string;
  target: "_blank";
  rel: "noopener noreferrer";
};

function cleanUrl(value?: string) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getActorSocialLinks({
  facebook_url,
  instagram_url,
  pagina_web_url,
}: ActorContactLinkInput): ActorSocialLink[] {
  return [
    { label: "Facebook", href: cleanUrl(facebook_url) },
    { label: "Instagram", href: cleanUrl(instagram_url) },
    { label: "Página web", href: cleanUrl(pagina_web_url) },
  ]
    .filter((link): link is { label: ActorSocialLink["label"]; href: string } =>
      Boolean(link.href),
    )
    .map((link) => ({
      ...link,
      target: "_blank",
      rel: "noopener noreferrer",
    }));
}
