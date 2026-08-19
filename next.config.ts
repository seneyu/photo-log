import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vjvowgcslettxibookoq.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/photo-uploads/**",
      },
    ],
  },
};

export default nextConfig;
