# Accessibility Hand-off System v2

This repository produces screen reader accessibility annotations in Figma. It uses a **JSON-driven architecture**: the AI analyzes, the script builds.

## Your Job: TWO Tasks Only

### Task 1 — ANALYZE (you do this)

1. Take a screenshot of the target screen
2. Identify every interactive element, text block, heading, image, and icon
3. Classify each element: Button (interactive), Label (text content), H (heading), Group (related items), Ignore (decorative)
4. Define reading order following comprehension logic (context before action, main content first)
5. Output a JSON matching `schema/handoff-data.schema.json`
6. See `examples/payment-screen.json` for a complete reference

### Task 2 — BUILD (the script does this)

1. Paste the contents of `figma/build-handoff.js` into a `figma_execute` call
2. Pass your JSON as the `data` parameter to `buildHandoff(data)`
3. The script creates the entire hand-off layout deterministically
4. Take a screenshot of the result to verify

## You Must NEVER

- Create frames, rectangles, or text nodes directly in Figma
- Design your own layout for the hand-off
- Create tables, cards, checklists, or any custom visual structure
- Skip the JSON step and go straight to building
- Improvise colors, fonts, spacing, or any visual property
- Rebuild screens from scratch (always clone via nodeId)

## Reading Order Principles

1. Context before action — read the title before navigation buttons
2. Main content first — body of the screen before auxiliary elements
3. Top-down within sections — headings before content
4. Group before detail — section name before items inside
5. Status before action — current state before the button that changes it
6. Decorative = skip — no number for Ignore Area elements

## Tag Types

| Type | Color | When to use |
|------|-------|-------------|
| Button | Green | Interactive elements (buttons, links, toggles) |
| Label | Blue | Text content, descriptions, values |
| H | Purple | Section headings, screen titles |
| Group | Red | Outline around related items |
| Ignore | Gray | Overlay on decorative elements |

## Side Naming

| Name | Tag position | Line goes toward |
|------|-------------|------------------|
| direita | LEFT of screen | → RIGHT toward component |
| esquerda | RIGHT of screen | ← LEFT toward component |
| baixo | TOP of screen | ↓ DOWN toward component |
| cima | BOTTOM of screen | ↑ UP toward component |

## File Index

| File | Purpose | When to read |
|------|---------|-------------|
| `schema/handoff-data.schema.json` | JSON format spec | Before generating JSON |
| `examples/payment-screen.json` | Complete example | Before generating JSON |
| `figma/build-handoff.js` | Build script | Execute after JSON is ready |
| `docs/09-ai-reasoning-chain.md` | Analysis thinking process | During Task 1 |
| `docs/10-anti-patterns.md` | Mistakes to avoid | During Task 1 |
| `docs/11-component-detection.md` | Finding element boundaries | During Task 1 |
| `figma/detect-components.js` | Programmatic detection | Optional, for live frames |
| `figma/validate-handoff.js` | Post-build validation | After Task 2 |
| `figma/repair-tag.js` | Auto-fix issues | If validation fails |

## Quick Start Example

```
User: "Create an accessibility hand-off for the Login screen (node 1:221)"

You (Task 1):
→ Screenshot the screen
→ Identify: title heading, email input, password input, login button, forgot password link, sign up link
→ Define reading order
→ Generate JSON:
{
  "screen": { "name": "Login", "nodeId": "1:221" },
  "template": { "headline": "AUTH FLOW", "title": "Login", ... },
  "annotations": [
    { "order": 1, "tagType": "H", "side": "direita", ... },
    ...
  ]
}

You (Task 2):
→ Paste figma/build-handoff.js into figma_execute
→ Call buildHandoff(data) with your JSON
→ Screenshot the result to verify
→ Done.
```