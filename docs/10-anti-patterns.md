# 10 - Anti-Patterns Catalog (v2.2)

This document lists every known mistake an AI agent can make when creating accessibility hand-offs, along with the detection method and fix. Study these BEFORE creating any hand-off.

## AP-01: Rebuilding the Screen From Scratch

**Severity:** Critical
**What happened:** The AI created rectangles, text nodes, and shapes to rebuild the screen UI instead of cloning the existing screen.
**Detection:** The device frame has <3 children, or contains only basic shapes.
**Verify check:** #3 (Device is cloned)
**Fix:** ALWAYS clone the existing screen node via nodeId.

## AP-02: Fixed-Width Tag Boxes

**Severity:** Critical
**What happened:** Label cards were created with a fixed width regardless of text content.
**Detection:** `card.layoutSizingHorizontal !== 'HUG'`
**Verify check:** #14 (HUG sizing)
**Fix:** Set `layoutSizingHorizontal = 'HUG'` and `layoutSizingVertical = 'HUG'` AFTER appendChild.

## AP-03: Creating Connecting Lines

**Severity:** Critical
**What happened:** The AI created lines or arrows connecting tags to components.
**Detection:** VECTOR, LINE nodes, or frames named "line" exist in the screen.
**Verify check:** #4 (No connecting lines)
**Fix:** v2.2 does NOT use lines. Use the build script which creates badges ON components.

## AP-04: Placing Labels on Multiple Sides

**Severity:** Critical
**What happened:** Labels were placed around the screen on different sides (left, right, top, bottom).
**Detection:** Any label card with `x <= deviceFrame.x + deviceFrame.width`.
**Verify check:** #6 (All labels on RIGHT)
**Fix:** All label cards go to the RIGHT of the device frame. There is no `side` field.

## AP-05: Missing targetBounds (Equal-Height Bands)

**Severity:** Critical
**What happened:** The AI omitted targetBounds from annotations. The build script either created equal-height bands dividing the screen or skipped highlights entirely.
**Detection:** All highlights have the same height and span full device width.
**Verify check:** #12 (NOT uniform bands)
**Fix:** Estimate targetBounds for EVERY annotation from the screenshot. Each component has a specific position — provide it as proportions (0.0-1.0).

## AP-06: Oversized Highlights

**Severity:** High
**What happened:** A highlight rectangle covers more than 40% of the device screen area.
**Detection:** `highlight.width * highlight.height > deviceArea * 0.4`
**Verify check:** #11 (No oversized highlights)
**Fix:** Review targetBounds — the component is probably not that large. Shrink bounds to match the actual component.

## AP-07: Highlights With Fills

**Severity:** High
**What happened:** Highlight rectangles have solid fills instead of being stroke-only, obscuring the screen content.
**Detection:** `highlight.fills` contains solid paints with opacity > 0.05.
**Verify check:** #10 (Stroke-only)
**Fix:** Highlights must have `fills = []` and only use `strokes`.

## AP-08: Badges Outside Device Bounds

**Severity:** High
**What happened:** Badge circles are floating far from the device frame.
**Detection:** Badge center is >20px outside device bounds.
**Verify check:** #9 (Badges near device)
**Fix:** Badges should be positioned at the corner of each highlight. Check targetBounds accuracy.

## AP-09: Overlapping Label Cards

**Severity:** High
**What happened:** Label cards on the right side overlap each other vertically.
**Detection:** `card[i].y < card[i-1].y + card[i-1].height`
**Verify check:** #7 (No overlap)
**Fix:** The build script uses `labelCardGap: 18` between cards. If overlapping occurs, check that all cards use HUG sizing.

## AP-10: Text Not Auto-Resizing

**Severity:** Medium
**What happened:** Text nodes have fixed width, causing long text to wrap or clip.
**Detection:** `textNode.textAutoResize !== 'WIDTH_AND_HEIGHT'`
**Verify check:** #15 (Text auto-resizes)
**Fix:** Set `textAutoResize = 'WIDTH_AND_HEIGHT'` on every text node.

## AP-11: Wrong Reading Order

**Severity:** Medium
**What happened:** Order badges follow visual layout instead of comprehension logic.
**Detection:** Badge numbers not sequential.
**Verify check:** #16 (Sequential badges)
**Fix:** Follow reading order: Context -> Content -> Actions -> Navigation.

## AP-12: Skipping Verification

**Severity:** Critical
**What happened:** The AI said "done" or "looks good" without running verify-handoff.js.
**Detection:** No verification report shown to user.
**Fix:** ALWAYS run verify-handoff.js. Post the full 16-check report. Fix any FAIL.

## AP-13: Creating Manual Figma Elements

**Severity:** Critical
**What happened:** The AI created frames, rectangles, or text directly via figma_execute instead of using the build script.
**Detection:** Elements exist that weren't created by buildHandoff().
**Fix:** ALWAYS use figma/build-handoff.js. Never create Figma elements manually.

## AP-14: layoutSizingHorizontal Set Before appendChild

**Severity:** High (silent failure)
**What happened:** Sizing was set BEFORE appending to an auto-layout parent.
**Detection:** Sizing appears as FIXED despite being set to HUG.
**Verify check:** #14 (HUG sizing)
**Fix:** ALWAYS append first, THEN set sizing.

## Quick Checklist Before Delivery

```
[ ] Screen is cloned (not rebuilt)
[ ] Every label card: HUG x HUG
[ ] Zero lines/vectors in the hand-off
[ ] All label cards on the RIGHT side
[ ] Every annotation has targetBounds
[ ] Highlights wrap individual components (not equal bands)
[ ] No highlight covers >40% of screen
[ ] Badges at corners of highlights, within device bounds
[ ] Badge numbers sequential (1, 2, 3...)
[ ] All text: textAutoResize = WIDTH_AND_HEIGHT
[ ] Reading order follows comprehension logic
[ ] verify-handoff.js: ALL 16 checks PASS
```