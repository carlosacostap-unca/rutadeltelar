"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { isAppleMobileDevice, isInstallDismissed, isStandaloneDisplayMode, PWA_INSTALL_DISMISSAL_KEY } from "@/app/lib/pwa-install";
import { useExpoMode } from "./expo-mode-provider";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const dismiss = () => window.localStorage.setItem(PWA_INSTALL_DISMISSAL_KEY, String(Date.now()));
const subscribeToHydration = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function PwaInstallPrompt() {
  const { expoOffline } = useExpoMode();
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const hydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const eligible = hydrated
    && !expoOffline
    && !isStandaloneDisplayMode(window.matchMedia("(display-mode: standalone)").matches, (navigator as Navigator & { standalone?: boolean }).standalone)
    && !isInstallDismissed(window.localStorage.getItem(PWA_INSTALL_DISMISSAL_KEY));
  const ios = eligible && !dismissed && isAppleMobileDevice(navigator.userAgent, navigator.maxTouchPoints);

  useEffect(() => {
    if (!eligible) return;
    const receive = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    const installedApp = () => { window.localStorage.removeItem(PWA_INSTALL_DISMISSAL_KEY); setPrompt(null); setDismissed(true); };
    window.addEventListener("beforeinstallprompt", receive);
    window.addEventListener("appinstalled", installedApp);
    return () => { window.removeEventListener("beforeinstallprompt", receive); window.removeEventListener("appinstalled", installedApp); };
  }, [eligible]);

  useEffect(() => {
    if (!expoOffline && "serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").then((registration) => registration.update());
  }, [expoOffline]);

  if (!prompt && !ios) return null;
  const close = () => { dismiss(); setPrompt(null); setDismissed(true); };
  const install = async () => { if (!prompt) return; await prompt.prompt(); if ((await prompt.userChoice).outcome === "dismissed") dismiss(); setPrompt(null); };

  return <aside aria-label="Instalar Ruta del Telar" className="fixed inset-x-3 bottom-[calc(5.6rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-3xl border border-[#efd4b0]/40 bg-[#0b3350] p-4 text-[#efd4b0] shadow-2xl md:bottom-6">
    <button type="button" onClick={close} aria-label="Cerrar invitacion de instalacion" className="absolute right-3 top-3 h-9 w-9 rounded-full hover:bg-white/10">×</button>
    <div className="pr-9"><p className="brand-font text-2xl uppercase leading-none">Lleva la ruta contigo</p><p className="mt-2 text-sm leading-5 text-[#efd4b0]/90">{prompt ? "Instala Ruta del Telar para abrirla desde el icono de tu dispositivo." : "En Safari, toca Compartir y elige “Agregar a pantalla de inicio”."}</p></div>
    <div className="mt-4 flex items-center gap-3"><button type="button" onClick={() => void (prompt ? install() : close())} className="rounded-full bg-[#efd4b0] px-4 py-2 text-sm font-semibold text-[#0b3350]">{prompt ? "Instalar aplicacion" : "Entendido"}</button><button type="button" onClick={close} className="text-sm font-medium underline underline-offset-4">Ahora no</button></div>
  </aside>;
}
