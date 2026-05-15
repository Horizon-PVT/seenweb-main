# Legacy Cleanup

Phase 6 keeps the product focused after the new creator workflow structure is in place.

## Cleanup Rule

Hide first, delete after dependency review.

This avoids breaking tools that may still import older promotional or sales components.

## Completed

- Removed the global `WelcomePopupManager` mount from `pages/_app.tsx`.
- Kept `AttributionTracker`, `Toaster`, `ErrorBoundary`, session handling, theme handling, and Google Tag Manager active.
- Rewrote global metadata around the new positioning:
  - SeenYT as a YouTube Content Operating System.
  - Creator workflow, niche research, scripting, production, SEO, and AI coaching.
- Changed application schema category from generic multimedia app to business application.
- Removed outdated global copy and comments from `_app.tsx`.
- YouTube OAuth callback now lands on `/dashboard?tool=video-pipeline` instead of `/tools/video-pipeline`.
- Legacy app routes kept for payment, referral, or academy safety now receive `X-Robots-Tag: noindex, nofollow`.

## Hidden But Not Deleted

These components still exist for review, but no longer appear globally through `_app.tsx`:

- `components/WelcomePopupManager.tsx`
- `components/KhaiXuanPopup.tsx`
- `components/SharePromoPopup.tsx`

`SharePromoPopup` is still referenced by `components/UpgradeGate.tsx`, so it should not be deleted until upgrade and billing flows are reviewed.

`WelcomePopupManager` and `KhaiXuanPopup` are not mounted globally, but files are kept until a final deletion pass verifies no campaign/admin flow imports them.

## Remaining Review Areas

- Old landing sections that no longer support the creator operating system story.
- Outdated routes for affiliate, marketplace, desktop app, services, and coaching sales pages.
- Affiliate, academy, and success routes remain live because referral, masterclass, payment success, and email flows still depend on them.
- Duplicate tool pages that overlap the canonical workflow registry.
- Demo and test routes that should not remain in production navigation.

## Test Result

- `npx tsc --noEmit`: passed.
- `npx next lint --file pages/_app.tsx`: passed with one existing Next.js font placement warning.
