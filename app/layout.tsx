import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Serif } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["400", "500", "600"],
  variable: "--font-be-vietnam",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif({
  weight: ["400", "600", "700"],
  variable: "--font-noto-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ruta del Telar",
  description:
    "Aplicacion web mobile-first para descubrir experiencias, talleres y comunidades textiles de la Ruta del Telar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${beVietnamPro.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
