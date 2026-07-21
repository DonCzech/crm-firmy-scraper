/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // Backwards-compatible aliases for Czech slugs under /en.
      // A permanent redirect keeps a single, genuinely English canonical URL.
      { source: "/en/nabidka/vse", destination: "/en/properties/all", permanent: true },
      { source: "/en/nabidka/prodej", destination: "/en/properties/for-sale", permanent: true },
      { source: "/en/nabidka/pronajem", destination: "/en/properties/to-let", permanent: true },
      { source: "/en/nabidka/investicni", destination: "/en/properties/investment", permanent: true },
      { source: "/en/nemovitost/:id", destination: "/en/property/:id", permanent: true },
      { source: "/en/o-nas", destination: "/en/about", permanent: true },
      { source: "/en/sluzby", destination: "/en/services", permanent: true },
      { source: "/en/kontakt", destination: "/en/contact", permanent: true },
      { source: "/en/odhad-nemovitosti", destination: "/en/valuation", permanent: true },
      { source: "/en/prodano", destination: "/en/sold", permanent: true },
      { source: "/en/makleri", destination: "/en/agents", permanent: true },
      { source: "/en/blog", destination: "/en/journal", permanent: true },
      { source: "/en/ochrana-osobnich-udaju", destination: "/en/privacy", permanent: true },
      { source: "/en/odhlasit", destination: "/en/unsubscribe", permanent: true },
    ];
  },
  images: {
    // AVIF/WebP generuje next/image automaticky pro všechny povolené zdroje
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
};

export default nextConfig;
