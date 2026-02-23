# 09 - AI Reasoning Chain (v2.1)

This document defines the thinking process for the ANALYSIS phase of an accessibility hand-off. The AI analyzes and produces JSON. The build script handles all visual construction. The verify script confirms correctness.

## Phase 0: Pre-flight Checks

```
[ ] Figma file is connected (MCP active)
[ ] The screen to annotate EXISTS in the Figma file (get its node ID)
[ ] Read schema/handoff-data.schema.json to understand the output format
[ ] Read examples/payment-screen.json to see a complete example
```

## Phase 1: Analyze the Screen

**Input:** A screen node ID or screenshot from the user.

**Steps:**
1. Call `figma_take_screenshot` of the target screen at scale 2-3
2. Identify every interactive element, text block, heading, image, and icon
3. Classify each element:
   - **Heading** -> H tag (purple)
   - **Text content** -> Label tag (blue)
   - **Interactive element** (button, link, toggle) -> Button tag (green)
   - **Group of related elements** (card, list item) -> Group outline (red)
   - **Decorative icon/image** (no semantic meaning) -> Ignore Area (gray)
4. Write down the full list before proceeding

**Decision tree for each element:**
```
Is it interactive?
  YES -> Button tag. What is the action? (navigate, toggle, submit, open)
  NO -> continue

Is it a heading or section title?
  YES -> H tag.
  NO -> continue

Is it meaningful text content?
  YES -> Label tag. What would a screen reader announce?
  NO -> continue

Is it a group of related items?
  YES -> Group outline.
  NO -> continue

Is it purely decorative?
  YES -> Ignore Area overlay.
  NO -> skip (status bar, system UI)
```

## Phase 2: Define Reading Order

**Rule:** Reading order follows COMPREHENSION logic, not visual layout.

**Principles (in priority order):**
1. Context before action — read the title before navigation buttons
2. Main content first — body of the screen before auxiliary elements
3. Top-down within sections — headings before content within each section
4. Group before detail — section name before items inside
5. Status before action — read current state before the button that changes it
6. Decorative = skip — order: 0 for Ignore/Group elements

**Example for a Payment screen:**
```
order 1  -> H: "Payment"                    (title first)
order 2  -> Label: "Credit Card"             (section context)
order 3  -> Button: "All tools"              (header action)
order 4  -> Button: "Settings"               (header action)
order 5  -> Label: "Card 1"                  (card details)
order 6  -> Label: "Card 2"                  (card details)
order 7  -> Button: "Add new card"           (section action)
order 0  -> Ignore: Status bar icons         (no badge)
```

## Phase 3: Generate JSON

Using the analysis from Phases 1-2, produce a JSON object matching `schema/handoff-data.schema.json`.

**Important:** There is NO `side` field in v2.1. All label cards appear on the right side automatically. You only need to provide:
- `order` — reading sequence number (0 for Ignore/Group)
- `componentName` — human-readable name
- `tagType` — Button, Label, H, Group, or Ignore
- `accessibilityName` — what the screen reader announces
- `role` — ARIA role
- `state` — optional, for Button tags only

## Phase 4: Execute Build Script

1. Read `figma/build-handoff.js`
2. Paste the script into `figma_execute`
3. Call `buildHandoff(data)` with your JSON
4. Save the returned `screenFrameId` and `annotationCount`

**You do NOT create any visual elements.** The script handles everything.

## Phase 5: Verify (MANDATORY)

1. Read `figma/verify-handoff.js`
2. Paste the script into `figma_execute`
3. Call `verifyHandoff(screenFrameId, annotationCount)`
4. Post the FULL report to the user
5. If any check is FAIL, diagnose and fix, then re-verify
6. You may NOT say "done" until all checks PASS

**You do not have permission to give subjective opinions.** Only the verify script decides.

## Recovery: What To Do When Verification Fails

| Failed Check | Fix |
|-------------|-----|
| Screen not cloned | Re-run with correct nodeId |
| Lines found | You used the wrong build script version. Use v2.1 (no lines) |
| No label cards | Build script did not execute properly. Re-run |
| No badges on screen | Build script did not execute properly. Re-run |
| Tag sizing not HUG | Run figma/repair-tag.js |
| Text not auto-resize | Run figma/repair-tag.js |
| Annotation count mismatch | Check your JSON has the right number of annotations |

## Quick Reference

```
ANALYZE  -> What elements exist? Classify each one.
ORDER    -> What sequence makes sense for a screen reader user?
JSON     -> Generate structured data matching the schema.
BUILD    -> Execute build-handoff.js. Do not create anything manually.
VERIFY   -> Execute verify-handoff.js. Post report. Fix if needed.
```