# Final QA

This note tracks release readiness for the SeenYT repositioning work.

## Scope Checked

- Homepage routes for Vietnamese, English, and Japanese.
- Public routes: pricing, guides, blog, legal, terms, privacy, contact.
- Dashboard route behavior while unauthenticated.
- AI Coach route behavior while unauthenticated.
- Main dashboard navigation, workflow registry, and canonical tool routing.
- Global app shell, metadata, sitemap, robots, and legacy route handling.

## Fixes Made During QA

- Removed old ecosystem links from the AI Coach sidebar:
  - Academy
  - Coaching sales page
  - Services
  - Affiliate
- Replaced them with product-focused links:
  - Workflow lam kenh
  - Goi va thanh toan
  - Huong dan su dung
- Fixed mojibake in this QA note and cleaned the dev-cache comment in `next.config.js`.
- Fixed blocking lint issues from internal `<a>` tags and an invalid inline ESLint rule in legacy auth/admin/payment surfaces.
- Plan 4 core tool surface pass aligned Niche Radar, Rival Scanner, Script Studio, Voice Studio, Video Pipeline, SEO Tool, Intelligence Hub, and AI Creator Coach with the workflow story without deleting legacy APIs.
- Plan 5 legacy dependency pass kept affiliate, academy, and success flows live, moved YouTube OAuth callback to the canonical dashboard tool route, regenerated sitemap, and added `X-Robots-Tag: noindex, nofollow` for legacy app routes.
- Payment hardening pass moved paid-order activation into a shared server function, validates PayOS plan price/role on the server, requires webhook signatures for paid events, and keeps `/success` aligned with webhook behavior for tool plans, Academy Masterclass, Zoom VIP, affiliate commission, and license generation.

## Automated Checks

- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with pre-existing warnings.
- `npm run build`: passed after stopping the local dev server that was locking Prisma's Windows query engine DLL.
- `npm run sitemap`: passed.
- `git diff --check`: passed.

## Route Smoke Test

- `/`: 200
- `/en`: 200
- `/ja`: 200
- `/pricing`: 200
- `/guides`: 200
- `/blog`: 200
- `/legal`: 200
- `/terms`: 200
- `/privacy`: 200
- `/contact`: 200
- `/dashboard`: 307 unauthenticated redirect
- `/dashboard/ai-coach`: 307 unauthenticated redirect
- `/dashboard?workflow=launch-channel`: 307 unauthenticated redirect
- `/dashboard?workflow=produce-video`: 307 unauthenticated redirect
- `/dashboard?workflow=improve-channel`: 307 unauthenticated redirect
- `/dashboard?tool=niche-radar`: 307 unauthenticated redirect
- `/dashboard?tool=voice-studio`: 307 unauthenticated redirect
- `/dashboard?tool=seo-tool`: 307 unauthenticated redirect
- `/services`: 307 redirect to `/dashboard?workflow=launch-channel`
- `/coaching`: 307 redirect to `/dashboard/ai-coach`
- `/tools/video-pipeline`: 307 redirect to `/dashboard?tool=video-pipeline`
- `/tools/marketplace`: 307 redirect to `/dashboard?tool=intelligence-hub`
- `/affiliate`: 200 with `X-Robots-Tag: noindex, nofollow`
- `/affiliate/dashboard`: 307 unauthenticated redirect with `X-Robots-Tag: noindex, nofollow`
- `/academy`: 200 with `X-Robots-Tag: noindex, nofollow`
- `/academy/zoom`: 200 with `X-Robots-Tag: noindex, nofollow`
- `/success`: 200 with `X-Robots-Tag: noindex, nofollow`

## Known Warnings

- `pages/dashboard/ai-coach.tsx`: Next.js warns about existing `<img>` usage. This is not new to the repositioning work.
- Legacy pages and older API files still produce lint warnings for unused imports, hook dependencies, and `<img>` usage. They are warnings only; no blocking lint errors.
- Prisma generate can fail on Windows with `EPERM` if a local Next dev server is running and locking `node_modules/.prisma/client/query_engine-windows.dll.node`; stopping the local server cleared it.
- Manual payment request endpoints still exist separately from PayOS and should be reviewed before being exposed to external automation.

## Remaining Product Work

- Tool-by-tool usability review can go deeper into API/loading/error states after legacy dependency cleanup.
- Commit/deploy is ready for owner review after the final route smoke results are confirmed.
