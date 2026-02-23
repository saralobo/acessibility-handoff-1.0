# a11y-handoff v2.3

Accessibility hand-off annotation system for Figma. Uses a **JSON-driven architecture** that guarantees identical visual output regardless of which AI tool is used (Claude.ai, Cursor, Claude Code).

## Architecture

```
AI analyzes screen → Generates JSON (with targetBounds) → build-handoff.js → verify-handoff.js → Verified output
```

The AI only THINKS (analysis, roles, reading order, position estimation). The script only BUILDS (layout, colors, tags, badges). The verifier only CHECKS (18 strict PASS/FAIL). These three concerns never mix.

## v2.3 Design

The hand-off layout:
- **Screen** on the left with **highlight rectangles** around components and **numbered badges** (24x24 circles) at corners
- **Label cards** stacked vertically on the **RIGHT side**
- **NO lines** connecting anything
- **Ignore areas** as semi-transparent gray overlays
- **Group outlines** as red dashed rectangles
- **18-check QA verification** mandatory before delivery
- **Reference PNGs** in `examples/reference/` for visual calibration

**Key v2.3 changes:**
- Badge circles are now 24x24 with FIXED sizing to prevent auto-layout distortion
- Reference PNG screenshots added for AI tools to study before building
- Verify script expanded to 18 checks (added badge size validation)

## What's inside

```
a11y-handoff/
├── CLAUDE.md                          # Entry point for AI tools
├── schema/
│   └── handoff-data.schema.json       # JSON format with targetBounds
├── examples/
│   ├── payment-screen.json            # Complete example with targetBounds
│   └── reference/                     # Visual reference screenshots
│       ├── README.md                  # Text descriptions + per-tool PNG guide
│       ├── full-handoff.png           # Complete layout (template + screen + labels)
│       └── screen-annotations.png     # Close-up of correct annotations
├── figma/
│   ├── build-handoff.js               # Deterministic builder (v2.3)
│   ├── verify-handoff.js              # 18-check QA verification
│   ├── detect-components.js           # Component boundary detection
│   ├── handoff-template.js            # Template creation
│   ├── validate-handoff.js            # Legacy validation
│   └── repair-tag.js                  # Auto-fix common issues
├── docs/
│   ├── 08-handoff-template.md         # Visual template specs
│   ├── 09-ai-reasoning-chain.md       # AI analysis process (v2.3)
│   ├── 10-anti-patterns.md            # 14 anti-patterns catalog
│   └── 11-component-detection.md      # Element detection strategy
└── commands/
    └── a11y-handoff.md                # Cursor slash command
```

## Quick start

### Option A: Claude Code

```bash
git clone https://github.com/saralobo/acessibility-handoff-1.0.git
cd acessibility-handoff-1.0
claude
```

Say: "Create an accessibility hand-off for the Payment screen (node 1:221)"

### Option B: Cursor IDE

```bash
mkdir -p .cursor/commands
cp commands/a11y-handoff.md .cursor/commands/handoff-acessibility.md
```

Type `/handoff-acessibility` in Agent chat.

### Option C: Claude.ai (Projects)

1. Create a Project, upload all files to Knowledge
2. **Important:** PNG images must be uploaded separately as image files — Claude.ai does not auto-read binary images from uploaded text/code files
3. Custom instruction: "Follow CLAUDE.md for all hand-off requests"
4. Start chatting

## How it works

### Step 0: Study reference

AI reads the visual reference to understand the expected output. Two options:

- **If the tool can view images:** Open `examples/reference/full-handoff.png` and `screen-annotations.png`
- **If the tool cannot view images:** Read `examples/reference/README.md` which contains detailed ASCII diagrams and text descriptions of the correct output

> **Note on PNGs:** The reference screenshots are real PNG files stored in this repo. Not all AI tools can automatically view binary images from a repository. The `examples/reference/README.md` file provides a complete text-based alternative that works in every tool. The scripts (`build-handoff.js` + `verify-handoff.js`) are the real enforcement layer — they guarantee correct output regardless of whether the AI saw the PNGs.

### Step 1: AI analyzes

Screenshot → identify elements → estimate positions → generate JSON:

```json
{
  "screen": { "name": "Payment", "nodeId": "1:221" },
  "template": { "headline": "CHECKOUT", "title": "Payment", "description": "...", "flowName": "Payment flow" },
  "annotations": [
    {
      "order": 1,
      "componentName": "Screen title",
      "tagType": "H",
      "accessibilityName": "\"Payment\"",
      "role": "heading",
      "targetBounds": { "x": 0.25, "y": 0.05, "width": 0.5, "height": 0.04 }
    }
  ]
}
```

### Step 2: Script builds

`build-handoff.js` creates everything deterministically. Same input = same output.

### Step 3: Script verifies

`verify-handoff.js` runs 18 checks including oversized highlights, equal-band detection, badge positioning, badge sizing (24x24), card overlap, and more. AI cannot say "done" until all PASS.

## Design tokens

| Token | Value |
|-------|-------|
| Button | `rgb(41, 130, 11)` green |
| Label | `rgb(39, 72, 113)` blue |
| H | `rgb(37, 41, 169)` purple |
| Group | `rgb(218, 67, 12)` red dashed |
| Ignore | `rgb(153, 153, 153)` gray 30% opacity |
| Tag font | JetBrains Mono Bold 14 / Regular 10 |
| Badge | 24×24 circle, FIXED sizing |
| Highlight | 2px stroke, 8px radius, NO fill |
| Card gap | 18px |

## License

MIT
