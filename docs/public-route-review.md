# Public Route Review

This review covers public routes that existed before the repositioning work.

## Reviewed Routes

| Route | Current decision | Reason |
| --- | --- | --- |
| `/services` | Redirect to `/dashboard?workflow=launch-channel` | Old services sales page. No hard payment/referral dependency found. |
| `/coaching` | Redirect to `/dashboard/ai-coach` | Old coaching sales page. The kept product concept is AI Coach. |
| `/affiliate` | Keep for now | Still tied to affiliate dashboard, referral links, payout API, and referral cookie flow. |
| `/affiliate/dashboard` | Keep for now | Protected route used by affiliate program and payout request flow. |
| `/academy` | Keep for now | Payment success, `hasMasterclass`, academy subdomain rewrite, and Zoom registration still depend on it. |
| `/academy/zoom` | Keep for now | Uses `/api/academy/register-zoom` and redirects to VIP upgrade. |

## Plan 5 Dependency Review

- `/affiliate` and `/affiliate/dashboard` remain live because referral cookies, `/api/affiliate/*`, commission tracking, and payout request flow still depend on them.
- `/academy`, `/academy/zoom`, and `/academy/zoom/vip-upgrade` remain live because PayOS `MASTERCLASS`, `hasMasterclass`, email links, and the `academy.seenyt.net` middleware rewrite still depend on them.
- `/success` remains live because PayOS returns to `/success?orderCode=...` and the page calls `/api/payment/check-order` before sending users to `/dashboard` or `/academy`.
- YouTube channel OAuth callback now returns to `/dashboard?tool=video-pipeline` instead of the legacy `/tools/video-pipeline` route.
- Legacy app routes kept for business flow safety now also receive `X-Robots-Tag: noindex, nofollow` in `next.config.js`.

## Visible Cleanup

- Replaced `components/Footer.tsx` with a clean footer focused on Studio, AI Coach, Pricing, and Guides.
- Removed visible footer links to Affiliate, Coaching, and Services.

## Next Deletion Review

Before deleting affiliate or academy pages, review:

- Payment success redirects.
- `hasMasterclass` session behavior.
- `academy.seenyt.net` middleware rewrite.
- Affiliate referral cookie and payout flow.
- Old email templates and campaigns.
- Generated sitemap output.
