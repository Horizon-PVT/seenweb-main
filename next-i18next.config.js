module.exports = {
    i18n: {
        defaultLocale: 'vi',
        locales: ['vi', 'en', 'ja', 'ko', 'th', 'id', 'es'],
        localeDetection: true, // Auto-detect browser language
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
}
