/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fix: Node.js 23 + nanoid ESM compatibility
  generateBuildId: async () => null,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
}

module.exports = nextConfig
