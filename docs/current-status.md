# Current Status

Last reconstructed: 2026-05-15

## Where We Are

SeenYT repositioning work is implemented in the working tree but not committed yet.

The current repo state shows a large uncommitted change set across homepage, dashboard, navigation, tool surfaces, i18n, sitemap, middleware, and PayOS payment APIs.

Maintenance mode is currently hard-enabled in `middleware.ts` so public routes rewrite to `/maintenance` during the workflow upgrade. Reopen by changing `maintenanceMode` back to a flag-based value or `false` after final workflow QA.

## Completed Work

- Defined SeenYT as a YouTube Content Operating System.
- Cleaned public positioning around creator workflows instead of scattered AI tools.
- Reworked dashboard navigation around workflows, AI Coach, tools, projects, and billing.
- Added canonical creator workflow/tool registry in `lib/creator-workflows.ts`.
- Added creator i18n support in `lib/creator-i18n.ts`.
- Replaced visible legacy tool naming with workflow-aligned tool names.
- Kept legacy routes available but removed them from the primary product journey.
- Added noindex handling for legacy app routes.
- Hardened PayOS payment handling with shared server-side plan/order activation logic.
- Regenerated sitemap/robots output.
- Added a public maintenance page announcing the workflow upgrade and expected reopening on Sunday, 17/05/2026.

## QA Already Recorded

See `docs/final-qa.md`.

Recorded checks:

- `npx tsc --noEmit`: passed.
- `npm run lint`: passed with pre-existing warnings.
- `npm run build`: passed.
- `npm run sitemap`: passed.
- `git diff --check`: passed.
- Route smoke test completed for public, dashboard, tool redirect, and legacy routes.

## Known Warnings

- Some old pages still warn about `<img>` usage.
- Legacy files still have non-blocking lint warnings.
- On Windows, `prisma generate` can fail if a local Next dev server is locking Prisma's query engine DLL.
- Manual payment request endpoints still need deeper review before external automation.

## Next Best Step

1. Re-run the core checks if the machine state changed:
   - `npx tsc --noEmit`
   - `npm run lint`
   - `npm run build`
   - `npm run sitemap`
   - `git diff --check`
2. Review the uncommitted diff at a high level.
3. Commit the repositioning work.
4. Deploy after owner approval.

## Completion Plan

### 1. Pricing And Billing Review

Status: in progress; core refactor and automated checks passed.

Goal: make sure pricing copy, selected plans, PayOS checkout, server-side price validation, activation, and role access all match.

Checks:

- Pricing page shows the right Starter, Creator, and Workflow Team positioning.
- `components/PricingTable.tsx` and `components/dashboard/CheckoutModal.tsx` use the same plan names, prices, billing cycles, and benefits.
- `lib/payment-plans.ts` remains the source of truth for server-side payment amounts.
- PayOS create-link, webhook, and success-page activation paths produce the same membership result.
- Role/quota access in `lib/roles.ts` matches what pricing promises.

Known risk:

- Team/channel limits still need owner confirmation before launch.
- A real PayOS checkout should still be tested with valid credentials or sandbox/manual flow.

Completed in this pass:

- Added `lib/public-plans.ts` as the shared public pricing source for Starter, Creator, and Workflow Team.
- Updated `components/PricingTable.tsx` to read plans, prices, features, AI Coach limits, and channel slots from the shared config.
- Updated `components/dashboard/CheckoutModal.tsx` to use the same shared config and send the selected role/billing cycle to PayOS.
- Updated `lib/payment-plans.ts` so server-side PayOS amount validation uses the same Starter, Creator, and Workflow Team prices.
- Updated `lib/channel-access.ts` so max channel slots use `CHANNEL_LIMITS` for current role names instead of old `BASIC/PRO` tier names.
- Standardized channel limits:
  - Free: 0 connected YouTube channels.
  - Starter: 1 connected YouTube channel.
  - Creator: 2 connected YouTube channels.
  - Workflow Team / FACTORY: 5 connected YouTube channels.
  - Agency: 5 connected YouTube channels.
  - Enterprise: 10 connected YouTube channels.
  - Admin: 999 connected YouTube channels.
- Enabled extra channel slot checkout:
  - Add-on: `+1 kênh YouTube`.
  - Price: `169.000đ` per channel slot.
  - Payment style: one-time add-on, because the current database stores `extraChannelSlots` as a permanent increment and has no per-slot expiry field.
- Updated channel limit checks in `pages/api/user/channels.ts` and `pages/api/youtube/auth-url.ts` to use the shared role limits.
- Updated dashboard subscription channel counts to match the new limits.

Checks after refactor:

- `npx.cmd tsc --noEmit`: passed.
- `npm.cmd run lint`: passed with existing warnings.
- `git diff --check`: passed.
- `npm.cmd run build`: passed; build logged Google Fonts download warnings because external font fetches were unavailable.

### 2. Final Product Polish

Goal: remove visible rough edges before commit.

Checks:

- Homepage, pricing, dashboard, AI Coach, and core tools have consistent SeenYT wording.
- Vietnamese, English, and Japanese routes do not show broken text or old Koda/SeenWeb positioning in primary UX.
- Mobile navigation and pricing cards fit cleanly.
- Legacy routes remain reachable only where needed and stay hidden/noindexed.

### 3. Regression QA

Goal: prove the uncommitted repositioning build is still stable.

Commands:

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`
- `npm run sitemap`
- `git diff --check`

Manual checks:

- `/`
- `/pricing`
- `/dashboard`
- `/dashboard/ai-coach`
- `/dashboard?workflow=launch-channel`
- `/dashboard?workflow=produce-video`
- `/dashboard?workflow=improve-channel`
- `/dashboard?tool=niche-radar`
- `/dashboard?tool=voice-studio`
- `/success`

### 4. Commit And Deploy

Goal: preserve the completed repositioning work and make it recoverable.

Steps:

- Review `git diff --stat`.
- Commit the repositioning, billing hardening, pricing/channel logic, and maintenance mode work.
- Push/deploy while maintenance mode is active.
- Smoke test production routes and one PayOS sandbox/manual checkout path if credentials are available.
- Reopen by disabling `maintenanceMode` in `middleware.ts` after final workflow QA.

## Future Product Work

- Persist workflow drafts and project state.
- Connect workflows to projects/channel IDs.
- Review quota and role access in `lib/roles.ts`.
- Deep-review API/loading/error states tool by tool.
- Delete hidden legacy routes only after route, API, billing, and admin dependency review.
