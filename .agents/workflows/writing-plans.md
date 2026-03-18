---
description: How to break down approved designs into actionable implementation plans
---

# Writing Plans

## Overview
Once a design/specification is approved (via brainstorming), you MUST break the work down into a step-by-step implementation plan before writing any code.

## The Rule of "Bite-Sized"
- Break the work down into tiny tasks that take 2-5 minutes each.
- A task is too big if it involves changing more than 1-2 files at once or implementing multiple logical components.

## Plan Structure
For each sub-task in the plan, you must specify:
1. **Goal**: What this specific step achieves.
2. **Files**: The exact file paths that will be created or modified.
3. **Code Changes**: A summary of what code will be written.
4. **Verification**: How to test that this specific step worked (e.g., "Run the API route in browser" or "Check terminal logs").

## Execution
- Present this detailed plan to the user.
- Execute steps SEQUENTIALLY.
- NEVER move to step N+1 until you have verified that step N is working correctly as per the validation instructions.
