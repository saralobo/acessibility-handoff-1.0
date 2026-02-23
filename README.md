# a11y-handoff v2.1

Accessibility hand-off annotation system for Figma. Uses a **JSON-driven architecture** that guarantees identical visual output regardless of which AI tool is used (Claude.ai, Cursor, Claude Code).

## Architecture

```
AI analyzes screen → Generates JSON → build-handoff.js → verify-handoff.js → Verified Figma output
```

The AI only THINKS (analysis, roles, reading order). The script only BUILDS (layout, colors, tags, badges). The verifier only CHECKS (PASS/FAIL). These three concerns never mix.

## v2.1 Design

The hand-off layout:
- **Screen** on the left with numbered **badges ON components** and **colored highlight rectangles**
- **Label cards** stacked vertically on the **RIGHT side** of the screen
- **NO lines** connecting anything
- **Ignore areas** shown as hatched gray overlays
- **Mandatory QA verification** before delivery

## What's inside

```
a11y-handoff/
├── CLAUDE.md                          # Entry point for Claude Code / AI tools
├── schema/
│   └── handoff-data.schema.json       # Strict JSON format the AI must produce
├── examples/
│   └── payment-screen.json            # Complete real-world example
├── figma/
│   ├── build-handoff.js               # MASTER SCRIPT — deterministic builder (v2.1)
│   ├── verify-handoff.js              # QA verification — PASS/FAIL checks
│   ├── detect-components.js           # Component boundary detection
│   ├── handoff-template.js            # Template creation (used by build)
│   ├── validate-handoff.js            # Legacy validation
│   └── repair-tag.js                  # Auto-fix common issues
├── docs/
│   ├── 08-handoff-template.md         # Visual template specs
│   ├── 09-ai-reasoning-chain.md       # AI analysis process (v2.1)
│   ├── 10-anti-patterns.md            # Mistakes catalog (v2.1)
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
mkdir -p .cursor/commands
cp commands/a11y-handoff.md .cursor/commands/handoff-acessibility.md
```

In Agent chat, type `/handoff-acessibility`.

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
      "accessibilityName": "\"Payment\"",
      "role": "heading"
    }
  ]
}
```

**Note:** v2.1 has no `side` field. All label cards appear on the right automatically.

### Step 2: Script builds (deterministic)

The AI executes `figma/build-handoff.js` with the JSON. The script creates:
- Template (Section + Title flow + Sidebar + Flow section)
- Cloned screen
- Numbered badge circles ON each component
- Colored highlight rectangles around components
- Label cards stacked on the RIGHT side
- NO lines

Same input = same output, every time.

### Step 3: Verification (mandatory)

The AI executes `figma/verify-handoff.js` which runs 10+ checks and returns PASS/FAIL for each. The AI may NOT say "done" until all checks pass.

## Why v2.1?

| v1 Problem | v2 Solution | v2.1 Addition |
|------------|-------------|---------------|
| AI improvises layout | Script builds deterministically | QA verification layer |
| Docs are interpretable | JSON schema is rigid | No side decisions needed |
| Scripts are optional | Script is the ONLY path | Verification is MANDATORY |
| No reference example | Complete example | Simpler design (no lines) |
| AI says "looks good" | Hardcoded tokens | Only verify script decides |

## Design tokens (hardcoded in build script)

| Token | Value |
|-------|-------|
| Button color | `rgb(41, 130, 11)` — green |
| Label color | `rgb(39, 72, 113)` — blue |
| H color | `rgb(37, 41, 169)` — purple |
| Group color | `rgb(218, 67, 12)` — red |
| Ignore color | `rgb(153, 153, 153)` — gray |
| Tag font | JetBrains Mono Bold 14 / Regular 10 |
| Template font | Roboto Regular / SemiBold |
| Tag padding | 8 / 12 / 8 / 12 |
| Tag corner radius | 8px |
| Badge | 22x22 circle |
| Label card gap | 18px between cards |
| Highlight stroke | 2px, 8px corner radius |

## Figma MCP requirement

All setups require a Figma MCP server with at minimum:

| Tool | What it does |
|------|--------------|
| `figma_execute` | Runs Plugin API code (builds the hand-off) |
| `figma_take_screenshot` | Captures screens (analysis + verification) |

## Contributing

1. Update `figma/build-handoff.js` for visual changes
2. Update `figma/verify-handoff.js` to match new checks
3. Update `schema/handoff-data.schema.json` for data format changes
4. Update `examples/payment-screen.json` to match
5. Update `docs/10-anti-patterns.md` for new mistake patterns

## License

MIT