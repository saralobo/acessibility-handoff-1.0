# Accessibility Hand-off System

This repository contains everything needed to create screen reader accessibility annotations in Figma. Read this file first, then follow the referenced documents in order.

## How This Repository Works

When asked to create an accessibility hand-off:

1. **Read** `docs/09-ai-reasoning-chain.md` - your step-by-step thinking process
2. **Reference** `docs/10-anti-patterns.md` - mistakes to avoid
3. **Execute** `figma/handoff-template.js` - create the visual template
4. **Build tags** following the exact spec in `commands/a11y-handoff.md`
5. **Validate** with `figma/validate-handoff.js` - detect broken components
6. **Repair** with `figma/repair-tag.js` - auto-fix common issues

## Quick Start

### Step 1: Load fonts
```javascript
await figma.loadFontAsync({ family: 'Roboto', style: 'Bold' });
await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
await figma.loadFontAsync({ family: 'Roboto', style: 'SemiBold' });
```

### Step 2: Clone the screen (NEVER rebuild)
```javascript
const original = await figma.getNodeByIdAsync('NODE_ID');
const clone = original.clone();
screenFrame.appendChild(clone);
```

### Step 3: Create a tag (simplified example)
```javascript
const root = figma.createFrame();
root.layoutMode = 'HORIZONTAL';
root.primaryAxisSizingMode = 'FIXED';
root.counterAxisSizingMode = 'AUTO';
root.resize(350, 60);
root.fills = [];
root.clipsContent = false;

const tagBox = figma.createFrame();
tagBox.cornerRadius = 8;
tagBox.fills = [{ type: 'SOLID', color: { r: 41/255, g: 130/255, b: 11/255 } }];
tagBox.layoutMode = 'HORIZONTAL';
tagBox.itemSpacing = 8;
tagBox.paddingTop = 8; tagBox.paddingRight = 12;
tagBox.paddingBottom = 8; tagBox.paddingLeft = 12;

const line = figma.createFrame();
line.fills = [{ type: 'SOLID', color: { r: 41/255, g: 130/255, b: 11/255 } }];

root.appendChild(tagBox);   // tag box first for "direita"
root.appendChild(line);

tagBox.layoutSizingHorizontal = 'HUG';   // AFTER appendChild
tagBox.layoutSizingVertical = 'HUG';     // AFTER appendChild
line.layoutSizingHorizontal = 'FILL';    // AFTER appendChild
line.layoutSizingVertical = 'FIXED';
line.resize(50, 2);

// Add badge, type text, label text inside tagBox...
```

### Step 4: Validate
```javascript
// Paste contents of figma/validate-handoff.js, then:
const result = await validateHandoff('SCREEN_NODE_ID');
if (!result.passed) {
  console.log('Issues:', result.issues);
  // Run repair
}
```

## Four Non-Negotiable Rules

1. **Detect components BEFORE creating tags.** Run `figma/detect-components.js` or visually map every component's boundaries. Never place tags without knowing exact coordinates.
2. **Tag boxes MUST use HUG sizing.** If text is clipped, the sizing is wrong.
3. **Lines MUST touch the target component.** Root frame width/height must be calculated so the line endpoint aligns with the component's edge.
4. **Screens MUST be cloned, not rebuilt.** If you're creating text nodes for screen content, you're doing it wrong.

## File Index

| File | Purpose |
|------|----------|
| `docs/01-fundamentals.md` | Screen reader basics (Name/Role/State/Value) |
| `docs/02-annotation-components.md` | Component specs (colors, sizes, variants) |
| `docs/03-reading-order-strategy.md` | How to define reading order |
| `docs/04-placement-rules.md` | Tag positioning rules (sides, gaps, distribution) |
| `docs/05-analysis-workflow.md` | How to analyze a screen |
| `docs/06-component-catalog.md` | What to annotate per component type |
| `docs/07-platform-mapping.md` | Web ARIA / iOS VoiceOver / Android TalkBack |
| `docs/08-handoff-template.md` | Visual template structure (Section + Title flow) |
| `docs/09-ai-reasoning-chain.md` | **AI thinking process** - read this first |
| `docs/10-anti-patterns.md` | **Mistakes catalog** - study before building |
| `docs/11-component-detection.md` | **Component detection strategy** - how to find element boundaries |
| `figma/detect-components.js` | Component boundary detection script |
| `figma/handoff-template.js` | Template creation code |
| `figma/validate-handoff.js` | Post-creation validation |
| `figma/repair-tag.js` | Auto-fix for common issues |
| `commands/a11y-handoff.md` | Cursor command with all rules inline |

## Connecting to Tools

### Cursor IDE
Copy `commands/a11y-handoff.md` to `.cursor/commands/` to use as `/a11y-handoff` command.
Copy `docs/09-ai-reasoning-chain.md` to `.cursor/rules/` to have it always active.

### Claude Code
Point Claude Code to this repository root. CLAUDE.md (this file) is auto-detected.

### Any Figma MCP Tool
The `figma/*.js` files contain ready-to-execute Plugin API code. Paste into `figma_execute` calls.