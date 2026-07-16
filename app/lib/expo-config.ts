export const EXPO_OFFLINE_ENV = "RUTA_EXPO_OFFLINE";

export function isExpoOffline() {
  return process.env[EXPO_OFFLINE_ENV]?.trim().toLowerCase() === "true";
}

export type PublicRuntimeMode = {
  expoOffline: boolean;
};

export function getPublicRuntimeMode(): PublicRuntimeMode {
  return { expoOffline: isExpoOffline() };
}
