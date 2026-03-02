const path = require('path');

module.exports = {
    i18n: {
        defaultLocale: 'vi',
        locales: ['vi', 'en'], // Add English
        localeDetection: false,
    },
    // Sử dụng process.cwd() để đảm bảo Vercel tìm đúng đường dẫn root
    localePath: path.resolve(process.cwd(), 'public/locales'),
    reloadOnPrerender: process.env.NODE_ENV === 'development',
}
