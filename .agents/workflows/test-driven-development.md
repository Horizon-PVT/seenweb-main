---
description: How to write code using Test-Driven Development (TDD) principles
---

# Test-Driven Development (TDD)

## Overview
When writing new logic or fixing bugs, follow the **RED-GREEN-REFACTOR** cycle. This prevents writing code that isn't actually tested or doesn't actually solve the problem.

## The Cycle

### 1. RED (Write Failing Test)
- **Action**: Before you change any production code, write a test or a simple reproduction script/console log that fails.
- **Rule**: You MUST see it fail. If it passes on the first try, your test is wrong or you're testing the wrong thing.

### 2. GREEN (Make it Pass Minimalistically)
- **Action**: Write the absolute minimum amount of code required to make the failing test pass.
- **Rule**: Do not over-engineer. Do not add extra features "just in case" (YAGNI - You Aren't Gonna Need It). Just make the error go away.

### 3. REFACTOR (Clean Code)
- **Action**: Now that the test passes and acts as a safety net, clean up the code.
- **Rule**: Remove duplication (DRY), improve naming, extract methods. The test MUST remain passing after every refactoring step.

## Enforcement
- If you are asked to fix a bug in `seenweb-main`, you must first find a way to reproduce it (RED). 
- Do not propose the final fix until you have proven you can reproduce the failure state.
