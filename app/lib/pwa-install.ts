export const PWA_INSTALL_DISMISSAL_KEY = "ruta-del-telar:pwa-install-dismissed-at";
export const PWA_INSTALL_DISMISSAL_MS = 30 * 24 * 60 * 60 * 1000;

export function isAppleMobileDevice(userAgent: string, maxTouchPoints = 0) {
  return /iPad|iPhone|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);
}

export function isStandaloneDisplayMode(
  matchesStandalone: boolean,
  navigatorStandalone: boolean | undefined,
) {
  return matchesStandalone || navigatorStandalone === true;
}

export function isInstallDismissed(value: string | null, now = Date.now()) {
  const dismissedAt = Number(value);
  return Number.isFinite(dismissedAt) && dismissedAt > 0 && now - dismissedAt < PWA_INSTALL_DISMISSAL_MS;
}
