---
description: Create an accessibility hand-off for screen reader documentation in Figma. Analyzes a screen, defines reading order, creates annotation tags, and validates the result.
---

# Accessibility Hand-off

You are creating an accessibility hand-off annotation in Figma. Follow these rules strictly.

## MANDATORY WORKFLOW

```
1. ANALYZE   -> Screenshot the screen. List every element and its role.
2. DETECT    -> Run figma/detect-components.js to map component boundaries.
               If screenshot: use visual detection from docs/11-component-detection.md.
               OUTPUT: component map with connection points for each element.
3. ORDER     -> Define reading order (context -> content -> actions -> navigation).
4. PLAN      -> Assign tags to sides. Calculate positions from component map.
               root.width = connectionPoint.x - root.x (for direita)
               root.x = connectionPoint.x (for esquerda)
5. TEMPLATE  -> Create Hand-off section structure (figma/handoff-template.js).
6. CLONE     -> Clone or screenshot the original screen. NEVER rebuild.
7. CREATE    -> Build tags using exact auto-layout spec + component map positions.
8. VALIDATE  -> Run figma/validate-handoff.js. Fix any issues.
9. REPAIR    -> If validation fails, run figma/repair-tag.js to auto-fix.
10. REVIEW   -> Take final screenshot. Confirm lines touch components.
```

## TAG STRUCTURE (exact spec - do NOT deviate)

```
Root Frame
|--- layoutMode = HORIZONTAL (or VERTICAL for top/bottom)
|--- primaryAxisSizingMode = FIXED     <- controls total width
|--- counterAxisSizingMode = AUTO      <- HUGs height
|--- itemSpacing = 0
|--- fills = []                        <- transparent
|--- clipsContent = false
|
|--- Tag Box
|   |--- layoutSizingHorizontal = HUG  <- MUST be HUG (never FIXED)
|   |--- layoutSizingVertical = HUG    <- MUST be HUG (never FIXED)
|   |--- padding: 8 / 12 / 8 / 12
|   |--- cornerRadius = 8
|   |--- fill = [tag color]
|   |--- Badge (22x22, r=11, white, centered number in Roboto Bold 10)
|   |--- Content (VERTICAL HUGxHUG)
|       |--- Type: Roboto Bold 14 white
|       |--- Label: Roboto Regular 12 white (with quotes)
|       |--- State: Roboto Regular 10 white (buttons only, "ACTION: ...")
|
|--- Line Frame
    |--- layoutSizingHorizontal = FILL  <- MUST be FILL (stretches with root)
    |--- layoutSizingVertical = FIXED (2px height)
    |--- fill = [tag color]
    |--- NO circle endpoint. NO child nodes.
```

## LINE ENDPOINT POSITIONING (most common mistake)

Lines MUST touch the target component's edge. Calculate root frame dimensions:

```
DIREITA (line right):  root.width = targetLeftEdgeX - root.x
ESQUERDA (line left):  root.x = targetRightEdgeX
BAIXO (line down):     root.height = targetTopEdgeY - root.y
CIMA (line up):        root.y = targetBottomEdgeY
```

Y alignment: `root.y = targetCenterY - root.height / 2` (shift if overlap with 32px min gap)

Before creating ANY tag, map every target component's position:
1. Screenshot the device screen at scale 3
2. Estimate each element's (x, y) in device coordinates
3. Convert: `screenX = deviceX + deviceFrameX`, `screenY = deviceY + deviceFrameY`
4. Use these coordinates for precise root frame sizing

## CRITICAL RULES

1. **NEVER** rebuild screens from scratch. Clone or use screenshot.
2. **ALWAYS** set tag box to HUG x HUG. Text must expand the container.
3. **ALWAYS** set line to FILL sizing. Line must resize when root resizes.
4. **NEVER** add circle endpoints (ELLIPSE nodes) on lines.
5. **ALWAYS** set `layoutSizingHorizontal` AFTER `appendChild` (not before).
6. **ALWAYS** enforce 32px gap between stacked tags on the same side.
7. **ALWAYS** distribute tags across at least 2 sides.
8. **ALWAYS** set `textAutoResize = 'WIDTH_AND_HEIGHT'` on every text node.
9. **ALWAYS** validate after creating. Run validate script and fix issues.
10. **ALWAYS** take a final screenshot to visually confirm nothing is clipped.

## COLORS

| Tag     | RGB            | When to use                          |
|---------|----------------|--------------------------------------|
| Button  | 41, 130, 11    | Interactive elements (buttons, links, toggles) |
| Label   | 39, 72, 113    | Text content, descriptions, values   |
| H       | 37, 41, 169    | Section headings, screen titles      |
| Group   | 218, 67, 12    | Red outline around related items     |
| Ignore  | 153, 153, 153  | Gray overlay on decorative elements  |

## DIRECTION NAMING

| Name     | Tag position | Line goes toward |
|----------|-------------|------------------|
| direita  | LEFT side   | -> RIGHT          |
| esquerda | RIGHT side  | <- LEFT           |
| baixo    | TOP         | v DOWN           |
| cima     | BOTTOM      | ^ UP             |

## IF SOMETHING BREAKS

Read `docs/10-anti-patterns.md` for the full catalog of mistakes and fixes.
Quick fixes:
- Text clipped -> `tagBox.layoutSizingHorizontal = 'HUG'`
- Line won't resize -> `lineFrame.layoutSizingHorizontal = 'FILL'`
- Circles on line -> delete all ELLIPSE children
- Tags overlapping -> recalculate with 32px gap

## REFERENCE FILES

- `docs/09-ai-reasoning-chain.md` - full thinking process
- `docs/10-anti-patterns.md` - every known mistake and fix
- `docs/11-component-detection.md` - how to detect component boundaries
- `figma/detect-components.js` - automated component detection script
- `figma/handoff-template.js` - Hand-off section template code
- `figma/validate-handoff.js` - validation script
- `figma/repair-tag.js` - auto-repair script
- `docs/08-handoff-template.md` - visual template specifications