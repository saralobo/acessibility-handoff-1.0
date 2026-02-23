# a11y-handoff

Accessibility hand-off annotation system for Figma. This repository contains AI-consumable rules, Figma Plugin API scripts, and reasoning chains that teach AI tools (Claude Code, Cursor) to create screen reader accessibility documentation automatically.

## What's inside

```
a11y-handoff/
|- CLAUDE.md                          # Entry point for Claude Code (auto-detected)
|- commands/
|   |- a11y-handoff.md                # Cursor slash command with all rules inline
|- docs/
|   |- 08-handoff-template.md         # Visual template structure specs
|   |- 09-ai-reasoning-chain.md       # Step-by-step AI thinking process
|   |- 10-anti-patterns.md            # 12 documented mistakes and fixes
|   |- 11-component-detection.md      # How to detect component boundaries
|- figma/
    |- handoff-template.js            # Creates the hand-off layout in Figma
    |- detect-components.js           # Maps component positions automatically
    |- validate-handoff.js            # Post-creation quality checks
    |- repair-tag.js                  # Auto-fixes common issues
```

---

## Installation

This repository works with **Claude Code** and **Cursor**. Pick the tool you use (or both).

### Prerequisites

Both setups require a **Figma MCP** (Model Context Protocol) server connected to your tool so the AI can execute Figma Plugin API code. If you don't have one yet, set up a Figma MCP server first (e.g. [cursor-talk-to-figma-mcp](https://github.com/nicholasgriffintn/cursor-talk-to-figma-mcp) or equivalent).

---

## Option A: Claude Code

Claude Code auto-detects `CLAUDE.md` at the project root. No extra config needed.

### Quick setup

```bash
# 1. Clone the repo
git clone https://github.com/saralobo/acessibility-handoff-1.0.git

# 2. Open Claude Code in that directory
cd acessibility-handoff-1.0
claude
```

Done. Claude reads `CLAUDE.md` automatically at session start and knows the entire workflow.

### Recommended: add modular rules with `.claude/rules/`

For better context efficiency, copy the key docs into Claude Code's rules directory so they load conditionally:

```bash
# Inside the a11y-handoff repo
mkdir -p .claude/rules

# Copy the reasoning chain (loads on every session)
cp docs/09-ai-reasoning-chain.md .claude/rules/reasoning-chain.md

# Copy anti-patterns (loads on every session)
cp docs/10-anti-patterns.md .claude/rules/anti-patterns.md
```

You can also scope rules to specific file types using YAML frontmatter:

```markdown
---
paths: figma/**/*.js
---

# Figma Script Rules
Always use `await figma.getNodeByIdAsync()` instead of synchronous access.
Set `layoutSizingHorizontal` AFTER `appendChild`, never before.
```

### How it works

```
You: "Create an a11y hand-off for the Login screen"

Claude Code reads:
  1. CLAUDE.md          -> knows the workflow, rules, and file index
  2. .claude/rules/*.md -> loads reasoning chain + anti-patterns
  3. figma/*.js         -> has ready-to-execute Figma scripts

Claude Code then:
  -> Screenshots the screen
  -> Detects components
  -> Defines reading order
  -> Creates template + tags
  -> Validates and repairs
```

### Best practices for Claude Code

- **Keep CLAUDE.md under 300 lines.** It's the overview, not the encyclopedia. Detailed rules go in `.claude/rules/`.
- **Don't auto-generate CLAUDE.md.** Every line should be intentional.
- **Include verification steps.** The `figma/validate-handoff.js` script gives Claude a way to check its own work.
- **Use path-scoped rules** for Figma-specific instructions so they only load when relevant.

---

## Option B: Cursor IDE

Cursor uses two features: **Rules** (always-on context) and **Commands** (on-demand slash commands).

### Quick setup

```bash
# 1. Clone the repo into your design project
git clone https://github.com/saralobo/acessibility-handoff-1.0.git

# 2. Copy the slash command into your project
mkdir -p .cursor/commands
cp acessibility-handoff-1.0/commands/a11y-handoff.md .cursor/commands/

# 3. Copy the reasoning chain as an always-on rule
mkdir -p .cursor/rules
cp acessibility-handoff-1.0/docs/09-ai-reasoning-chain.md .cursor/rules/a11y-reasoning.mdc
```

Now in Cursor's Agent chat, type `/a11y-handoff` and the AI follows the full workflow.

### Setting up rules (`.cursor/rules/`)

Cursor rules use `.mdc` files with optional YAML frontmatter:

```markdown
---
description: "Accessibility hand-off annotation rules for Figma"
alwaysApply: true
---

# a11y Hand-off Rules

(paste contents of docs/09-ai-reasoning-chain.md here)
```

You can also create specialized rules:

```
.cursor/
|- rules/
    |- a11y-reasoning.mdc       # Always active: thinking process
    |- a11y-anti-patterns.mdc   # Always active: mistakes to avoid
    |- a11y-figma-scripts.mdc   # Agent-requested: Figma API patterns
```

Rule activation modes:

| Mode | When it loads | Use for |
|------|--------------|--------|
| `alwaysApply: true` | Every chat message | Core rules (reasoning chain, anti-patterns) |
| Auto Attached (globs) | When matching files are open | Figma script rules |
| Agent Requested | AI decides based on task | Component detection strategy |
| Manual | Only when you @-mention it | Reference docs |

### Setting up commands (`.cursor/commands/`)

The file `commands/a11y-handoff.md` is already formatted as a Cursor command. After copying it:

1. Open Cursor
2. In the Agent chat, type `/`
3. Select `a11y-handoff` from the list
4. The AI receives the full spec and starts working

### Best practices for Cursor

- **Use the command for on-demand work.** Type `/a11y-handoff` when you need to create a hand-off.
- **Use rules for persistent knowledge.** The reasoning chain and anti-patterns should always be loaded.
- **Keep command files focused.** One command = one task. The `a11y-handoff.md` command covers the entire workflow.
- **Commit rules to Git.** Include `.cursor/rules/` in your repo so the team shares the same AI behavior.

---

## Option C: Use as reference (any tool)

If you use a different AI tool with Figma MCP access:

1. Read `CLAUDE.md` for the workflow overview
2. Read `docs/09-ai-reasoning-chain.md` for the full step-by-step process
3. Paste the contents of `figma/*.js` files into your tool's Figma API execution calls
4. After creating annotations, paste `figma/validate-handoff.js` to check quality

The Figma scripts are plain JavaScript designed for the Figma Plugin API. They work with any tool that can call `figma_execute()`.

---

## Figma MCP requirement

All setups require a Figma MCP server that provides at minimum:

| MCP Tool | What it does | Used for |
|----------|-------------|----------|
| `figma_execute` | Runs Figma Plugin API code | Creating templates, tags, validation |
| `figma_take_screenshot` | Captures a node as PNG | Analyzing screens, visual review |

Without these, the AI can read the rules but cannot execute them in Figma.

---

## Quick reference: what each file does

| File | Role | When to read |
|------|------|--------------|
| `CLAUDE.md` | Entry point, overview, quick start code | First - gives the AI its mission |
| `commands/a11y-handoff.md` | Complete spec in one file (Cursor command) | On-demand - the AI's instruction manual |
| `docs/09-ai-reasoning-chain.md` | Phase-by-phase thinking process | Always - the AI's brain |
| `docs/10-anti-patterns.md` | 12 mistakes with detection and fixes | Always - the AI's guardrails |
| `docs/11-component-detection.md` | How to find element boundaries | During analysis - precision targeting |
| `docs/08-handoff-template.md` | Layout specs (colors, spacing, typography) | During creation - visual consistency |
| `figma/handoff-template.js` | Creates the Section + Title + Screens structure | Executed in Figma |
| `figma/detect-components.js` | Maps component positions and connection points | Executed in Figma |
| `figma/validate-handoff.js` | Checks for 7 types of errors | Executed after creation |
| `figma/repair-tag.js` | Auto-fixes sizing, ellipses, text issues | Executed when validation fails |

---

## Contributing

Found a new anti-pattern? Want to add support for a new tag type?

1. Document the pattern in `docs/10-anti-patterns.md`
2. Add detection logic to `figma/validate-handoff.js`
3. Add the fix to `figma/repair-tag.js`
4. Update `commands/a11y-handoff.md` with the new rule

---

## License

MIT