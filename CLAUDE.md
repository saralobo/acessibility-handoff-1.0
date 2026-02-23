# Accessibility Hand-off System v2.3

This repository produces screen reader accessibility annotations in Figma. It uses a **JSON-driven architecture**: the AI analyzes, the script builds, then verification confirms the result.

## Visual Reference (STUDY FIRST)

**Before building anything**, understand the expected visual output. You have two options:

### Option A: View the PNG screenshots (if your tool supports images)

- `examples/reference/full-handoff.png` — Complete hand-off layout (template + screen + labels)
- `examples/reference/screen-annotations.png` — Close-up of correct screen annotations

If you are in **Claude.ai Projects**, these PNGs must be uploaded as separate image files in the Knowledge section — Claude does not auto-read binary images from uploaded repos. If you are in **Cursor**, the PNGs are only viewable if the repo is cloned locally. If you are in **Claude Code** with a local clone, you can view them directly.

### Option B: Read the text description (works in ALL tools)

Read `examples/reference/README.md` — it contains **detailed ASCII diagrams and text descriptions** of exactly what the correct output looks like. This is the reliable fallback that works regardless of whether your tool can open PNG files.

### Key visual rules (memorize these):

- Badge circles are **24x24 pixels, perfect circles** — never stretched or squished
- Highlights are **stroke-only rectangles** wrapping individual components — NOT full-width bands
- Label cards are **ALL on the RIGHT side** of the device screen
- **NO connecting lines** — labels and components are matched by number only
- Card spacing is **18px** between each label card
- Colors: green (Button), blue (Label), purple (H), red dashed (Group), gray 30% (Ignore)

## Your Job: THREE Tasks

### Task 1 — ANALYZE (you do this)

1. Study the visual reference (PNG or text description in `examples/reference/README.md`)
2. Take a screenshot of the target screen
3. Identify every interactive element, text block, heading, image, and icon
4. Classify each element: Button (interactive), Label (text content), H (heading), Group (related items), Ignore (decorative)
5. Define reading order following comprehension logic (context before action, main content first)
6. **Estimate targetBounds** for each component (see below)
7. Output a JSON matching `schema/handoff-data.schema.json`
8. See `examples/payment-screen.json` for a complete reference

#### How to Estimate targetBounds (REQUIRED)

For each annotation, you MUST estimate where the component is on the screen. Express position as proportions (0.0 to 1.0) relative to the device frame:

- `x`: left edge (0.0 = left edge of screen, 1.0 = right edge)
- `y`: top edge (0.0 = top of screen, 1.0 = bottom)
- `width`: component width as proportion (1.0 = full screen width)
- `height`: component height as proportion (1.0 = full screen height)

**Examples:**
- Navigation bar at top, full width, ~5% tall: `{ "x": 0.0, "y": 0.0, "width": 1.0, "height": 0.05 }`
- Title centered at top: `{ "x": 0.25, "y": 0.05, "width": 0.5, "height": 0.04 }`
- Small button bottom-right: `{ "x": 0.75, "y": 0.9, "width": 0.2, "height": 0.05 }`
- Card spanning most of the width: `{ "x": 0.05, "y": 0.3, "width": 0.9, "height": 0.12 }`

**Without targetBounds, highlights will NOT be created.** The verify script will detect this as a problem.

### Task 2 — BUILD (the script does this)

1. Paste the contents of `figma/build-handoff.js` into a `figma_execute` call
2. Pass your JSON as the `data` parameter to `buildHandoff(data)`
3. The script creates the entire hand-off layout:
   - Template (Section + Title flow + Sidebar + Flow section)
   - Cloned screen
   - Highlight rectangles around components (using targetBounds)
   - Numbered badge circles (24x24) at the corner of each highlight
   - Label cards stacked on the RIGHT side
   - NO lines

### Task 3 — VERIFY (mandatory, cannot skip)

1. Paste the contents of `figma/verify-handoff.js` into a `figma_execute` call
2. Call `verifyHandoff(screenFrameId, annotationCount)` with the IDs from Task 2
3. Post the FULL PASS/FAIL report to the user
4. If ANY check returns FAIL, fix the issue and re-run verification
5. You may NOT say "done" or "looks good" until ALL checks return PASS

**You do not have permission to give subjective opinions about the result.** Only the verify script decides if the output is correct.

## What the Verify Script Checks (18 checks)

1. Screen frame exists
2. Screen has children
3. Device is cloned (not rebuilt) — must have >2 real children
4. No connecting lines or vectors
5. Label cards exist
6. ALL label cards on the RIGHT side of device
7. Label cards don't overlap each other
8. Badge circles exist
9. Badges are within device bounds (not floating outside)
10. Highlights are stroke-only (no solid fills)
11. No highlight covers >40% of screen area
12. Highlights are NOT equal-height bands (detects missing targetBounds)
13. Annotation count matches (labels + badges)
14. All cards use HUG sizing
15. All text nodes auto-resize
16. Badge numbers are sequential (1, 2, 3...)
17. On-screen badges are 24x24 (not distorted)
18. Label card badges are 24x24 (not distorted by auto-layout)

## You Must NEVER

- Create frames, rectangles, or text nodes directly in Figma
- Design your own layout for the hand-off
- Skip the JSON step and go straight to building
- Improvise colors, fonts, spacing, or any visual property
- Rebuild screens from scratch (always clone via nodeId)
- Create connecting lines (v2.3 has NO lines)
- Omit targetBounds from annotations (highlights will be missing)
- Say "done" before verify-handoff.js returns all PASS
- Give subjective opinions about the visual result

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
| Group | Red `rgb(218,67,12)` | Dashed outline around related items |
| Ignore | Gray `rgb(153,153,153)` | Semi-transparent overlay on decorative elements |

## File Index

| File | Purpose | When to read |
|------|---------|-------------|
| `examples/reference/README.md` | Visual reference — text descriptions + PNG info | **FIRST — before anything else** |
| `examples/reference/*.png` | Visual reference — screenshots (if your tool can view images) | **FIRST — if available** |
| `schema/handoff-data.schema.json` | JSON format spec | Before generating JSON |
| `examples/payment-screen.json` | Complete example with targetBounds | Before generating JSON |
| `figma/build-handoff.js` | Build script | Execute after JSON is ready |
| `figma/verify-handoff.js` | QA verification (18 checks) | Execute after build |
| `docs/09-ai-reasoning-chain.md` | Analysis process | During Task 1 |
| `docs/10-anti-patterns.md` | Mistakes to avoid | During Task 1 |
