module.exports = {
    i18n: {
        defaultLocale: 'vi',
        locales: ['vi', 'en'],
        localeDetection: false, // Force default unless switched
    },
    reloadOnPrerender: process.env.NODE_ENV === 'development',
}
