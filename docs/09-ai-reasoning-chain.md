# 09 - AI Reasoning Chain

This document defines the exact thinking process an AI agent must follow when creating an accessibility hand-off. It is designed for consumption by Cursor, Claude Code, or any tool with Figma MCP access.

## Phase 0: Pre-flight Checks

Before creating anything, verify:

```
[ ] Figma file is connected (MCP active)
[ ] Fonts are loadable: Roboto Bold, Roboto Regular, Roboto SemiBold
[ ] The screen to annotate EXISTS in the Figma file (get its node ID)
[ ] NEVER rebuild a screen from scratch - use clone or screenshot
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
   - **Decorative icon/image** (no semantic meaning) -> Ignore Area (gray hatched)
4. Write down the full list before creating anything

**Decision questions for each element:**
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
  YES -> Group outline around all items in the group.
  NO -> continue

Is it purely decorative?
  YES -> Ignore Area overlay.
  NO -> skip (status bar, system UI)
```

## Phase 2: Define Reading Order

**Rule:** Reading order follows COMPREHENSION logic, not visual layout.

**Principles (in priority order):**
1. Context before action - read the title before navigation buttons
2. Main content first - body of the screen before auxiliary elements
3. Top-down within sections - headings before content within each section
4. Group before detail - section name before items inside
5. Status before action - read current state before the button that changes it
6. Decorative = skip - no number for Ignore Area elements

**Process:**
1. Assign {1} to the screen's main heading (H1)
2. Assign {2} to the first meaningful content element
3. Continue numbering following the principles above
4. Header actions (back, menu, help) come AFTER the main content they relate to
5. Footer CTAs come last
6. Write out the full sequence before coding

**Example for a Payment screen:**
```
{1}  H: "Payment"                          - title first
{2}  Label: "Credit Card"                  - section context
{3}  Button: "All tools"                   - header action (after context)
{4}  Button: "Scan"                        - header action
{5}  Label: "Card **** 4236, Stanly Weber" - card 1 details
{6}  Label: "Card **** 1357, Stanly Weber" - card 2 details
{7}  Button: "Add New Card"                - section action
{8}  H: "Others"                           - next section heading
{9}  Label: "2 Methods Added"              - section status
{10} Button: "PayPal"                      - option
{11} Button: "Google Pay"                  - option
```

## Phase 2.5: Detect Component Boundaries

**This is the most critical step.** Before creating any tag, you MUST know the exact pixel boundaries of every target component. See `docs/11-component-detection.md` for the full strategy.

### Option A: Programmatic detection (preferred)

If you have access to the original screen as a live Figma frame (not flattened):

```javascript
// Run figma/detect-components.js, then:
const result = await detectComponents('ORIGINAL_SCREEN_NODE_ID');
// result.components[] gives exact bounds and connectionPoints for every element
```

Or use hybrid detection if the annotation will be on a screenshot but you have the original:

```javascript
const result = await hybridDetect('ORIGINAL_NODE_ID', deviceFrameX, deviceFrameY);
// result.components[].screenConnectionPoints gives positions in screen frame space
```

### Option B: Visual detection (when no live frame available)

1. Take a high-res screenshot: `figma_take_screenshot(nodeId, scale: 3)`
2. Divide the screen into zones (header 0-80px, title 80-160px, content 160-500px, footer 500+)
3. For each component, estimate its bounding box using proportional method:
   - Position as fraction of screen: `x ~ screenWidth x fraction`
   - Use common sizes: heading ~30px tall, card ~80px, button ~48px, icon ~24px
4. Convert device coords to screen frame coords: `screenX = deviceX + deviceFrameX`

### Output format

Regardless of method, you must produce a **component map** before creating tags:

```
COMPONENT MAP:
1. "Payment" (heading)     -> leftEdge(290, 236)  -> tag side: LEFT
2. "Credit Card" (text)    -> leftEdge(290, 273)  -> tag side: LEFT
3. Menu icon (icon)        -> topEdge(307, 171)   -> tag side: TOP
4. QR icon (icon)          -> rightEdge(554, 171) -> tag side: RIGHT
5. Card 1 (container)      -> leftEdge(290, 346)  -> tag side: LEFT
6. Card 2 (container)      -> leftEdge(290, 441)  -> tag side: LEFT
7. "Add New Card" (button) -> bottomEdge(432,511) -> tag side: BOTTOM
8. "Others" (heading)      -> rightEdge(572, 556) -> tag side: RIGHT
9. PayPal row (component)  -> rightEdge(572, 606) -> tag side: RIGHT
10. Google Pay (component)  -> rightEdge(572, 661) -> tag side: RIGHT
```

**Only after producing this map** should you proceed to Phase 3.

## Phase 3: Plan Tag Placement

**Line endpoint positioning (non-negotiable):**

The line's TIP must touch the target component's edge. This is controlled by the root frame's dimensions:

| Direction | Line tip position | How to set it |
|-----------|------------------|---------------|
| direita   | Root right edge  | `root.width = targetX - root.x` |
| esquerda  | Root left edge   | `root.x = targetX` |
| baixo     | Root bottom edge | `root.height = targetY - root.y` |
| cima      | Root top edge    | `root.y = targetY` |

The line's VERTICAL center (for horizontal tags) should align with the target's center Y:
`root.y = targetCenterY - root.height / 2`

If this causes overlap with the previous tag, shift down to maintain 32px gap. The line will still point at the correct X coordinate even if the Y is slightly offset.

**Side distribution rules:**
| Side   | What goes here                              | Max before redistributing |
|--------|---------------------------------------------|---------------------------|
| Left   | Labels (content), Headings                  | 4-5 tags                  |
| Right  | Buttons (contextual actions), overflow       | 4-5 tags                  |
| Top    | Header buttons (back, menu, help)           | 2-3 tags                  |
| Bottom | Final CTAs, cancel, footer actions          | 2-3 tags                  |

**Stacking rules:**
- Tags on the same side: **32px vertical gap** between them
- Calculate positions BEFORE creating: `nextY = prevY + prevHeight + 32`
- If one side exceeds 5 tags, redistribute excess to the opposite side

**Line direction naming:**
| Name      | Tag position | Line extends toward |
|-----------|-------------|---------------------|
| direita   | LEFT side   | -> RIGHT to screen  |
| esquerda  | RIGHT side  | <- LEFT to screen   |
| baixo     | TOP         | v DOWN to screen   |
| cima      | BOTTOM      | ^ UP to screen     |

## Phase 4: Create the Template

**Always** use the Hand-off template structure first:
1. Section "Hand-off" (white)
2. Title flow (dark `#262536`, r=80, with HEADLINE + Title + Description)
3. Sub-flow sidebar (gray `#EDEDED`, r=40)
4. Flow section (dark `#262536`)
5. Screen frames (861x864, transparent, clip=false)

Refer to `figma/handoff-template.js` for exact code.

## Phase 5: Create Tags

**For EACH tag, use this exact structure:**

```
Root Frame (HORIZONTAL or VERTICAL auto-layout)
|--- primaryAxisSizingMode = FIXED (controls total width/height)
|--- counterAxisSizingMode = AUTO (HUGs cross-axis)
|--- itemSpacing = 0
|--- fills = [] (transparent)
|--- clipsContent = false
|
|--- [if direita/baixo] Tag Box FIRST, then Line Frame
|--- [if esquerda/cima] Line Frame FIRST, then Tag Box
|
|--- Tag Box (FRAME)
|   |--- layoutMode = HORIZONTAL
|   |--- layoutSizingHorizontal = HUG  <- CRITICAL: must be HUG
|   |--- layoutSizingVertical = HUG    <- CRITICAL: must be HUG
|   |--- padding: T=8, R=12, B=8, L=12
|   |--- cornerRadius = 8
|   |--- itemSpacing = 8
|   |--- fill = [tag color]
|   |
|   |--- Badge (FRAME 22x22, r=11, white fill)
|   |   |--- Number text (Roboto Bold, fs=10, black, centered)
|   |
|   |--- Content (FRAME, VERTICAL, HUGxHUG)
|       |--- Type text (Roboto Bold, fs=14, white) - "Button", "Label", "H"
|       |--- Label text (Roboto Regular, fs=12, white) - "Credit Card"
|       |--- [buttons only] State text (Roboto Regular, fs=10, white) - "ACTION: Navigate"
|
|--- Line Frame (FRAME)
    |--- [horizontal] layoutSizingHorizontal = FILL, layoutSizingVertical = FIXED, height = 2px
    |--- [vertical]   layoutSizingHorizontal = FIXED, layoutSizingVertical = FILL, width = 2px
    |--- fill = [tag color]
    |--- NO circle endpoint. NO child elements needed.
```

**Color tokens:**
| Tag type | RGB              | Hex     |
|----------|------------------|---------|
| Button   | `rgb(41,130,11)` | `#29820B` |
| Label    | `rgb(39,72,113)` | `#274871` |
| Heading  | `rgb(37,41,169)` | `#2529A9` |
| Group    | `rgb(218,67,12)` | `#DA430C` |
| Ignore   | `rgb(153,153,153)` | `#999999` |

## Phase 6: Validate

**After creating ALL tags, run validation.** Check each tag for:

```
[ ] Tag box layoutSizingHorizontal === 'HUG' (not FIXED, not FILL)
[ ] Tag box layoutSizingVertical === 'HUG' (not FIXED, not FILL)
[ ] Line frame layoutSizingHorizontal === 'FILL' (for horizontal tags)
[ ] Line frame layoutSizingVertical === 'FILL' (for vertical tags)
[ ] No ELLIPSE children anywhere (no circle endpoints)
[ ] All text nodes have textAutoResize === 'WIDTH_AND_HEIGHT'
[ ] Tag box text is fully visible (not clipped by container)
[ ] Gap between stacked tags >= 32px
[ ] Screen is a clone/screenshot, NOT rebuilt from scratch
```

Use `figma/validate-handoff.js` to automate this check.

## Phase 7: Screenshot & Review

1. Take screenshot of each annotated screen at scale 2-3
2. Visually confirm:
   - All text is fully readable (not cut off)
   - Lines connect tags to their target elements
   - No tags overlap each other or the screen
   - Colors are correct for each tag type
   - Numbers follow the planned reading order
3. If issues found -> go to `docs/10-anti-patterns.md` for fix procedures

## Recovery: What To Do When Something Breaks

| Symptom | Cause | Fix |
|---------|-------|-----|
| Text is cut off / clipped | Tag box has FIXED sizing | Set `layoutSizingHorizontal = 'HUG'` and `layoutSizingVertical = 'HUG'` |
| Line doesn't resize when root is resized | Line frame has FIXED sizing | Set `layoutSizingHorizontal = 'FILL'` (or vertical for vertical tags) |
| Circle at end of line | Ellipse child node exists | Delete all ELLIPSE children from the root frame |
| Tags overlap each other | Gap < 32px | Recalculate: `nextY = prevY + prevHeight + 32` |
| Screen looks rebuilt / fake | Manually created rectangles | Clone the original screen node or use image fill with exported PNG |
| Tag box doesn't expand with longer text | Text node has FIXED width or truncation | Set `textAutoResize = 'WIDTH_AND_HEIGHT'` on all text nodes |
| Line is invisible | Line frame fill color wrong or opacity 0 | Set fill to tag color with full opacity |

## Reasoning Summary (Quick Reference)

```
ANALYZE -> What elements exist? What role does each play?
ORDER   -> What sequence makes sense for someone who can't see?
PLAN    -> Which side does each tag go? Calculate positions.
CREATE  -> Use template + tag functions. HUG boxes. FILL lines.
VALIDATE -> Run checks. Screenshot. Fix issues.
```