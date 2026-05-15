# Homepage Redesign

This pass rebuilds the public homepage around the new SeenYT positioning:

SeenYT is a YouTube Content Operating System, not a generic AI image or video tool directory.

## Direction

- First screen explains the product in one sentence.
- Tool cards are still visible, but they support the workflow story.
- Primary action is Studio.
- Secondary action is Workflow.
- Old business branches are not linked from the homepage.
- Vietnamese, English, and Japanese copy are defined in the homepage file for this pass.

## Sections

- Hero: direct positioning and product stats.
- Tool strip: the current core tools presented as workflow capabilities.
- Workflow: the operating system model from niche to review.
- AI Coach: positioned as next-step guidance, not just chat.
- Pricing: simplified plan story with fewer choices.

## Routes Checked

- `/`: 200
- `/en`: 200
- `/ja`: 200

## Automated Checks

- `npx tsc --noEmit`: passed.
- `npx next lint --file pages/index.tsx`: passed.
- `git diff --check -- pages/index.tsx docs/homepage-redesign.md`: passed.

## Notes

- This is the first visual/product cleanup pass.
- Public pricing was simplified around workflow plans: Starter, Creator, and Workflow Team.
- Public Guides, Blog, Contact, Legal, Terms, and Privacy pages now use the same SeenYT public shell and product story.
- Koda desktop / novel / factory copy was removed from the public pricing surface and checkout modal.
- The next pass should make the dashboard workflow experience the primary app surface.
