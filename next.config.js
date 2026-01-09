/** @type {import('next').NextConfig} */

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "**.pexels.com" },
      { protocol: "https", hostname: "**.placeholder.com" },
      { protocol: "https", hostname: "minio.kodaflow.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "randomuser.me" },
    ],
    // Enable image optimization for better performance
    unoptimized: false,
  },

  // Allow build but show warnings (không block build)
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  experimental: {
    turbo: {
      rules: {
        "*.prisma": { loaders: ["prisma"] },
      },
    },
  },

  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
};

module.exports = withMDX(nextConfig);
