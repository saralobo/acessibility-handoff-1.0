---
description: Create an accessibility hand-off annotation in Figma. Analyzes a screen, generates structured JSON with targetBounds, executes the build script, and verifies with 18 strict checks.
---

# Accessibility Hand-off (v2.3 — targetBounds + Strict QA + Reference PNGs)

You are creating an accessibility hand-off annotation in Figma using a three-step process: ANALYZE, BUILD, VERIFY.

Read the repository https://github.com/saralobo/acessibility-handoff-1.0 starting with CLAUDE.md.

## STEP 0: STUDY REFERENCE

**Before starting**, study the reference screenshots in `examples/reference/` (or download them per `examples/reference/README.md`):
- `full-handoff.png` — Complete layout with template, sidebar, and annotated screen
- `screen-annotations.png` — Close-up: highlights, badges (24x24 circles), label cards on right

This is what the final output MUST look like. Pay attention to badge proportions (perfect circles), highlight sizing (wrapping components, not full-width bands), and card placement (right side only).

## STEP 1: ANALYZE

1. **Screenshot** the target screen via `figma_take_screenshot`
2. **Compare** your screenshot with the reference PNGs to understand expected output
3. **Identify** every element and classify it:
   - Interactive (button, link, toggle) -> `Button` tag (green)
   - Text content, descriptions -> `Label` tag (blue)
   - Headings, section titles -> `H` tag (purple)
   - Group of related items -> `Group` outline (red dashed)
   - Decorative, no semantic meaning -> `Ignore` overlay (gray)
4. **Define reading order** (context before action, main content first)
5. **Estimate targetBounds** for each component — proportions 0.0 to 1.0 relative to the device frame:
   - `x`: left edge, `y`: top edge, `width`: component width, `height`: component height
   - Example: title at top center -> `{ "x": 0.25, "y": 0.05, "width": 0.5, "height": 0.04 }`
   - **Without targetBounds, highlights will NOT be created and verify will fail.**
6. **Generate JSON** matching `schema/handoff-data.schema.json`
   - See `examples/payment-screen.json` for reference with targetBounds

## STEP 2: BUILD

1. **Read** `figma/build-handoff.js` from the repository
2. **Execute** via `figma_execute`: paste script, call `buildHandoff(data)` with your JSON
3. Save the `screenFrameId` and `annotationCount` from the result
4. If the result includes a `warning` about missing targetBounds, go back and add them

## STEP 3: VERIFY (mandatory)

1. **Read** `figma/verify-handoff.js` from the repository
2. **Execute** via `figma_execute`: call `verifyHandoff(screenFrameId, annotationCount)`
3. **Post the full PASS/FAIL report** to the user
4. If ANY check returns FAIL, fix the issue and re-run verification
5. You may NOT say "done" until all 18 checks pass

## CRITICAL RULES

1. **NEVER** create Figma elements manually. Only the build script creates visual output.
2. **NEVER** skip the JSON step or the verification step.
3. **NEVER** omit targetBounds — highlights and badges need accurate positions.
4. **NEVER** create connecting lines (no lines in v2.3).
5. **NEVER** say "looks good" before verify-handoff.js returns all PASS.
6. **ALWAYS** study the reference PNGs before building.
7. **ALWAYS** post the verification report to the user.

## JSON SCHEMA (summary)

```json
{
  "screen": { "name": "string", "nodeId": "string" },
  "template": {
    "headline": "UPPERCASE CATEGORY",
    "title": "Flow Name",
    "description": "Context description",
    "subflowLabel": "Sub-flow",
    "flowName": "Section name"
  },
  "annotations": [
    {
      "order": 1,
      "componentName": "Element name",
      "tagType": "Button|Label|H|Group|Ignore",
      "accessibilityName": "What screen reader announces",
      "role": "ARIA role",
      "state": "Optional, Button only",
      "targetBounds": { "x": 0.0, "y": 0.0, "width": 0.5, "height": 0.1 }
    }
  ]
}
```