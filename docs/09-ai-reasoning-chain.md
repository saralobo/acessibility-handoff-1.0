# 09 - AI Reasoning Chain (v2.2)

This document defines the thinking process for the ANALYSIS phase of an accessibility hand-off. The AI analyzes and produces JSON. The build script handles all visual construction. The verify script confirms correctness.

## Phase 0: Pre-flight Checks

```
[ ] Figma file is connected (MCP active)
[ ] The screen to annotate EXISTS in the Figma file (get its node ID)
[ ] Read schema/handoff-data.schema.json to understand the output format
[ ] Read examples/payment-screen.json to see a complete example with targetBounds
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
   - **Group of related elements** (card, list item) -> Group outline (red dashed)
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

## Phase 3: Estimate Component Positions (targetBounds)

For EACH annotation, estimate where the component is on the screen as proportions (0.0 to 1.0) of the device frame.

**How to estimate:**
1. Look at the screenshot
2. Mentally divide the screen into a grid
3. Estimate the left edge (x), top edge (y), width, and height of each component
4. Express as proportions: x=0.0 is left, y=0.0 is top, width=1.0 is full width

**Examples:**
```
Status bar at very top:          { x: 0.0,  y: 0.0,  width: 1.0,  height: 0.03 }
Title centered near top:         { x: 0.25, y: 0.05, width: 0.50, height: 0.04 }
Back button top-left:            { x: 0.02, y: 0.05, width: 0.10, height: 0.04 }
Full-width card in middle:       { x: 0.05, y: 0.30, width: 0.90, height: 0.12 }
Small button bottom-right:       { x: 0.70, y: 0.90, width: 0.25, height: 0.06 }
Full-width CTA at bottom:        { x: 0.05, y: 0.85, width: 0.90, height: 0.08 }
```

**Why this matters:** Without targetBounds, the build script cannot position highlights accurately. The verify script will detect missing highlights and flag the hand-off as FAILED.

## Phase 4: Generate JSON

Using the analysis from Phases 1-3, produce a JSON object matching `schema/handoff-data.schema.json`.

**Every annotation needs:**
- `order` — reading sequence number (0 for Ignore/Group)
- `componentName` — human-readable name
- `tagType` — Button, Label, H, Group, or Ignore
- `accessibilityName` — what the screen reader announces
- `role` — ARIA role
- `targetBounds` — proportional position on screen
- `state` — optional, for Button tags only

## Phase 5: Execute Build Script

1. Read `figma/build-handoff.js`
2. Paste the script into `figma_execute`
3. Call `buildHandoff(data)` with your JSON
4. Save the returned `screenFrameId` and `annotationCount`
5. If the result includes a `warning`, go back and add missing targetBounds

**You do NOT create any visual elements.** The script handles everything.

## Phase 6: Verify (MANDATORY)

1. Read `figma/verify-handoff.js`
2. Paste the script into `figma_execute`
3. Call `verifyHandoff(screenFrameId, annotationCount)`
4. Post the FULL report (16 checks) to the user
5. If any check is FAIL, diagnose and fix, then re-verify
6. You may NOT say "done" until all checks PASS

## Recovery: What To Do When Verification Fails

| Failed Check | Likely Cause | Fix |
|-------------|-------------|-----|
| 3. Device not cloned | Wrong nodeId | Re-run with correct screen nodeId |
| 4. Lines found | Wrong script version | Use v2.2 build script (no lines) |
| 5-6. No/misplaced labels | Build failed | Re-run build script |
| 8-9. No/misplaced badges | Build failed | Re-run build script |
| 10. Highlights have fills | Script bug | Report to repo maintainer |
| 11. Oversized highlights | targetBounds too large | Review and shrink bounds |
| 12. Equal-height bands | Missing targetBounds | Add targetBounds to ALL annotations |
| 13. Count mismatch | JSON has wrong count | Check annotations array |
| 14. Cards not HUG | Sizing set before append | Report to repo maintainer |
| 16. Non-sequential badges | Gaps in order numbers | Fix order in JSON (1,2,3...) |