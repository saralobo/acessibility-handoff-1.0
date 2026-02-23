---
description: Create an accessibility hand-off annotation in Figma. Analyzes a screen, generates structured JSON, executes the build script, and verifies the result.
---

# Accessibility Hand-off (v2.1 — No Lines, QA Verified)

You are creating an accessibility hand-off annotation in Figma using a three-step process: ANALYZE, BUILD, VERIFY.

Read the repository https://github.com/saralobo/acessibility-handoff-1.0 starting with CLAUDE.md.

## STEP 1: ANALYZE

1. **Screenshot** the target screen via `figma_take_screenshot`
2. **Identify** every element and classify it:
   - Interactive (button, link, toggle) -> `Button` tag (green)
   - Text content, descriptions -> `Label` tag (blue)
   - Headings, section titles -> `H` tag (purple)
   - Group of related items -> `Group` outline (red)
   - Decorative, no semantic meaning -> `Ignore` overlay (gray)
3. **Define reading order** (context before action, main content first)
4. **Generate JSON** matching `schema/handoff-data.schema.json`
   - See `examples/payment-screen.json` for reference
   - There is NO `side` field. All labels go to the right automatically.

## STEP 2: BUILD

1. **Read** `figma/build-handoff.js` from the repository
2. **Execute** via `figma_execute`: paste script, call `buildHandoff(data)` with your JSON
3. Save the `screenFrameId` from the result

## STEP 3: VERIFY (mandatory)

1. **Read** `figma/verify-handoff.js` from the repository
2. **Execute** via `figma_execute`: call `verifyHandoff(screenFrameId, annotationCount)`
3. **Post the full PASS/FAIL report** to the user
4. If ANY check returns FAIL, fix the issue and re-run verification
5. You may NOT say "done" until all checks pass

## CRITICAL RULES

1. **NEVER** create Figma elements manually. Only the build script creates visual output.
2. **NEVER** skip the JSON step or the verification step.
3. **NEVER** rebuild screens from scratch. The script clones via nodeId.
4. **NEVER** create connecting lines (v2.1 has no lines).
5. **NEVER** say "looks good" before verify-handoff.js returns all PASS.
6. **ALWAYS** post the verification report to the user.

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
      "state": "Optional, Button only"
    }
  ]
}
```