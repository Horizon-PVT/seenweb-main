const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "vi",
    locales: ["vi", "en", "ja"],
    localeDetection: false,
  },
  localePath: path.resolve(process.cwd(), "public/locales"),
  reloadOnPrerender: false,
};
