# 10 - Anti-Patterns Catalog

This document lists every known mistake an AI agent can make when creating accessibility hand-offs, along with the detection method and fix. Study these BEFORE creating any hand-off.

## AP-01: Rebuilding the Screen From Scratch

**Severity:** Critical
**What happened:** The AI created rectangles, text nodes, and shapes to rebuild the screen UI instead of using the existing screen.
**Why it's wrong:** The result is a tiny, inaccurate, simplified version of the screen that doesn't represent the real UI.
**Detection:** The screen frame contains RECTANGLE, TEXT, and FRAME children instead of a single RECTANGLE with IMAGE fill or a cloned frame.
**Fix:** ALWAYS clone the existing screen node (`node.clone()`) or export it as PNG and use as image fill on a rectangle.

```javascript
// WRONG - rebuilding
const title = figma.createText();
title.characters = "Payment";

// RIGHT - cloning
const original = await figma.getNodeByIdAsync(originalNodeId);
const clone = original.clone();
screenFrame.appendChild(clone);
```

## AP-02: Fixed-Width Tag Boxes

**Severity:** Critical
**What happened:** Tag boxes were created with a fixed width (e.g., 100px) regardless of text content.
**Why it's wrong:** Text gets clipped. "Credit Card **** 4236, Stanly Weber" becomes "Credit Card ****" with the rest invisible.
**Detection:** `tagBox.layoutSizingHorizontal !== 'HUG'` or `tagBox.width < textContent.width`
**Fix:** Set `layoutSizingHorizontal = 'HUG'` and `layoutSizingVertical = 'HUG'` on the tag box.

```javascript
// WRONG
tagBox.resize(100, 54);
tagBox.layoutSizingHorizontal = 'FIXED';

// RIGHT
tagBox.layoutSizingHorizontal = 'HUG';
tagBox.layoutSizingVertical = 'HUG';
```

## AP-03: Circle Endpoints on Lines

**Severity:** High
**What happened:** An ELLIPSE node (6x6px circle) was placed at the end of each line.
**Why it's wrong:** The current design does not use circle endpoints. Lines end cleanly.
**Detection:** Any ELLIPSE child inside the root tag frame.
**Fix:** Do not create ELLIPSE nodes. The line is just a filled FRAME with FILL sizing.

```javascript
// WRONG
const circle = figma.createEllipse();
circle.resize(6, 6);
parent.appendChild(circle);

// RIGHT
// No circle. Line frame fill IS the visible line.
```

## AP-04: Line as Separate Element

**Severity:** High
**What happened:** The line was created as a separate FRAME node, not part of the tag's auto-layout.
**Why it's wrong:** Moving or resizing the tag doesn't move the line. The line can't auto-resize.
**Detection:** Line FRAME is a sibling of the tag box (both children of the screen frame) instead of being inside a shared root frame with auto-layout.
**Fix:** Both the tag box and line frame must be children of a single root frame with auto-layout.

```javascript
// WRONG - separate elements
screen.appendChild(tagBox);
screen.appendChild(lineFrame);  // disconnected

// RIGHT - shared root with auto-layout
root.layoutMode = 'HORIZONTAL';
root.appendChild(tagBox);
root.appendChild(lineFrame);  // FILL sizing makes it resize automatically
```

## AP-05: Line Doesn't Resize (FIXED Instead of FILL)

**Severity:** High
**What happened:** The line frame has FIXED sizing instead of FILL, so resizing the root frame doesn't change the line length.
**Why it's wrong:** You can't adjust the tag-to-screen distance by resizing the root.
**Detection:** `lineFrame.layoutSizingHorizontal !== 'FILL'` (for horizontal tags)
**Fix:** Set `layoutSizingHorizontal = 'FILL'` for horizontal or `layoutSizingVertical = 'FILL'` for vertical.

## AP-06: Tags Overlapping Each Other

**Severity:** Medium
**What happened:** Multiple tags on the same side are stacked without proper spacing.
**Why it's wrong:** Tags become unreadable when they overlap.
**Detection:** `abs(tag1.y + tag1.height - tag2.y) < 32`
**Fix:** Enforce 32px gap: `nextTag.y = prevTag.y + prevTag.height + 32`

## AP-07: All Tags on One Side

**Severity:** Medium
**What happened:** All annotations were placed on the left (or right) side.
**Why it's wrong:** Creates a visual mess, lines cross each other, hard to read.
**Detection:** Count tags per side. If any side has > 5 tags while others have 0.
**Fix:** Redistribute using the side assignment rules:
- Left: Labels, Headings
- Right: Buttons (contextual), overflow
- Top: Header buttons
- Bottom: Final CTAs

## AP-08: Text Not Auto-Resizing

**Severity:** Medium
**What happened:** Text nodes have fixed width, causing long text to wrap or clip.
**Detection:** `textNode.textAutoResize !== 'WIDTH_AND_HEIGHT'`
**Fix:** Set `textAutoResize = 'WIDTH_AND_HEIGHT'` on every text node inside tag boxes.

## AP-09: Wrong Reading Order

**Severity:** Medium
**What happened:** Order badges follow visual layout (top-left to bottom-right) instead of comprehension logic.
**Why it's wrong:** A screen reader user needs context before actions.
**Detection:** Manual review - is the heading numbered before navigation buttons?
**Fix:** Follow reading order principles: Context -> Content -> Actions -> Navigation

## AP-10: Missing Template Structure

**Severity:** Low (functional but not standard)
**What happened:** Tags were placed directly on the canvas without the Section + Title flow + Flow section structure.
**Fix:** Always use `figma/handoff-template.js` to create the container structure first.

## AP-11: layoutSizingHorizontal Set Before appendChild

**Severity:** High (silent failure)
**What happened:** `layoutSizingHorizontal = 'HUG'` or `'FILL'` was set BEFORE the node was appended to an auto-layout parent.
**Why it's wrong:** Figma ignores sizing mode on orphan nodes. The property silently fails.
**Detection:** Sizing appears as FIXED despite being set to HUG/FILL.
**Fix:** ALWAYS append the child to the auto-layout parent FIRST, THEN set sizing.

```javascript
// WRONG
tagBox.layoutSizingHorizontal = 'HUG';  // ignored - no parent yet
root.appendChild(tagBox);

// RIGHT
root.appendChild(tagBox);  // append first
tagBox.layoutSizingHorizontal = 'HUG';  // now it works
```

## AP-12: Lines Not Connected to Components

**Severity:** Critical
**What happened:** Tag lines extend to arbitrary positions instead of touching the actual target component's edge on the screen.
**Why it's wrong:** The hand-off becomes ambiguous - it's unclear which component each tag refers to.
**Detection:** The root frame's edge (right for direita, left for esquerda, bottom for baixo, top for cima) does not align with the target component's position on screen.
**Fix:** Calculate the root frame dimensions so the line endpoint touches the target:

```javascript
// For "direita" (line goes right): right edge = target left edge X
root.x = 0;
root.resize(targetScreenX, root.height);

// For "esquerda" (line goes left): left edge = target right edge X
root.x = targetScreenX;
root.resize(screenWidth - targetScreenX, root.height);

// Y center alignment:
root.y = targetCenterY - Math.round(root.height / 2);
```

**Key principle:** Even on a screenshot (flat image), you MUST estimate each component's pixel position and use those coordinates for precise line placement.

## Quick Checklist Before Delivery

```
[ ] Screen is real (clone/screenshot), not rebuilt
[ ] Every tag box: HUG x HUG
[ ] Every line frame: FILL (horizontal) or FILL (vertical)
[ ] Zero ELLIPSE nodes in the entire hand-off
[ ] 32px gap between all stacked tags
[ ] Tags distributed across at least 2 sides
[ ] All text nodes: textAutoResize = WIDTH_AND_HEIGHT
[ ] Reading order follows comprehension logic
[ ] Template structure present (Section + Title flow + Sidebar + Flow section)
[ ] Final screenshot taken and visually validated
```