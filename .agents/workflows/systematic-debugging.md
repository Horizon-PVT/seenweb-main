---
description: How to perform systematic debugging when encountering ANY bug or issue
---

# Systematic Debugging

## Overview
Random fixes waste time and create new bugs. Quick patches mask underlying issues.
**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law
**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST**
If you haven't completed Phase 1, you cannot propose fixes.

## The Four Phases (You MUST complete each phase before proceeding to the next)

### Phase 1: Root Cause Investigation
**BEFORE attempting ANY fix:**
1. **Read Error Messages Carefully**: Read stack traces completely. Note line numbers, file paths.
2. **Reproduce Consistently**: Can you trigger it reliably? If not reproducible -> gather more data, don't guess.
3. **Check Recent Changes**: Git diff, recent commits, environmental differences.
4. **Gather Evidence in Multi-Component Systems**: Add `console.log` or instrumentation to check data at boundaries BEFORE proposing fixes. Wait for user to run and provide logs.
5. **Trace Data Flow**: Trace backward from the error line to see where the bad value originated.

### Phase 2: Pattern Analysis
1. **Find Working Examples**: Locate similar working code in the same codebase.
2. **Compare Against References**: Read reference implementations COMPLETELY.
3. **Identify Differences**: List every difference, however small.

### Phase 3: Hypothesis and Testing
1. **Form Single Hypothesis**: State clearly: "I think X is the root cause because Y."
2. **Test Minimally**: Make the SMALLEST possible change to test hypothesis. One variable at a time.
3. **Verify Before Continuing**: Did it work? Yes -> Phase 4. Didn't work? Form NEW hypothesis. DON'T add more fixes on top.

### Phase 4: Implementation
1. **Implement Single Fix**: Address the root cause identified. ONE change at a time. No "while I'm here" improvements.
2. **Verify Fix**: Ensure tests pass and issue is resolved.
3. **If Fix Doesn't Work (3+ failures)**: STOP. Question the architecture. Discuss with the human partner before attempting more fixes.

## Red Flags - STOP and Follow Process
If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "It's probably X, let me fix that"
- Proposing solutions before tracing data flow.
**ALL of these mean: STOP. Return to Phase 1.**
