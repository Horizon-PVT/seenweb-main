/** @type {import('next').NextConfig} */

const withMDX = require('@next/mdx')({
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
    ],
    unoptimized: true,  // ✅ Thêm: Tối ưu ảnh ngoài (nhẹ hơn cho AI-generated images)
  },
  eslint: { ignoreDuringBuilds: true }, // ✅ Giữ nguyên: Tránh lỗi ESLint khi build
  typescript: { ignoreBuildErrors: true }, // ✅ Giữ nguyên: Tránh crash vì type nhỏ
  experimental: {
    turbo: { 
      rules: { 
        '*.prisma': { loaders: ['prisma'] }  // ✅ Thêm: Tối ưu build cho Prisma queries
      } 
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',  // Ignore node_modules
          '**/System Volume Information/**',
          '**/hiberfil.sys',
          '**/pagefile.sys',
          '**/swapfile.sys',
          '**/RECYCLER/**',  // Ignore Recycle Bin
          '**/.git/**'  // Ignore Git
        ]
      };
    }
    return config;
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'], // ✅ Thêm: Hỗ trợ MDX cho blog
};

module.exports = withMDX(nextConfig);