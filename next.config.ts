import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [];
const pocketBaseUrl =
  process.env.POCKETBASE_URL ?? process.env.NEXT_PUBLIC_POCKETBASE_URL;

if (pocketBaseUrl) {
  try {
    const url = new URL(pocketBaseUrl);
    remotePatterns.push({
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/api/files/**",
    });
  } catch {
    // Ignore malformed env values; the data layer will still fallback gracefully.
  }
}

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/artesanas",
        destination: "/actores",
        permanent: true,
      },
      {
        source: "/artesanas/:slug",
        destination: "/actores/:slug",
        permanent: true,
      },
    ];
  },
  output: "standalone",
  images: {
    localPatterns: [
      {
        pathname: "/images/**",
        search: "",
      },
      {
        pathname: "/images/home/sponsor-1-ministerio.png",
        search: "?v=20260706",
      },
      {
        pathname: "/expo/media/**",
        search: "",
      },
    ],
    remotePatterns,
    qualities: [75, 90],
  },
};

export default nextConfig;
