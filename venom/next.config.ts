import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://connect.facebook.net", // unsafe-inline needed for Next.js + GTM
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://www.google-analytics.com https://stats.g.doubleclick.net",
      "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://www.youtube-nocookie.com https://www.openstreetmap.org",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Admin/editor routes must not be indexed
        source: "/demo/:tenantSlug/admin(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        // Static template assets — long cache (1 year), versioned via filename
        source: "/templates/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" },
          { key: "Vary", value: "Accept" },
        ],
      },
      {
        // User uploads — 30 day cache, revalidatable
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        // Generic assets (icons, logos, etc)
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" },
        ],
      },
      {
        // Images in /public/images
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, stale-while-revalidate=86400" },
          { key: "Vary", value: "Accept" },
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "**" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "@dnd-kit/core", "@dnd-kit/sortable", "framer-motion"],
  },

  // Prevent Next.js from picking up parent-directory lockfiles as workspace root (local only)
  ...(process.env.VERCEL ? {} : { outputFileTracingRoot: process.cwd() }),

  // Exclude heavy static clones (~1 GB) from serverless function bundles.
  // These files are still served as static assets via the CDN — they just
  // don't get bundled into the function lambdas (which have a 300 MB limit).
  outputFileTracingExcludes: {
    "*": [
      "public/clones/**",
      "public/templates/**",
      "public/assets/**",
      "public/uploads/**",
      "public/images/**",
      "public/demo-assets/**",
      "public/hero-video*",
      "public/preview-*",
    ],
  },
  // Specific routes that DO need certain public/templates files (existsSync gates).
  // These end up in just that route's bundle, not all functions.
  outputFileTracingIncludes: {
    "app/ukazka-sablon/page": ["public/templates/*/preview.png"],
    "app/ukazka-sablon/[key]/page": [
      "public/templates/*/preview.png",
      "public/templates/*/showcase/*.png",
    ],
    "app/sablony/[key]/page": ["public/templates/*/preview.png"],
  },

};

export default withBundleAnalyzer(nextConfig);
