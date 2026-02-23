# a11y-handoff v2.2

Accessibility hand-off annotation system for Figma. Uses a **JSON-driven architecture** that guarantees identical visual output regardless of which AI tool is used (Claude.ai, Cursor, Claude Code).

## Architecture

```
AI analyzes screen → Generates JSON (with targetBounds) → build-handoff.js → verify-handoff.js → Verified output
```

The AI only THINKS (analysis, roles, reading order, position estimation). The script only BUILDS (layout, colors, tags, badges). The verifier only CHECKS (16 strict PASS/FAIL). These three concerns never mix.

## v2.2 Design

The hand-off layout:
- **Screen** on the left with **highlight rectangles** around components and **numbered badges** at corners
- **Label cards** stacked vertically on the **RIGHT side**
- **NO lines** connecting anything
- **Ignore areas** as semi-transparent gray overlays
- **Group outlines** as red dashed rectangles
- **16-check QA verification** mandatory before delivery

**Key v2.2 change:** `targetBounds` — the AI estimates each component's position on screen as proportions (0.0-1.0). Without this, highlights are skipped and verification fails.

## What's inside

```
a11y-handoff/
├── CLAUDE.md                          # Entry point for AI tools
├── schema/
│   └── handoff-data.schema.json       # JSON format with targetBounds
├── examples/
│   └── payment-screen.json            # Complete example with targetBounds
├── figma/
│   ├── build-handoff.js               # Deterministic builder (v2.2)
│   ├── verify-handoff.js              # 16-check QA verification
│   ├── detect-components.js           # Component boundary detection
│   ├── handoff-template.js            # Template creation
│   ├── validate-handoff.js            # Legacy validation
│   └── repair-tag.js                  # Auto-fix common issues
├── docs/
│   ├── 08-handoff-template.md         # Visual template specs
│   ├── 09-ai-reasoning-chain.md       # AI analysis process (v2.2)
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
2. Custom instruction: "Follow CLAUDE.md for all hand-off requests"
3. Start chatting

## How it works

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

`verify-handoff.js` runs 16 checks including oversized highlights, equal-band detection, badge positioning, card overlap, and more. AI cannot say "done" until all PASS.

## Design tokens

| Token | Value |
|-------|-------|
| Button | `rgb(41, 130, 11)` green |
| Label | `rgb(39, 72, 113)` blue |
| H | `rgb(37, 41, 169)` purple |
| Group | `rgb(218, 67, 12)` red dashed |
| Ignore | `rgb(153, 153, 153)` gray 30% opacity |
| Tag font | JetBrains Mono Bold 14 / Regular 10 |
| Badge | 22×22 circle |
| Highlight | 2px stroke, 8px radius, NO fill |
| Card gap | 18px |

## License

MIT