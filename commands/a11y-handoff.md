---
description: Create an accessibility hand-off annotation in Figma. Analyzes a screen, generates structured JSON, and executes the build script for deterministic output.
---

# Accessibility Hand-off (v2 — JSON-driven)

You are creating an accessibility hand-off annotation in Figma using a two-step process: ANALYZE then BUILD.

## STEP 1: ANALYZE

1. **Screenshot** the target screen via `figma_take_screenshot`
2. **Identify** every element and classify it:
   - Interactive (button, link, toggle) → `Button` tag (green)
   - Text content, descriptions → `Label` tag (blue)
   - Headings, section titles → `H` tag (purple)
   - Group of related items → `Group` outline (red)
   - Decorative, no semantic meaning → `Ignore` overlay (gray)
3. **Define reading order** following these principles:
   - Context before action
   - Main content first
   - Top-down within sections
   - Group before detail
   - Status before action
   - Decorative = skip (order: 0)
4. **Assign sides**: distribute tags across at least 2 sides
   - `direita` = tag on LEFT, line points RIGHT
   - `esquerda` = tag on RIGHT, line points LEFT
   - `baixo` = tag on TOP, line points DOWN
   - `cima` = tag on BOTTOM, line points UP
5. **Generate JSON** matching `schema/handoff-data.schema.json`
   - See `examples/payment-screen.json` for reference

## STEP 2: BUILD

1. **Read** `figma/build-handoff.js` from the repository
2. **Execute** via `figma_execute`: paste the script contents, then call `buildHandoff(data)` with your JSON
3. **Screenshot** the result to verify visual correctness
4. **Validate** with `figma/validate-handoff.js` if needed

## CRITICAL RULES

1. **NEVER** create Figma elements manually. Only the build script creates visual output.
2. **NEVER** skip the JSON step. Always generate structured data first.
3. **NEVER** rebuild screens from scratch. The script clones via nodeId.
4. **NEVER** improvise layouts, colors, fonts, or spacing.
5. **ALWAYS** generate JSON before executing the build script.
6. **ALWAYS** screenshot the result to verify.

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
      "side": "direita|esquerda|baixo|cima",
      "accessibilityName": "What screen reader announces",
      "role": "ARIA role",
      "state": "Optional, Button only"
    }
  ]
}
```

## REFERENCE FILES

- `docs/09-ai-reasoning-chain.md` — full thinking process for analysis
- `docs/10-anti-patterns.md` — mistakes to avoid
- `docs/11-component-detection.md` — how to detect component boundaries