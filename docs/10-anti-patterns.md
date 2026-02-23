# 10 - Anti-Patterns Catalog (v2.1)

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

## AP-03: Creating Connecting Lines (v2.1)

**Severity:** Critical
**What happened:** The AI created lines or arrows connecting tags to components.
**Why it's wrong:** v2.1 does NOT use connecting lines. Numbered badges on the screen and numbered label cards on the right side create the visual association.
**Detection:** Any VECTOR, LINE, or frame named "line" inside the screen frame.
**Fix:** Do not create any lines. Use `figma/build-handoff.js` v2.1 which places badges ON components and label cards on the right.

```javascript
// WRONG - creating lines
const line = figma.createVector();
line.strokeWeight = 2;

// RIGHT - no lines in v2.1
// The build script creates badges ON the screen and labels on the RIGHT
```

## AP-04: Placing Labels on Multiple Sides

**Severity:** Critical
**What happened:** The AI placed labels around the screen on different sides (left, right, top, bottom).
**Why it's wrong:** v2.1 places ALL label cards on the RIGHT side of the screen. There is no `side` field in the schema.
**Detection:** Any label card with `x < deviceFrame.x`.
**Fix:** All label cards must be to the right of the device frame.

## AP-05: Missing On-Screen Badges

**Severity:** High
**What happened:** Label cards were created but no numbered badge circles were placed on the screen components.
**Why it's wrong:** Without on-screen badges, there's no visual link between the component and its label card.
**Detection:** No children named "Badge N" inside the screen frame.
**Fix:** The build script creates a 22x22 colored circle with the reading order number near each component.

## AP-06: Missing Highlight Rectangles

**Severity:** High
**What happened:** Components on the screen have no colored outline/rectangle around them.
**Why it's wrong:** Without highlights, it's hard to see which area of the screen each annotation refers to.
**Detection:** No children named "Highlight N" inside the screen frame.
**Fix:** The build script creates a colored stroke rectangle around each component's estimated area.

## AP-07: Text Not Auto-Resizing

**Severity:** Medium
**What happened:** Text nodes have fixed width, causing long text to wrap or clip.
**Detection:** `textNode.textAutoResize !== 'WIDTH_AND_HEIGHT'`
**Fix:** Set `textAutoResize = 'WIDTH_AND_HEIGHT'` on every text node inside tag boxes.

## AP-08: Wrong Reading Order

**Severity:** Medium
**What happened:** Order badges follow visual layout (top-left to bottom-right) instead of comprehension logic.
**Why it's wrong:** A screen reader user needs context before actions.
**Detection:** Manual review - is the heading numbered before navigation buttons?
**Fix:** Follow reading order principles: Context -> Content -> Actions -> Navigation

## AP-09: Missing Template Structure

**Severity:** Low (functional but not standard)
**What happened:** Tags were placed directly on the canvas without the Section + Title flow + Flow section structure.
**Fix:** Always use the build script which creates the full template automatically.

## AP-10: layoutSizingHorizontal Set Before appendChild

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

## AP-11: Skipping Verification

**Severity:** Critical
**What happened:** The AI said "done" or "looks good" without running `verify-handoff.js`.
**Why it's wrong:** Subjective AI opinions are unreliable. Only the verification script provides objective PASS/FAIL checks.
**Detection:** No verification report was shown to the user.
**Fix:** ALWAYS run `figma/verify-handoff.js` after building. Post the full report. Fix any FAIL checks.

## AP-12: Creating Manual Figma Elements

**Severity:** Critical
**What happened:** The AI created frames, rectangles, text nodes, or other elements directly via `figma_execute` instead of using the build script.
**Why it's wrong:** Manual creation produces inconsistent output. The build script is the ONLY path to correct visual output.
**Detection:** Elements exist that weren't created by `buildHandoff()`.
**Fix:** Always use `figma/build-handoff.js`. Never create Figma elements manually.

## Quick Checklist Before Delivery

```
[ ] Screen is real (clone/screenshot), not rebuilt
[ ] Every label card: HUG x HUG
[ ] Zero lines/vectors in the entire hand-off
[ ] All label cards on the RIGHT side of the screen
[ ] Numbered badges ON each component on the screen
[ ] Highlight rectangles around components
[ ] All text nodes: textAutoResize = WIDTH_AND_HEIGHT
[ ] Reading order follows comprehension logic
[ ] Template structure present (Section + Title flow + Sidebar + Flow section)
[ ] verify-handoff.js executed and ALL checks PASS
```