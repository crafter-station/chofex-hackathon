/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  transpilePackages: ["three", "@chofex/challenges-contract"],
  // Decks are compiled at build time from content/decks; the tracer cannot see
  // the directory through fs reads, so pin it explicitly.
  outputFileTracingIncludes: {
    "/deck/[slug]": ["./content/decks/**/*"],
  },
  async redirects() {
    return [
      {
        source: "/discord",
        destination: "https://discord.gg/PB5xZ9XYPJ",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/draco/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/models/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.blob.vercel-storage.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "img.clerk.com" },
    ],
  },
};

export default nextConfig;
