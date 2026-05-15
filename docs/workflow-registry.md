# SeenYT Workflow Registry

Phase 4 introduced a canonical registry for creator tools and workflows.

Source file:

- `lib/creator-workflows.ts`

## Canonical Tool IDs

These IDs should be used by new dashboard, workflow, navigation, and tracking code:

- `niche-radar`
- `rival-scanner`
- `script-studio`
- `voice-studio`
- `video-pipeline`
- `seo-tool`
- `intelligence-hub`
- `ai-coach`

## Alias Support

The registry maps older IDs to canonical IDs so existing links and older code can continue to work while the app is cleaned up.

Examples:

- `micro-niche-miner`, `niche-engine`, `koda-niche-radar` -> `niche-radar`
- `scriptwriter`, `script-writer`, `koda-script-studio` -> `script-studio`
- `seo`, `youtube-seo`, `keyword-research` -> `seo-tool`
- `multilingual-studio`, `text-to-speech`, `dubbing`, `tts` -> `voice-studio`

## Canonical Workflows

### Launch Channel

Goal: move from channel idea to validated niche and first content plan.

Steps:

1. Find the niche.
2. Study competitors.
3. Build a 30-day plan with AI Coach.

### Produce Video

Goal: move from one video idea to a publish-ready package.

Steps:

1. Write the script.
2. Create voice and captions.
3. Build the video package.

### Improve Channel

Goal: use SEO, intelligence, and coaching to choose the next move.

Steps:

1. Optimize publishing metadata.
2. Review content intelligence.
3. Choose the next action with AI Coach.

## Files Now Using The Registry

- `pages/dashboard.tsx`
- `components/dashboard/DashboardHome.tsx`
- `components/dashboard/Sidebar.tsx`
- `components/dashboard/MobileNav.tsx`
- `components/dashboard/WorkflowSwitcher.tsx`

## Dashboard Routing

Dashboard workflow and tool entrypoints now use canonical query routes:

- `/dashboard?workflow=launch-channel`
- `/dashboard?workflow=produce-video`
- `/dashboard?workflow=improve-channel`
- `/dashboard?tool=<canonical-tool-id>`

Workflow cards, mobile nav, sidebar items, quick tools, and daily idea execution should route through these dashboard URLs instead of old `/tools/*` URLs.

## Current Limitations

- Workflow state is not persisted yet.
- Projects are not connected to workflows yet.
- Quota and role access still use older role/tool lists in `lib/roles.ts`.
- Some merged tools still live as standalone pages until cleanup phases.

## Next Technical Step

When moving beyond visual workflow routing, add persistence for workflow drafts:

- selected workflow
- current step
- channel or project ID
- linked tool outputs
- status per step
