# Visual Reference Screenshots

This folder contains **PNG image files** showing the correct hand-off output. They serve as the visual "source of truth" for what the final Figma result must look like.

## Important: How AI Tools Handle These PNGs

The PNGs are **binary image files** stored in this repository. Not all AI tools can automatically view images from a repo — here's what works in each tool:

| Tool | Can it view PNGs from the repo? | What to do |
|------|---|----|
| **Claude.ai (Projects)** | Not automatically. Claude reads text files from Knowledge, not images. | **Download the PNGs and upload them manually** to the Project's Knowledge section as separate image files. |
| **Cursor IDE** | Only if the repo is cloned locally. Cursor reads text files via `@repo`, not binary images. | **Clone the repo**, then reference the local PNG path. Or paste the image directly in chat. |
| **Claude Code** | Yes, if the repo is cloned locally. | **Clone the repo** — Claude Code can view local image files. |
| **ChatGPT / other tools** | Not automatically. | **Download and upload manually** as images in the conversation. |

**Bottom line:** If your tool cannot view the PNG files, read the **Detailed Text Description** below. It describes exactly what's in each image so you can understand the expected output without seeing the pictures.

---

## Reference Images

### 1. Full Hand-off Layout (`full-handoff.png`)

Shows the complete hand-off structure from zoomed out.

### 2. Screen Annotations Close-up (`screen-annotations.png`)

Shows a single annotated screen at full quality.

---

## Detailed Text Description (for tools that cannot view images)

If your AI tool cannot open PNG files, use these descriptions as your visual reference. The `build-handoff.js` script and `verify-handoff.js` checks enforce all of these rules programmatically — the text below simply explains what the correct output looks like.

### What `full-handoff.png` shows:

```
┌─────────────────────────────────────────────────────────────────┐
│  SECTION "Hand-off" (white background)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Title flow (dark rounded rectangle #262536)            │    │
│  │  HEADLINE — uppercase category, Roboto Regular 50px     │    │
│  │  Title — large flow name, Roboto SemiBold 200px         │    │
│  │  Description — context text, Roboto Regular 32px        │    │
│  │  All text is WHITE on the dark background               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌──────┐  ┌───────────────────────────────────────────────┐    │
│  │ Side │  │  Flow section (dark #262536)                  │    │
│  │ bar  │  │                                               │    │
│  │ gray │  │  ┌─────────────────┐  ┌─────────────────┐    │    │
│  │#EDED │  │  │  Screen {1}     │  │  Screen {2}     │    │    │
│  │ ED   │  │  │  (see close-up) │  │                 │    │    │
│  │      │  │  └─────────────────┘  └─────────────────┘    │    │
│  │"Sub- │  │                                               │    │
│  │flow" │  │  Screens spaced 234px apart                   │    │
│  └──────┘  └───────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

- The sidebar (427px wide, gray `#EDEDED`, rounded corners) is to the LEFT of the flow section
- The flow section and sidebar are aligned at the same Y position
- Between the title flow and the sidebar/flow section there is a 114px gap

### What `screen-annotations.png` shows:

```
┌──────────────────────────────────────────────────────────────────────┐
│  Screen frame (transparent, 861x864px)                               │
│                                                                      │
│   ┌──────────────────┐      ┌──────────────────────────────────┐    │
│   │  DEVICE SCREEN   │      │ ① Label Card 1                  │    │
│   │  (cloned, not    │      │    [H] "Screen title"            │    │
│   │   rebuilt)        │      └──────────────────────────────────┘    │
│   │                  │      18px gap                                 │
│   │  ┌─── ② ───────┐│      ┌──────────────────────────────────┐    │
│   │  │ Highlight    ││      │ ② Label Card 2                  │    │
│   │  │ (stroke only)││      │    [Label] "Section label"       │    │
│   │  └──────────────┘│      └──────────────────────────────────┘    │
│   │                  │      18px gap                                 │
│   │  ┌── ③ ────────┐│      ┌──────────────────────────────────┐    │
│   │  │ Highlight   ②││      │ ③ Label Card 3                  │    │
│   │  └──────────────┘│      │    [Button] "Add new card"       │    │
│   │                  │      └──────────────────────────────────┘    │
│   └──────────────────┘                                              │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Key visual details:**

1. **Device screen** (left side): The original Figma screen is CLONED (not rebuilt). It shows real app content.
2. **Highlight rectangles** (on the device): Colored rectangles with **stroke only, NO fill**. Each wraps a specific component — NOT a full-width band across the screen. Corner radius 8px, stroke weight 2px.
3. **Badge circles** (on the device): Small **24x24 pixel circles** positioned at the bottom-right corner of each highlight. Colored to match the tag type (green/blue/purple). Contains a white number (1, 2, 3...). **Perfect circles — never stretched or squished.**
4. **Label cards** (right side): Colored rounded rectangles stacked vertically with 18px gap between each. Each card contains:
   - A white badge circle (24x24) with the number in black
   - Tag type in JetBrains Mono Bold 14px (e.g., "Button", "Label", "H")
   - Accessibility name in JetBrains Mono Regular 10px (e.g., `"Payment"`)
5. **ALL label cards are on the RIGHT** — never on the left, top, or bottom.
6. **NO connecting lines** — labels are matched to components by number only.
7. **Colors:**
   - Button = green `rgb(41,130,11)`
   - Label = blue `rgb(39,72,113)`
   - H = purple `rgb(37,41,169)`
   - Group = red dashed outline `rgb(218,67,12)`
   - Ignore = gray overlay `rgb(153,153,153)` at 30% opacity

---

## How to Get the PNGs

### Option 1: They're already in this folder

If you cloned the repository, the PNGs should already be at:
- `examples/reference/full-handoff.png` (245 KB)
- `examples/reference/screen-annotations.png` (161 KB)

### Option 2: Download from GitHub

```bash
# Full hand-off layout
curl -L -o full-handoff.png \
  "https://raw.githubusercontent.com/saralobo/acessibility-handoff-1.0/main/examples/reference/full-handoff.png"

# Screen annotations close-up
curl -L -o screen-annotations.png \
  "https://raw.githubusercontent.com/saralobo/acessibility-handoff-1.0/main/examples/reference/screen-annotations.png"
```

### Option 3: Re-export from Figma

If the PNGs are missing or outdated:
1. Open [Acessibility-Handoff](https://www.figma.com/design/aqy23dQskm8cbPL051MDYo/Acessibility-Handoff)
2. Navigate to the "hand-off v2" page (node 5:1884) for the full layout
3. Navigate to the "sample" page, "Model Hand-off" section (node 3:820) for the close-up
4. Export as PNG at 2x scale
5. Save to this folder

---

## Remember

Even if your tool cannot view the PNGs, the system still works correctly because:
- `build-handoff.js` creates all visual elements deterministically (same JSON = same output)
- `verify-handoff.js` runs 18 objective checks to catch any visual problems
- The text descriptions above explain exactly what the output should look like
- The JSON schema + example JSON define the exact data structure

The PNGs are a helpful visual reference, but the **scripts are the real enforcement layer**.
