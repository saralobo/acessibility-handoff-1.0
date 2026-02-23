# a11y-handoff v2

Accessibility hand-off annotation system for Figma. Uses a **JSON-driven architecture** that guarantees identical visual output regardless of which AI tool is used (Claude.ai, Cursor, Claude Code).

## Architecture

```
AI analyzes screen → Generates JSON → build-handoff.js → Identical Figma output
```

The AI only THINKS (analysis, roles, reading order). The script only BUILDS (layout, colors, tags, lines). These two concerns never mix.

## What's inside

```
a11y-handoff/
├── CLAUDE.md                          # Entry point for Claude Code / AI tools
├── schema/
│   └── handoff-data.schema.json       # Strict JSON format the AI must produce
├── examples/
│   └── payment-screen.json            # Complete real-world example
├── figma/
│   ├── build-handoff.js               # MASTER SCRIPT — only visual builder
│   ├── detect-components.js           # Component boundary detection
│   ├── handoff-template.js            # Template creation (used by build)
│   ├── validate-handoff.js            # Post-creation validation
│   └── repair-tag.js                  # Auto-fix common issues
├── docs/
│   ├── 08-handoff-template.md         # Visual template specs
│   ├── 09-ai-reasoning-chain.md       # AI analysis process (v2)
│   ├── 10-anti-patterns.md            # Mistakes catalog
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

Claude Code reads `CLAUDE.md` automatically. Say:
> "Create an accessibility hand-off for the Payment screen (node 1:221)"

### Option B: Cursor IDE

```bash
# Copy the slash command
mkdir -p .cursor/commands
cp commands/a11y-handoff.md .cursor/commands/

# Copy reasoning chain as always-on rule
mkdir -p .cursor/rules
cp docs/09-ai-reasoning-chain.md .cursor/rules/a11y-reasoning.mdc
```

In Agent chat, type `/a11y-handoff`.

### Option C: Claude.ai (Projects)

1. Create a Project in claude.ai
2. Upload all files to Project Knowledge (or connect GitHub)
3. Add custom instruction: "Follow CLAUDE.md for all hand-off requests"
4. Start chatting

## How it works

### Step 1: AI analyzes (any AI tool)

The AI takes a screenshot, identifies components, defines reading order, and generates a JSON:

```json
{
  "screen": { "name": "Payment", "nodeId": "1:221" },
  "template": {
    "headline": "CHECKOUT FLOW",
    "title": "Payment",
    "description": "Payment method selection",
    "flowName": "Payment flow"
  },
  "annotations": [
    {
      "order": 1,
      "componentName": "Screen title",
      "tagType": "H",
      "side": "direita",
      "accessibilityName": "\"Payment\"",
      "role": "heading"
    }
  ]
}
```

### Step 2: Script builds (deterministic)

The AI executes `figma/build-handoff.js` with the JSON. The script creates the entire hand-off layout in Figma — template, cloned screen, tags with lines, groups, and ignore areas. Same input = same output, every time.

## Why v2?

v1 had docs that described *how* to build the visual output, giving AIs freedom to interpret. Different tools produced wildly different results. v2 enforces a strict contract:

| v1 Problem | v2 Solution |
|------------|-------------|
| AI improvises layout | Script builds everything deterministically |
| Docs are interpretable | JSON schema is rigid, no ambiguity |
| Scripts are optional | Script is the ONLY path to visual output |
| No reference example | Complete example with expected output |
| Font/color mismatches | All design tokens hardcoded in script |

## Design tokens (hardcoded in build script)

| Token | Value |
|-------|-------|
| Button color | `rgb(41, 130, 11)` — green |
| Label color | `rgb(39, 72, 113)` — blue |
| H color | `rgb(37, 41, 169)` — purple |
| Group color | `rgb(218, 67, 12)` — red |
| Ignore color | `rgb(153, 153, 153)` — gray |
| Tag font | JetBrains Mono Bold 14 / Regular 10-12 |
| Template font | Roboto Regular / SemiBold |
| Tag padding | 8 / 12 / 8 / 12 |
| Tag corner radius | 8px |
| Badge | 22x22 circle, white |
| Line | Vector stroke 2px inside 4px frame |
| Stack gap | 32px between tags |

## Figma MCP requirement

All setups require a Figma MCP server with at minimum:

| Tool | What it does |
|------|--------------|
| `figma_execute` | Runs Plugin API code (builds the hand-off) |
| `figma_take_screenshot` | Captures screens (analysis + verification) |

## Contributing

1. Update `figma/build-handoff.js` for visual changes
2. Update `schema/handoff-data.schema.json` for data format changes
3. Update `examples/payment-screen.json` to match
4. Update `docs/10-anti-patterns.md` for new mistake patterns

## License

MIT