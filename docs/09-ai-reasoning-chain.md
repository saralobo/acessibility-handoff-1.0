# 09 - AI Reasoning Chain (v2)

This document defines the thinking process for the ANALYSIS phase of an accessibility hand-off. The AI analyzes and produces JSON. The build script handles all visual construction.

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
   - **Heading** → H tag (purple)
   - **Text content** → Label tag (blue)
   - **Interactive element** (button, link, toggle) → Button tag (green)
   - **Group of related elements** (card, list item) → Group outline (red)
   - **Decorative icon/image** (no semantic meaning) → Ignore Area (gray)
4. Write down the full list before proceeding

**Decision tree for each element:**
```
Is it interactive?
  YES → Button tag. What is the action? (navigate, toggle, submit, open)
  NO → continue

Is it a heading or section title?
  YES → H tag.
  NO → continue

Is it meaningful text content?
  YES → Label tag. What would a screen reader announce?
  NO → continue

Is it a group of related items?
  YES → Group outline around all items in the group.
  NO → continue

Is it purely decorative?
  YES → Ignore Area overlay.
  NO → skip (status bar, system UI)
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

**Process:**
1. Assign order 1 to the screen's main heading (H1)
2. Assign order 2 to the first meaningful content element
3. Continue numbering following the principles above
4. Header actions (back, menu, help) come AFTER the main content they relate to
5. Footer CTAs come last
6. Groups and Ignore areas get order: 0 (no badge number)

**Example for a Payment screen:**
```
order 1  → H: "Payment"                    (title first)
order 2  → Label: "Credit Card"             (section context)
order 3  → Button: "All tools"              (header action, after context)
order 4  → Label: "Card **** 4236"          (card 1 details)
order 5  → Label: "Card **** 1357"          (card 2 details)
order 6  → Button: "Scan"                   (header action)
order 0  → Group: Card 1 outline            (no badge)
order 0  → Group: Card 2 outline            (no badge)
order 0  → Ignore: Status bar icons         (no badge)
```

## Phase 3: Plan Tag Placement

**Side distribution rules:**

| Side | What goes here | Max before redistributing |
|------|---------------|---------------------------|
| direita (left of screen) | Labels, Headings | 4-5 tags |
| esquerda (right of screen) | Buttons, overflow | 4-5 tags |
| baixo (top of screen) | Header buttons | 2-3 tags |
| cima (bottom of screen) | Footer CTAs | 2-3 tags |

**Rules:**
- Distribute across at least 2 sides
- If one side exceeds 5 tags, move excess to opposite side
- Related elements should be on the same side when possible

## Phase 4: Generate JSON

Using the analysis from Phases 1-3, produce a JSON object matching `schema/handoff-data.schema.json`.

Fill in:
- `screen.name` — the screen's human name
- `screen.nodeId` — the Figma node ID to clone
- `template.*` — metadata for the hand-off header
- `annotations[]` — every tag with order, type, side, name, role, and optional state

Validate your JSON against the schema before proceeding.

## Phase 5: Execute Build Script

1. Read `figma/build-handoff.js`
2. Paste the script into `figma_execute`
3. Call `buildHandoff(data)` with your JSON
4. The script creates everything in Figma
5. Take a screenshot to verify the result

**You do NOT create any visual elements.** The script handles all Figma construction.

## Recovery: What To Do When Something Breaks

| Symptom | Fix |
|---------|-----|
| Text is clipped | Run `figma/repair-tag.js` — fixes HUG sizing |
| Line doesn't reach component | Adjust root frame width in the script call |
| Tags overlap | Increase stackGap or redistribute to another side |
| Screen looks rebuilt | Always clone via nodeId, never create from scratch |

## Quick Reference

```
ANALYZE → What elements exist? What role does each play?
ORDER   → What sequence makes sense for someone who can't see?
PLAN    → Which side does each tag go? Distribute evenly.
JSON    → Generate structured data matching the schema.
BUILD   → Execute build-handoff.js. Screenshot. Verify. Done.
```