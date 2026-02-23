# 08 - Hand-off Template Structure

The accessibility hand-off must always follow this exact visual layout in Figma. Every hand-off delivery uses this same section hierarchy, colors, typography, and spacing.

## Hierarchy

```
Hand-off (SECTION, white)
|--- Title flow (FRAME, dark, rounded)
|   |--- Text (FRAME, vertical auto-layout)
|       |--- HEADLINE - uppercase label (fs 50)
|       |--- Title - flow name (fs 200)
|       |--- Description - context (fs 32)
|--- Sub-flow (GROUP)
|   |--- Sidebar frame (FRAME, light gray, rounded)
|       |--- "Sub-flow" text (fs 64, centered)
|--- {Flow name} (SECTION, dark)
    |--- Screen {1} (FRAME, transparent)
    |   |--- {Screen name} (screenshot or frame)
    |   |--- annotation tags...
    |--- Screen {2}
    |--- ...
```

## Color Tokens

| Element | RGB | Hex | Usage |
|---------|-----|-----|-------|
| Title flow / Flow section fill | `rgb(38, 37, 54)` | `#262536` | Dark background for header and screen containers |
| Sub-flow sidebar fill | `rgb(237, 237, 237)` | `#EDEDED` | Light gray label sidebar |
| Section background | `rgb(255, 255, 255)` | `#FFFFFF` | Main hand-off section |
| All text in title | `rgb(255, 255, 255)` | `#FFFFFF` | White text on dark background |
| Sub-flow text | `rgb(0, 0, 0)` | `#000000` | Black text on gray sidebar |

## Typography

| Text | Font | Weight | Size | Color |
|------|------|--------|------|-------|
| HEADLINE | Roboto | Regular | 50px | White |
| Title | Roboto | SemiBold | 200px | White |
| Description | Roboto | Regular | 32px | White |
| Sub-flow label | Roboto | Regular | 64px | Black |

## Measurements

### Main Section (Hand-off)
- Type: SECTION
- Fill: white
- Left margin to children: **231px**
- Top margin to Title flow: **318px**
- Right margin: **247px**
- Bottom margin: **265px**

### Title flow (Header)
- Type: FRAME
- Fill: `#262536`
- Corner radius: **80**
- Layout: VERTICAL
- Padding: top **100**, right **215**, bottom **100**, left **215**
- Sizing: FIXED width, FIXED height
- Width: **6301px** (adapts to content width)
- Height: **605px**
- Inner "Text" frame: FILL horizontal, HUG vertical, itemSpacing **32**

### {Flow name} (Screen Container Section)
- Type: SECTION
- Fill: `#262536`
- Positioned: same horizontal start as Sub-flow sidebar + sidebar width + 51px gap
- Height: same as Sub-flow sidebar

### Sub-flow Sidebar
- Type: GROUP containing a FRAME
- Frame fill: `#EDEDED`
- Frame corner radius: **40**
- Frame layout: VERTICAL
- Frame padding: top **1512**, bottom **1512**, left **555**, right **555** (centers text)
- Frame width: **427px**
- Height: matches Flow section height
- Text: "Sub-flow", fs 64, centered, black

### Screen Frames
- Type: FRAME
- Fill: none (transparent)
- Clip content: false
- Size: **861 x 864px**
- Gap between screens: **234px**
- Top padding from Flow section top: **474px**
- Contains:
  - `{Screen name}` frame: 318 x 632px (the device screen or screenshot)
  - Annotation tags positioned around the screen

### Spacing Summary

```
+-----------------------------------------------+-
| SECTION "Hand-off" (white)                   |
|                                              |
|  +---------------------------------------+-    |  <- 318px from top
|  | Title flow (dark, r=80)              |    |  <- 231px from left
|  | HEADLINE + Title + Description       |    |
|  |---------------------------------------+-    |
|         | 114px gap                          |
|  +----+- +---------------------------------+-    |
|  |Sub| | {Flow name} (dark section)     |    |  <- 51px gap between sidebar and section
|  |   | |  +-----+- +-----+- +-----+-         |    |
|  |flo| |  |Scr1| |Scr2| |Scr3|  ...    |    |  <- 234px between screens
|  | w | |  |-----+- |-----+- |-----+-         |    |
|  |----+- |---------------------------------+-    |
|                                              |  <- 265px from bottom
|-----------------------------------------------+-
```

## Workflow for Creating a Hand-off

1. **Create the main SECTION** named "Hand-off" with white fill.
2. **Create Title flow** frame inside the section with dark fill, r=80, and the 3-level text hierarchy.
3. **Create Sub-flow sidebar** as a GROUP with a gray rounded frame and centered label text.
4. **Create the {Flow name} section** next to the sidebar, matching its height.
5. **For each screen**, create a transparent 861x864 frame inside the Flow section.
6. **Place the device screen** (screenshot or Figma frame) centered inside each Screen frame.
7. **Add annotation tags** (Button, Label, Heading, Group, Ignore Area) around each screen following placement rules.
8. **Distribute tags** across sides (left, right, top, bottom) with 32px stacking gap.

## Naming Convention

- Section: `Hand-off`
- Header frame: `Title flow`
- Text frame inside header: `Text`
- Text layers: `HEADLINE`, `{Title flow}` (with actual title), `Description`
- Sidebar group: `{Sub-flow name}` (e.g., "Checkout flow")
- Sidebar frame: unnamed (auto-generated)
- Flow section: `{Flow name}` (e.g., "Payment flow")
- Screen frames: `Screen {1}`, `Screen {2}`, etc.
- Inner device frame: `{Screen name}` (e.g., "Payment")
- Tags: `Button direita`, `Label esquerda`, `H direita`, `Ignore Area`, etc.

## Rules

1. **Always use this exact structure** - never skip the Title flow or Sub-flow sidebar.
2. **Colors are non-negotiable** - dark `#262536` for containers, `#EDEDED` for sidebar, white for section.
3. **Title flow always uses 3 text layers** - HEADLINE (category), Title (flow name), Description (context).
4. **Screens are spaced 234px apart** horizontally inside the flow section.
5. **Sub-flow sidebar is always to the left** of the flow section, aligned at the same Y.
6. **Annotation tags never overlap the screen** - they sit outside with connecting lines.
7. **The template adapts to content** - more screens = wider flow section; more sub-flows = more sidebar+section pairs.
