# SEO Discoverability Cleanup

This pass keeps search engines focused on the new public product story.

## Sitemap Intent

Index public pages that support SeenYT's positioning as a YouTube Content Operating System.

Do not index:

- Private app surfaces.
- API routes.
- Redirected legacy pages.
- Old standalone tool routes.
- Login/payment success pages.
- Admin and affiliate dashboard pages.

## Excluded From Sitemap

- `/admin`, `/admin/*`
- `/api/*`
- `/dashboard`, `/dashboard/*`
- `/affiliate`
- `/affiliate/dashboard`
- `/academy`, `/academy/*`
- `/community`
- `/extension-callback`
- `/login`
- `/login-test`
- `/success`
- `/welcome`
- `/services`
- `/coaching`
- `/tools/*`
- `/studio/*`
- `/promotions`
- `/tuyendung`

## Canonical Public Sitemap

The sitemap is now explicit and focused:

- `/`
- `/en`
- `/ja`
- `/pricing`
- `/guides`
- `/blog`
- `/legal`
- `/terms`
- `/privacy`
- `/contact`

## Kept In App But Not Indexed

- `/affiliate`: app route kept because referral and partner flows still exist.
- `/academy`: app route kept because payment success and `hasMasterclass` still depend on it.
- `/academy/zoom`: app route kept because Zoom registration is still active.

## Files Updated

- `next-sitemap.config.js`

## Next Step

Regenerate sitemap after a full build or by running:

```bash
npm run sitemap
```
