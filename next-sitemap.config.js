/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://seenyt.net', // ✅ Đổi thành domain production chính thức
  generateRobotsTxt: true, // Tự động tạo robots.txt
  sitemapSize: 7000,
  changefreq: 'weekly', // Hợp lý cho site content update đều
  priority: 0.8,
  exclude: ['/admin/*', '/dashboard/*', '/api/*'], // Không index page private (thêm dashboard cho chắc)
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/dashboard', '/api'] },
    ],
  },
};