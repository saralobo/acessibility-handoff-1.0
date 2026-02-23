# Visual Reference Screenshots

These screenshots show the **correct** hand-off output. AI tools MUST study these before building.

## Reference Images

### 1. Full Hand-off Layout (`full-handoff.png`)

Shows the complete hand-off structure:
- Title flow (dark bar with headline, title, description)
- Sidebar (gray, sub-flow label)
- Flow section (dark background)
- Screen with device, highlights, badges, and label cards on the right

**Figma source:** [Node 5:1884 in Acessibility-Handoff](https://www.figma.com/design/aqy23dQskm8cbPL051MDYo/Acessibility-Handoff?node-id=5-1884)

### 2. Screen Annotations Close-up (`screen-annotations.png`)

Shows the model hand-off at full quality:
- Device screen with cloned content
- Highlight rectangles (stroke-only) around each component
- Numbered badge circles (24x24, colored) at highlight corners
- Label cards stacked on the right with badge + tag type + accessibility name
- No connecting lines

**Figma source:** [Node 3:820 in Acessibility-Handoff](https://www.figma.com/design/aqy23dQskm8cbPL051MDYo/Acessibility-Handoff?node-id=3-820)

## How to Download

The PNGs can be exported directly from the Figma file, or downloaded from the URLs below (valid ~30 days from Feb 23, 2026):

```bash
# Full hand-off layout
curl -o examples/reference/full-handoff.png \
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/dc09ad18-aac6-4a23-a954-389bcbef4e6b"

# Model hand-off close-up
curl -o examples/reference/screen-annotations.png \
  "https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/86b8998e-fa72-4567-ae9a-2b75bda5231c"
```

If URLs have expired, re-export from the Figma file:
1. Open [Acessibility-Handoff](https://www.figma.com/design/aqy23dQskm8cbPL051MDYo/Acessibility-Handoff)
2. Navigate to the "hand-off v2" page (node 5:1884) for the full layout
3. Navigate to the "sample" page → "Model Hand-off" section (node 3:820) for the close-up
4. Export as PNG at 2x scale
5. Save to this folder

## What to Look For

When studying these references, pay attention to:

- **Badge circles are perfect circles** — 24x24 pixels, never stretched or squished
- **Highlights wrap individual components** — not full-width bands
- **Label cards are on the RIGHT** — never on the left or overlapping the device
- **No connecting lines** — labels are matched to components by number only
- **Card spacing is consistent** — ~18px gap between each label card
- **Text auto-resizes** — cards expand to fit content, never truncated
- **Colors match tag types** — green (Button), blue (Label), purple (H)
