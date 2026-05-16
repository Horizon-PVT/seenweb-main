# Current Status

Last reconstructed: 2026-05-15

## Where We Are

SeenYT repositioning work is committed and production is intentionally parked behind the maintenance page while workflow upgrades continue.

Maintenance mode is currently enabled for production via `process.env.NODE_ENV === "production"` in `middleware.ts` and `pages/_app.tsx`. Local development remains open so workflow upgrades can be tested. Reopen production by setting `maintenanceMode` to `false` or moving it back behind a release flag after final workflow QA.

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
- Added a shared dashboard tool workspace shell so every active tool opens with consistent workflow, channel, draft status, output count, and back navigation context.
- Converted AI Coach navigation to open inside the dashboard tool workspace instead of jumping to a separate dashboard page; `/dashboard/ai-coach` remains available as a compatible standalone page.
- Added a dashboard-native AI Coach workspace with context panel, quick prompts, streaming chat, and workflow output attachment.
- Locked the dashboard to a fixed-height app shell so active tools scroll inside their own workspace instead of pulling the browser page downward.
- Tuned ChatGPT/Gemini-style AI Coach output with slower typewriter speed, tighter readable line spacing, aligned output/input width, hidden intrusive internal scrollbars, clickable suggested follow-up prompts, and a less intrusive composer area; Script Studio already renders generated scripts with a typewriter effect.

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

1. Test dashboard workflow locally while production remains in maintenance:
   - `npm run dev`
   - `/dashboard?workflow=launch-channel`
   - `/dashboard?workflow=produce-video`
   - `/dashboard?workflow=improve-channel`
2. Verify workflow draft behavior:
   - General workspace draft saves and reloads.
   - Selecting a connected channel creates a separate draft for that channel.
   - Switching channels does not mix workflow progress.
3. Continue attaching real tool output IDs to each workflow step beyond Niche Radar, Rival Scanner, Script Studio, and SEO Tool.

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
- Reopen by disabling `maintenanceMode` in `middleware.ts` and `pages/_app.tsx` after final workflow QA.

## Future Product Work

- Persist workflow drafts and project state. Initial draft persistence is now implemented on top of `UserProject` with `toolId="workflow-draft"`.
- Connect workflows to channel IDs and real tool output project IDs. Channel-linked draft storage is implemented; Niche Radar, Rival Scanner, Script Studio, and SEO Tool outputs now attach to their matching workflow steps.
- Continue inner UI/UX unification tool by tool. The shared shell is implemented first; Niche Radar and Script Studio wrappers have been simplified to avoid duplicate headers.
- Review quota and role access in `lib/roles.ts`.
- Deep-review API/loading/error states tool by tool.
- Delete hidden legacy routes only after route, API, billing, and admin dependency review.

## Workflow Draft Persistence

Status: channel-aware implementation in progress.

Implemented:

- `lib/workflow-drafts.ts` defines workflow draft types, default draft creation, and normalization.
- `pages/api/workflow-drafts.ts` loads/saves drafts per user, workflow, and optional connected YouTube channel using the existing `UserProject` table.
- `pages/dashboard.tsx` loads connected channels, keeps the selected `channel` in the dashboard query string, saves step state per channel, marks steps active/done, and routes the selected step to the right tool.
- `components/dashboard/DashboardHome.tsx` displays a channel workspace selector, saved progress, current step, step status, and a `Mark done` action.
- `components/dashboard/MyChannels.tsx` is reachable from the dashboard as `tool=channel-manager` for connecting the first channel.
- `pages/api/projects/index.ts` can attach a saved project to a workflow step when `workflowId`, `stepId`, and optional `channelId` are provided.
- `components/ScriptwriterTool.tsx` sends workflow context when saving a script from the `produce-video` workflow, so saved scripts attach to the `write-script` step.
- `components/MicroNicheMinerTool.tsx` auto-saves successful Niche Radar results to the `find-niche` step in the `launch-channel` workflow.
- `components/RivalScannerTool.tsx` auto-saves successful Rival Scanner results to the `study-rivals` step in the `launch-channel` workflow.
- `components/SeoTool.tsx` auto-saves successful SEO packages to `optimize-video` in `improve-channel`, or to `build-video-package` when used inside `produce-video`.
- `components/VoiceStudioTool.tsx` auto-saves generated voiceover/audio output to `create-voice` in `produce-video`.
- `components/IntelligenceHub.tsx` auto-saves generated intelligence reports to `review-insights` in `improve-channel`.
- `pages/dashboard.tsx` refetches workflow draft state when returning from a tool to the workflow screen.
- `components/dashboard/ToolWorkspaceShell.tsx` provides the shared dashboard shell for all active tools.
- `components/KodaNicheRadar.tsx` and `components/KodaScriptStudio.tsx` were simplified so the shared shell owns the main tool header.
- `components/MicroNicheMinerTool.tsx` and `components/RivalScannerTool.tsx` were widened to use the full dashboard workspace instead of centered/max-width layouts.
- `components/dashboard/AICoachWorkspace.tsx` is the dashboard-native AI Coach experience used by `tool=ai-coach`.
- `pages/dashboard.tsx` keeps active tools clipped to the tool workspace, while the normal workflow dashboard is allowed to scroll inside the dashboard shell.
- `components/dashboard/DashboardLayout.tsx` lets the normal workflow dashboard use natural page scroll, while active tools stay inside a fixed-height workspace.
- `pages/dashboard/ai-coach.tsx` still supports the old standalone page path for compatibility.
- `components/ui/TypewriterMarkdown.tsx` renders markdown output progressively for chat-style AI responses.
- `components/VideoPipeline.tsx`, `components/IntelligenceHub.tsx`, `components/ScriptwriterTool.tsx`, and the workflow-native tool wrappers use internal fixed-height scrolling instead of page-level scrolling.

Current limits:

- Video Pipeline still needs a clearer final "save package" action before it can attach a useful output object to `build-video-package`.
- Production maintenance remains active, so test this in local dev until the release is ready.
