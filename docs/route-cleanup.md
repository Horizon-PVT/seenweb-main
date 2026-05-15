# Route Cleanup

This pass adds safe redirects for legacy tool routes without deleting files.

## Rule

Redirect old tool URLs to the canonical dashboard workflow. Do not delete the old files until API, billing, admin, and email dependencies are reviewed.

## Redirects Added

| Old route | Destination | Reason |
| --- | --- | --- |
| `/tools/marketplace` | `/dashboard?tool=intelligence-hub` | Marketplace is hidden from primary UX; channel signals belong in Intelligence Hub for now. |
| `/tools/affiliate-partner` | `/dashboard` | Affiliate is not part of the creator workflow. |
| `/tools/desktop-apps` | `/dashboard?tool=video-pipeline` | Desktop execution should support production workflow, not stand alone. |
| `/tools/white-label` | `/dashboard` | White label is a business surface, not creator UX. |
| `/tools/hidden-channel-finder` | `/dashboard?tool=intelligence-hub` | Hidden channel research is a signal inside Intelligence Hub. |
| `/tools/creator-dashboard` | `/dashboard?tool=intelligence-hub` | Creator analytics should be merged into Intelligence Hub. |
| `/tools/video-pipeline` | `/dashboard?tool=video-pipeline` | Canonical tool surface is dashboard query route. |
| `/tools/seo-tool` | `/dashboard?tool=seo-tool` | Canonical tool surface is dashboard query route. |
| `/services` | `/dashboard?workflow=launch-channel` | Old sales page, now replaced by workflow positioning. |
| `/coaching` | `/dashboard/ai-coach` | Old sales page, now replaced by AI Coach product surface. |

## Not Redirected Yet

- `/affiliate`
- `/academy`

These routes still have possible dependencies from email, payment success, referral tracking, academy subdomain behavior, or older campaigns. They should be handled after dependency review.
