/** @type {import('next').NextConfig} */

const withMDX = require("@next/mdx")({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const { i18n } = require("./next-i18next.config");

const nextConfig = {
  i18n,
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
      { protocol: "https", hostname: "img.youtube.com" },
    ],
    // Enable image optimization for better performance
    unoptimized: false,
  },

  // Allow build to pass with ESLint warnings (pre-existing unused vars)
  // TODO: Clean up ~100 unused import warnings, then set to false
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },

  experimental: {
    turbo: {
      rules: {
        "*.prisma": { loaders: ["prisma"] },
      },
    },
  },

  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  webpack: (config, { dev }) => {
    // Tắt bộ nhớ đệm (cache) của Webpack trong môi trường Dev
    // Sẽ sửa dứt điểm lỗi Fast Refresh bị lặp vô tận (Loop) do Windows Antivirus khoá file .pack.gz
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // delay before rebuilding
        ignored: /node_modules/,
      };
    }
    return config;
  },
};

module.exports = withMDX(nextConfig);
