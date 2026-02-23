# Accessibility Hand-off System v2.1

This repository produces screen reader accessibility annotations in Figma. It uses a **JSON-driven architecture**: the AI analyzes, the script builds, then verification confirms the result.

## Your Job: THREE Tasks

### Task 1 — ANALYZE (you do this)

1. Take a screenshot of the target screen
2. Identify every interactive element, text block, heading, image, and icon
3. Classify each element: Button (interactive), Label (text content), H (heading), Group (related items), Ignore (decorative)
4. Define reading order following comprehension logic (context before action, main content first)
5. Output a JSON matching `schema/handoff-data.schema.json`
6. See `examples/payment-screen.json` for a complete reference

**Note:** There is NO `side` field. All label cards appear on the right side automatically.

### Task 2 — BUILD (the script does this)

1. Paste the contents of `figma/build-handoff.js` into a `figma_execute` call
2. Pass your JSON as the `data` parameter to `buildHandoff(data)`
3. The script creates the entire hand-off layout:
   - Template (Section + Title flow + Sidebar + Flow section)
   - Cloned screen
   - Numbered badge circles ON each component
   - Colored highlight rectangles around components
   - Label cards stacked on the RIGHT side
   - NO lines (v2.1 design)

### Task 3 — VERIFY (mandatory, cannot skip)

1. Paste the contents of `figma/verify-handoff.js` into a `figma_execute` call
2. Call `verifyHandoff(screenFrameId, annotationCount)` with the IDs from Task 2
3. Post the FULL PASS/FAIL report to the user
4. If ANY check returns FAIL, fix the issue and re-run verification
5. You may NOT say "done" or "looks good" until ALL checks return PASS

**You do not have permission to give subjective opinions about the result.** Only the verify script decides if the output is correct.

## You Must NEVER

- Create frames, rectangles, or text nodes directly in Figma
- Design your own layout for the hand-off
- Create tables, cards, checklists, or any custom visual structure
- Skip the JSON step and go straight to building
- Improvise colors, fonts, spacing, or any visual property
- Rebuild screens from scratch (always clone via nodeId)
- Create connecting lines between tags and components (v2.1 has NO lines)
- Say "done" or "looks good" before verify-handoff.js returns all PASS
- Give subjective opinions about the visual result

## v2.1 Design

The hand-off uses this layout:
- Screen on the LEFT with numbered badges ON components and colored highlight rectangles
- Label cards stacked vertically on the RIGHT side of the screen
- NO lines connecting anything
- Ignore areas shown as hatched gray overlays

## Reading Order Principles

1. Context before action — read the title before navigation buttons
2. Main content first — body of the screen before auxiliary elements
3. Top-down within sections — headings before content
4. Group before detail — section name before items inside
5. Status before action — current state before the button that changes it
6. Decorative = skip — order: 0 for Ignore elements

## Tag Types

| Type | Color | When to use |
|------|-------|-------------|
| Button | Green `rgb(41,130,11)` | Interactive elements (buttons, links, toggles) |
| Label | Blue `rgb(39,72,113)` | Text content, descriptions, values |
| H | Purple `rgb(37,41,169)` | Section headings, screen titles |
| Group | Red `rgb(218,67,12)` | Outline around related items |
| Ignore | Gray `rgb(153,153,153)` | Overlay on decorative elements |

## File Index

| File | Purpose | When to read |
|------|---------|-------------|
| `schema/handoff-data.schema.json` | JSON format spec | Before generating JSON |
| `examples/payment-screen.json` | Complete example | Before generating JSON |
| `figma/build-handoff.js` | Build script | Execute after JSON is ready |
| `figma/verify-handoff.js` | QA verification | Execute after build |
| `docs/09-ai-reasoning-chain.md` | Analysis process | During Task 1 |
| `docs/10-anti-patterns.md` | Mistakes to avoid | During Task 1 |

## Quick Start Example

```
User: "Create an accessibility hand-off for the Login screen (node 1:221)"

Task 1 (ANALYZE):
-> Screenshot the screen
-> Generate JSON with annotations

Task 2 (BUILD):
-> Execute build-handoff.js with JSON
-> Get screenFrameId from result

Task 3 (VERIFY):
-> Execute verify-handoff.js with screenFrameId
-> Post PASS/FAIL report
-> If all PASS: "Done. Verification report: 10/10 checks passed."
-> If any FAIL: fix and re-verify
```