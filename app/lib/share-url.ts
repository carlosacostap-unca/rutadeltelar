export const SOCIAL_PREVIEW_REVISION = "20260807-2";

export function createShareUrl(value: string, baseUrl: string) {
  const url = new URL(value, baseUrl);
  url.searchParams.set("compartir", SOCIAL_PREVIEW_REVISION);
  return url.toString();
}
