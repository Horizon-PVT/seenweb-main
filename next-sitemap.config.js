/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://seenweb-main.vercel.app', // 🌐 domain thật của anh
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'weekly',
  priority: 0.8,
  exclude: ['/admin/*', '/api/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/api'] },
    ],
  },
};
