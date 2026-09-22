import type { NextConfig } from "next";

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
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...supabaseImageHosts(),
    ],
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
