# SeenYT Tool Audit

Phase 3 output. This document classifies current tools and related routes before any deletion.

Rule: hide or merge first, delete later only after dependency review.

## 1. Audit Summary

The current codebase has several overlapping tool layers:

- Dashboard tool IDs: `niche-radar`, `script-studio`, `video-pipeline`, `seo-tool`, `intelligence-hub`, `rival-scanner`.
- Older role/tool IDs: `micro-niche-miner`, `scriptwriter`, `seo`, `image-forge`, `thay-youtube`, `dubbing`, `creator-dashboard`, `narrative-studio`, `velocity`, `text-to-speech`.
- Standalone pages under `pages/tools`.
- API routes under `pages/api` and `pages/api/tools`.
- Legacy business surfaces: affiliate, marketplace, academy, services, desktop apps.

The main cleanup risk is ID drift. Some UI uses new IDs while access/quota code still references old IDs. Before deleting code, we should standardize tool IDs or provide aliases.

## 2. Primary Keep

These tools directly support the new SeenYT positioning as a YouTube Content Operating System.

| Tool | Current UI Entry | Main Files | Recommendation | Reason |
| --- | --- | --- | --- | --- |
| Niche Radar | `/dashboard?tool=niche-radar` | `components/KodaNicheRadar.tsx`, `pages/api/tools/niche-engine.ts`, `pages/api/micro-niche-miner.ts`, `pages/api/niche/gap-finder.ts`, `pages/api/youtube.ts` | Keep | Core to Launch Channel workflow. |
| Rival Scanner | `/dashboard?tool=rival-scanner` | `components/RivalScannerTool.tsx`, `pages/api/rival-scanner.ts`, `pages/api/competitor/analyze.ts`, `pages/api/youtube.ts` | Keep | Core to niche validation and competitor intelligence. |
| Script Studio | `/dashboard?tool=script-studio` | `components/KodaScriptStudio.tsx`, `components/ScriptwriterTool.tsx`, `pages/api/script-writer.ts`, `pages/api/script-refine.ts`, `pages/api/script-chat.ts` | Keep | Core to Produce Video workflow. |
| SEO Tool | `/dashboard?tool=seo-tool` | `components/SeoTool.tsx`, `pages/api/seo-tool.ts`, `pages/api/extension/seo-score.ts` | Keep | Core to Improve Channel and publishing optimization. |
| Video Pipeline | `/dashboard?tool=video-pipeline` | `components/VideoPipeline.tsx`, `pages/api/video-pipeline.ts`, `pages/api/youtube/*`, `lib/autopublish-queue.ts` | Keep | Core to Produce Video workflow. |
| AI Creator Coach | `/dashboard/ai-coach` | `pages/dashboard/ai-coach.tsx`, `components/ai-coach/AICoachChat.tsx`, `pages/api/ai-coach/*`, `lib/ai-coach-*` | Keep | Core differentiator. Guides next action, not just tool execution. |

## 3. Merge Into Core Workflows

These are useful but should not appear as standalone main navigation items.

| Tool / Surface | Current Files | Merge Target | Recommendation | Reason |
| --- | --- | --- | --- | --- |
| Multilingual Studio | `pages/tools/multilingual-studio.tsx`, `pages/api/multilingual-studio.ts` | Produce Video | Merge | Useful for voice, captions, and localization, but should be a production step. |
| Voice / TTS tools | `components/VoiceStudioTool.tsx`, `components/VoiceMasterTool.tsx`, `pages/api/text-to-speech.ts`, `pages/api/tools/tts/*`, `lib/edgetts.ts`, `lib/fptTTS.ts` | Produce Video | Merge | Voice generation is a step inside video production. |
| Dubbing tools | `pages/api/dubbing/*` | Produce Video / Multilingual | Merge | Useful for localization but too specific for top-level navigation. |
| Thumbnail tools | `components/ThumbnailProTool.tsx`, `pages/api/image-forge.ts`, thumbnail fields in `pages/api/seo-tool.ts` and `pages/api/video-pipeline.ts` | Produce Video / SEO Tool | Merge | Thumbnail is important, but should be a step in video packaging and SEO. |
| Intelligence Hub | `components/IntelligenceHub.tsx`, `pages/tools/intelligence-hub.tsx`, `pages/api/intelligence-hub.ts` | Launch Channel / Improve Channel | Merge, then Keep as hub if strong | Useful, but should unify smaller research tools instead of being another abstract module. |
| Hidden Channel Finder | `pages/tools/hidden-channel-finder.tsx`, `pages/api/youtube.ts` alias `hidden` | Intelligence Hub | Merge | Research feature, not a top-level product. |
| Creator Dashboard | `pages/tools/creator-dashboard.tsx`, `pages/api/creator-dashboard.ts`, `components/dashboard/*Analytics*` | Improve Channel | Merge | Should become the analytics/review step, not a separate route. |
| Trends / Daily Ideas | `pages/dashboard/trends/index.tsx`, `pages/api/trends/*`, `pages/api/dashboard/daily-ideas.ts` | Launch Channel / Improve Channel | Merge | Useful signal, but should feed planning and review workflows. |
| Keyword Research | `pages/api/tools/keyword-research.ts`, extension keyword APIs | Niche Radar / SEO Tool | Merge | Belongs inside research and SEO. |

## 4. Hide From Primary App Navigation

These can remain available by direct route or admin/business context, but should not compete with creator workflows.

| Surface | Files | Recommendation | Reason |
| --- | --- | --- | --- |
| Marketplace | `pages/tools/marketplace.tsx`, `pages/api/marketplace/*`, `components/dashboard/ChannelMarketplace.tsx` | Hide | Business feature, not core workflow. Keep for later if channel marketplace is a separate product. |
| Affiliate | `pages/tools/affiliate-partner.tsx`, `pages/affiliate/*`, `pages/api/affiliate/*`, `components/AffiliateSection.tsx` | Hide | Revenue program, not creator workflow. |
| Desktop Apps | `pages/tools/desktop-apps.tsx`, Koda desktop references | Hide | May be valuable, but needs separate positioning and proof. |
| White Label | `pages/tools/white-label.tsx` | Hide | Agency/business offer, not core creator workflow. |
| Academy / Coaching sales pages | `pages/academy/*`, `pages/coaching.tsx` | Hide from app nav | Can support education, but should not distract from workflow. |
| Services | `pages/services.tsx` | Hide from app nav | Service offer, not core SaaS workflow. |
| Community | `pages/community/index.tsx`, `pages/api/community/*` | Hide | Not part of current repositioning. |

## 5. Delete Later Candidates

Do not delete these immediately. First verify no live links, imports, API dependencies, or paid-user paths depend on them.

| Candidate | Files / Pattern | Reason |
| --- | --- | --- |
| Test and demo routes | `pages/login-test.tsx`, `pages/api/hello.ts`, `pages/api/test-*`, root `test-*.ts` files | Development leftovers. |
| Old landing sections | `components/HeroSection.tsx`, `CreatorMeritSection.tsx`, `ExploreSection.tsx`, `FinalCTA.tsx`, some legacy marketing sections | Replaced by new homepage direction. Delete only after confirming no page imports them. |
| Under construction tools | `components/UnderConstructionTool.tsx` and routes that only show placeholders | Adds noise without product value. |
| Duplicate script tools | `components/KodaScriptStudio.tsx` vs `components/ScriptwriterTool.tsx`, `pages/api/script-writer.ts` vs refine/chat APIs | Consolidate first, then delete duplicates. |
| Duplicate niche tools | `KodaNicheRadar`, `MicroNicheMinerTool`, `NicheEngineTool`, `BlueOceanTool`, `WinningNicheLibraryTool` | Likely overlapping research features. Merge into Niche Radar / Intelligence Hub. |
| Old product labels | Koda Novel, Koda Factory, Velocity, Web Novel references | Not aligned with current YouTube OS positioning unless explicitly spun out. |

## 6. ID Standardization Needed

Current mismatch examples:

| Concept | New Dashboard ID | Old Role / API ID |
| --- | --- | --- |
| Niche research | `niche-radar` | `micro-niche-miner`, `niche-engine`, `koda-niche-radar` |
| Script writing | `script-studio` | `scriptwriter`, `koda-script-studio`, `script-writer` |
| SEO | `seo-tool` | `seo`, `seo-tool` |
| Thumbnail | no primary ID | `image-forge`, `thumbnail-ai` |
| Voice | routed through multilingual | `text-to-speech`, `dubbing`, `tts` |

Recommendation for Phase 4:

- Define canonical tool IDs in one file.
- Keep aliases for existing APIs/quota checks.
- Use canonical IDs in dashboard, sidebar, mobile nav, access control, and usage tracking.

Suggested canonical IDs:

- `niche-radar`
- `rival-scanner`
- `script-studio`
- `voice-studio`
- `video-pipeline`
- `seo-tool`
- `intelligence-hub`
- `ai-coach`

## 7. Proposed Visibility Matrix

| Category | Visible in Sidebar | Visible in Dashboard Toolbox | Direct Route Still Works | Delete Now |
| --- | --- | --- | --- | --- |
| Keep | Yes | Yes | Yes | No |
| Merge | No | Optional, marked Review | Yes | No |
| Hide | No | No | Yes | No |
| Delete Later | No | No | Temporarily yes | No |

## 8. Immediate Phase 3 Decisions

Implemented in current UI direction:

- Sidebar only surfaces primary creator workflow tools.
- Marketplace, affiliate, desktop apps, and white-label are no longer primary navigation.
- Dashboard toolbox marks some items as `Ready` and `Review`.

Not implemented yet:

- No files deleted.
- No API removed.
- No access-control IDs changed.
- No quota logic changed.

## 9. Recommended Next Phase

Phase 4 should implement real workflow structure and canonical tool IDs.

Priority:

1. Create a canonical tool registry.
2. Add alias mapping from old IDs to new IDs.
3. Build workflow state for `Launch Channel`, `Produce Video`, and `Improve Channel`.
4. Route workflow steps to the kept or merged tools.
5. Only after that, begin hiding legacy routes from user-facing entry points.

