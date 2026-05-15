# Tool Review Decisions

This review keeps the product focused on the YouTube creator workflow.

## Principle

SeenYT should expose tools only when they support one of these jobs:

- Choose a viable niche.
- Understand competitors and the market.
- Plan content.
- Produce video assets.
- Optimize publishing.
- Review performance and decide the next move.

## Keep As Core

| Tool | Decision | Reason |
| --- | --- | --- |
| Niche Radar | Keep | First step for channel positioning and niche selection. |
| Rival Scanner | Keep | Required after niche selection to understand formats and patterns. |
| Script Studio | Keep | Core production step for every video. |
| Video Pipeline | Keep | Connects script, voice, assets, thumbnail brief, SEO, and publishing checklist. |
| SEO Tool | Keep | Required before upload and during performance improvement. |
| AI Creator Coach | Keep | Strategy layer across all workflows. |

## Merge

| Capability | Merge Into | Reason |
| --- | --- | --- |
| Multilingual Studio, TTS, dubbing, voice, captions | Voice Studio | These are one production step: localize and create audio/captions. |
| Hidden Channel Finder, trends, keyword research, creator analytics | Intelligence Hub | These are decision-support signals, not separate primary apps. |
| Thumbnail concept and brief | Video Pipeline | Thumbnail is part of packaging one publish-ready video. |

## Hide From Primary UX

| Surface | Decision | Reason |
| --- | --- | --- |
| Marketplace | Hide | Separate business product, not creator workflow. |
| Affiliate Partner | Hide | Revenue program, not core creator work. |
| Desktop Apps | Hide | Keep for later only if it directly supports workflow execution. |
| White Label | Hide | Agency/reseller surface, not public creator UX. |
| Academy / Services / Coaching sales pages | Hide from primary nav | Can exist separately, but should not distract from the operating system story. |

## Implemented Now

- Replaced `lib/tool-config.ts` with clean canonical tool decisions.
- Removed old Koda naming from the visible tool config.
- Added hidden legacy tool list for future deletion review.
- Updated AI Coach tool dropdown to use `VISIBLE_TOOLS`.
- Kept legacy pages and APIs in place for now.
- Plan 4 surface pass: canonical dashboard wrappers now present Niche Radar, Script Studio, Voice Studio, Video Pipeline, SEO Tool, Intelligence Hub, Rival Scanner, and AI Creator Coach as workflow steps.
- Renamed visible old labels such as `ALPHA_STRATEGY`, `Audio Station Pro`, `Content Intelligence Super Hub`, and `Digital Gold Mine` where they appeared in core tool entry surfaces.
- Voice, captions, SRT upload, and cloning remain inside `Voice Studio`; trend, competitor, niche, and channel signals remain grouped under `Intelligence Hub`.

## Deletion Rule

Do not delete hidden routes yet. Delete only after route, API, billing, and admin dependencies are reviewed.
