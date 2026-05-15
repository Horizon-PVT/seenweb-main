# SeenYT Repositioning Roadmap

This roadmap breaks the repositioning work into phases. Each phase should be completed, tested, reported, and approved before moving to the next phase.

## Phase 1: Brand Positioning

Goal: define what SeenYT is, who it serves, what it promises, and what should be removed from the main story.

Deliverables:

- `docs/brand-positioning.md`
- README reference to the positioning document
- Clear product pillars and workflow definitions
- Tool audit rules

Test:

- Confirm the document is committed as plain Markdown.
- Confirm the document gives enough guidance for homepage, dashboard, navigation, and tool cleanup.

Status: Completed

## Phase 2: Navigation Cleanup

Goal: make the app navigation match the new product positioning.

Scope:

- Dashboard sidebar.
- Mobile navigation.
- Primary dashboard links.
- Hide non-core routes from the main app journey.

Target navigation:

- Home
- Workflows
- AI Coach
- Tools
- Projects
- Account / Billing

Test:

- `npx tsc --noEmit`
- `npm run lint -- --file <changed-files>`
- Manual route check for dashboard and mobile nav.

Status: Completed

## Phase 3: Tool Audit

Goal: classify all current tools before deleting anything.

Categories:

- Keep
- Merge
- Hide
- Delete later

Deliverables:

- Tool inventory document.
- UI-safe visibility decision for each tool.
- List of routes/components to keep visible.
- List of routes/components to hide from navigation.

Test:

- Confirm no route is deleted before dependency review.
- Confirm dashboard only surfaces approved primary tools.

Status: Completed

## Phase 4: Real Workflow Implementation

Goal: turn the dashboard from a visual shell into usable YouTube workflows.

Workflows:

- Launch Channel
- Produce Video
- Improve Channel

Deliverables:

- Workflow state model.
- Workflow entry screen.
- Step-to-tool routing.
- Project or draft structure if needed.

Test:

- Walk through each workflow from start to finish.
- Confirm each step routes to the expected existing tool or page.

Status: Completed

## Phase 5: Internationalization

Goal: make primary UI work in Vietnamese, English, and Japanese.

Scope:

- Homepage.
- Dashboard home.
- Navigation.
- Core workflow labels.

Test:

- Check `/`, `/en`, and `/ja` where supported.
- Confirm no mojibake or broken text.
- Confirm labels fit on desktop and mobile.

Status: Completed

## Phase 6: Legacy Cleanup

Goal: remove noise after primary workflow is stable.

Scope:

- Old landing sections.
- Popups.
- Outdated routes.
- Duplicate components.
- Broken or unused pages.

Rule:

Hide first, delete later after dependency review.

Test:

- Build/typecheck.
- Manual smoke test for homepage, dashboard, AI Coach, and kept tools.

Status: Completed

## Phase 7: Final QA

Goal: verify the repositioned product is coherent and stable.

Test:

- `npx tsc --noEmit`
- Targeted lint on changed files.
- Responsive check.
- Auth flow check.
- Tool routing check.
- Language switch check.

Status: Completed
