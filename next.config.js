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

  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  async redirects() {
    return [
      {
        source: "/tools/marketplace",
        destination: "/dashboard?tool=intelligence-hub",
        permanent: false,
      },
      {
        source: "/tools/affiliate-partner",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/tools/desktop-apps",
        destination: "/dashboard?tool=video-pipeline",
        permanent: false,
      },
      {
        source: "/tools/white-label",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/tools/hidden-channel-finder",
        destination: "/dashboard?tool=intelligence-hub",
        permanent: false,
      },
      {
        source: "/tools/creator-dashboard",
        destination: "/dashboard?tool=intelligence-hub",
        permanent: false,
      },
      {
        source: "/tools/video-pipeline",
        destination: "/dashboard?tool=video-pipeline",
        permanent: false,
      },
      {
        source: "/tools/seo-tool",
        destination: "/dashboard?tool=seo-tool",
        permanent: false,
      },
      {
        source: "/services",
        destination: "/dashboard?workflow=launch-channel",
        permanent: false,
      },
      {
        source: "/coaching",
        destination: "/dashboard/ai-coach",
        permanent: false,
      },
    ];
  },

  async headers() {
    const noIndexLegacyRoutes = [
      "/affiliate",
      "/affiliate/:path*",
      "/academy",
      "/academy/:path*",
      "/success",
      "/maintenance",
      "/extension-callback",
      "/tools/:path*",
      "/studio/:path*",
      "/services",
      "/coaching",
    ];

    return noIndexLegacyRoutes.map((source) => ({
      source,
      headers: [
        {
          key: "X-Robots-Tag",
          value: "noindex, nofollow",
        },
      ],
    }));
  },

  webpack: (config, { dev }) => {
    // Disable Webpack cache in dev.
    // This avoids Fast Refresh loops when Windows antivirus locks .pack.gz files.
    if (dev) {
      config.cache = false;
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // delay before rebuilding
        ignored: [
          "**/node_modules/**",
          "**/.next/**",
          "**/.git/**",
          "**/.qa/**",
          "**/public/sitemap*.xml",
          "**/public/robots.txt",
        ],
      };
    }
    return config;
  },
};

module.exports = withMDX(nextConfig);
