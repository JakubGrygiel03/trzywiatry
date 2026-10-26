import type { NextConfig } from "next";
import { SECURITY_HEADERS } from "./lib/security-headers";

function supabaseImageHosts() {
  const hosts: { protocol: "https"; hostname: string; pathname?: string }[] = [
    { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/object/public/**" },
  ];
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return hosts;
  try {
    hosts.unshift({ protocol: "https", hostname: new URL(raw).hostname });
  } catch {
    /* ignore malformed env */
  }
  return hosts;
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // sharp stays outside each lambda; Vercel provides it for OG/image optimize.
  serverExternalPackages: ["sharp"],
  // Photos are static CDN files — tracing them into every serverless fn
  // multiplied Functions Storage to ~10 GB (134 MB × routes × old deploys).
  outputFileTracingExcludes: {
    "*": [
      "./public/brand/photos/**",
      "./public/brand/chmurki/**",
      "./public/brand/wzory/**",
      "./public/brand/patterns/**",
      "./public/pwa/**",
      "./scripts/**",
      "./.data/**",
      "./tmp-*/**",
      "./node_modules/pdf-to-img/**",
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    qualities: [60, 75, 80],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...supabaseImageHosts(),
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "trzywiatry.vercel.app" }],
        destination: "https://trzywiatry.pl",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "trzywiatry.vercel.app" }],
        destination: "https://trzywiatry.pl/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/mapa.xml", destination: "/sitemap.xml" },
      { source: "/api/pwa/icon-192", destination: "/pwa/icon-192.png" },
      { source: "/api/pwa/icon-512", destination: "/pwa/icon-512.png" },
      { source: "/api/pwa/maskable-icon", destination: "/pwa/maskable-icon.png" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/pwa/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
