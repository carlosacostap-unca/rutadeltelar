import type { Metadata } from "next";
import localFont from "next/font/local";
import { getPublicRuntimeMode } from "@/app/lib/expo-config";
import { getSiteUrl } from "@/app/lib/metadata";
import { AppShell } from "@/components/app-shell";
import { ExpoModeProvider } from "@/components/expo-mode-provider";
import "./globals.css";

const neueHaasDisplay = localFont({
  variable: "--font-neue-haas-display",
  display: "swap",
  src: [
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-XThin.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-XThinItalic.ttf",
      weight: "100",
      style: "italic",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-Thin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-ThinItalic.ttf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-LightItalic.ttf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-Roman.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-RomanItalic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-Mediu.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../public/fonts/neue-haas-display/NeueHaasDisplay-BlackItalic.ttf",
      weight: "900",
      style: "italic",
    },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Ruta del Telar",
    template: "%s | Ruta del Telar",
  },
  description:
    "Descubri estaciones, experiencias, talleres y comunidades textiles de Catamarca.",
  openGraph: {
    title: "Ruta del Telar",
    description:
      "Descubri estaciones, experiencias, talleres y comunidades textiles de Catamarca.",
    locale: "es_AR",
    siteName: "Ruta del Telar",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const runtimeMode = getPublicRuntimeMode();

  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${neueHaasDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ExpoModeProvider value={runtimeMode}>
          <AppShell>{children}</AppShell>
        </ExpoModeProvider>
      </body>
    </html>
  );
}
