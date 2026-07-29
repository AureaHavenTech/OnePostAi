/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Performance ──────────────────────
  eslint: { ignoreDuringBuilds: true },
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2678400, // 31 days
  },

  // Strip console.logs in production (keep error/warn)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // CSS optimization + selective imports
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // ── Headers for all routes ──────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/(.*)\\.(js|css|svg|png|jpg|jpeg|gif|ico|woff2?)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ── Redirects ───────────────────────
  async redirects() {
    return [
      {
        source: "/dashboard/schedule",
        destination: "/dashboard/calendar",
        permanent: true,
      },
    ];
  },

  // ── Bundle analysis (opt-in) ────────
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false, net: false, tls: false };
    }
    return config;
  },
};

export default nextConfig;
