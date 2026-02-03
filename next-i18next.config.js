const path = require('path');

module.exports = {
    i18n: {
        defaultLocale: 'vi',
        locales: ['vi', 'en', 'ja', 'ko', 'th', 'id', 'es'],
        localeDetection: false, // Turn off auto-detection to rely on button selection
    },
    localePath: path.resolve('./public/locales'),
    reloadOnPrerender: process.env.NODE_ENV === 'development',
}
