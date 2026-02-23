# 11 - Component Detection Strategy

Before creating ANY annotation tag, the AI must detect and map every component's exact boundaries on the screen. This document defines how to do that for any screen, regardless of whether it's a live Figma frame or a flat screenshot.

## Decision: Live Frame vs Screenshot

```
Is the screen a Figma frame with children?
|--- YES (type FRAME/COMPONENT, has children) -> Use PROGRAMMATIC DETECTION (Phase A)
|--- NO (type RECTANGLE with IMAGE fill, or flat group) -> Use VISUAL DETECTION (Phase B)
```

Always prefer programmatic detection. It gives exact pixel coordinates.

---

## Phase A: Programmatic Detection (Live Figma Frames)

When the screen is a Figma frame with child nodes, extract every component's bounding box using the Plugin API.

### Step A1: Get the component tree

```javascript
async function mapComponents(screenNodeId) {
  const screen = await figma.getNodeByIdAsync(screenNodeId);
  const screenBB = screen.absoluteBoundingBox;
  const components = [];

  function traverse(node, depth) {
    if (!node.visible) return;

    const bb = node.absoluteBoundingBox;
    if (!bb) return;

    const entry = {
      id: node.id,
      name: node.name,
      type: node.type,
      x: Math.round(bb.x - screenBB.x),
      y: Math.round(bb.y - screenBB.y),
      w: Math.round(bb.width),
      h: Math.round(bb.height),
      centerX: Math.round(bb.x - screenBB.x + bb.width / 2),
      centerY: Math.round(bb.y - screenBB.y + bb.height / 2),
      depth: depth
    };

    // Classify the node
    if (node.type === 'TEXT') {
      entry.role = 'text';
      entry.characters = node.characters;
      entry.fontSize = node.fontSize;
    } else if (node.type === 'INSTANCE' || node.type === 'COMPONENT') {
      entry.role = 'component';
    } else if (node.type === 'FRAME' || node.type === 'GROUP') {
      entry.role = 'container';
    } else if (node.type === 'RECTANGLE' || node.type === 'ELLIPSE') {
      entry.role = 'shape';
    } else if (node.type === 'VECTOR') {
      entry.role = 'icon';
    }

    components.push(entry);

    if (node.children) {
      for (const child of node.children) {
        traverse(child, depth + 1);
      }
    }
  }

  traverse(screen, 0);
  return components;
}
```

### Step A2: Filter to meaningful components

Not every node needs annotation. Filter by these rules:

```javascript
function filterAnnotatable(components) {
  return components.filter(function(c) {
    // Skip tiny elements (< 8px)
    if (c.w < 8 || c.h < 8) return false;
    // Skip the root screen itself
    if (c.depth === 0) return false;
    // Keep text nodes (potential labels/headings)
    if (c.role === 'text') return true;
    // Keep component instances (buttons, inputs, cards)
    if (c.role === 'component') return true;
    // Keep containers at depth 1-2 (sections, cards, rows)
    if (c.role === 'container' && c.depth <= 2) return true;
    // Keep icons
    if (c.role === 'icon' && c.w >= 16) return true;
    return false;
  });
}
```

### Step A3: Build the connection point map

For each annotatable component, determine where the tag line should connect:

```javascript
function getConnectionPoints(component, screenWidth) {
  var midX = Math.round(screenWidth / 2);
  var isLeftHalf = component.centerX < midX;

  return {
    id: component.id,
    name: component.name,
    // For LEFT-side tags (direita): connect to component's LEFT edge
    leftEdge:  { x: component.x, y: component.centerY },
    // For RIGHT-side tags (esquerda): connect to component's RIGHT edge
    rightEdge: { x: component.x + component.w, y: component.centerY },
    // For TOP tags (baixo): connect to component's TOP edge
    topEdge:   { x: component.centerX, y: component.y },
    // For BOTTOM tags (cima): connect to component's BOTTOM edge
    bottomEdge:{ x: component.centerX, y: component.y + component.h },
    // Suggested side based on position
    suggestedSide: isLeftHalf ? 'left' : 'right'
  };
}
```

### Step A4: Output - the component map

The result is a structured list like:

```
Component: "Payment" (TEXT, 290x30)
  Left edge:   (18, 135)
  Right edge:  (308, 135)
  Top edge:    (163, 120)
  Bottom edge: (163, 150)
  Suggested side: left

Component: "Credit Card **** 4236" (INSTANCE, 280x80)
  Left edge:   (19, 230)
  Right edge:  (299, 230)
  Top edge:    (159, 190)
  Bottom edge: (159, 270)
  Suggested side: left
```

These coordinates are then used in Phase 5 (Create Tags) to set exact root frame dimensions.

---

## Phase B: Visual Detection (Screenshots / Flat Images)

When the screen is a flat image (RECTANGLE with IMAGE fill), you cannot traverse children. Use this systematic approach instead.

### Step B1: Take a high-resolution screenshot

```
figma_take_screenshot(nodeId, scale: 3)
```

This gives a 3x image where a 318px-wide device becomes 954px wide, making component boundaries easy to identify.

### Step B2: Divide the screen into a grid

Mentally divide the device screen into zones:

```
+----------------------------------+-
| STATUS BAR (0-30px)             |  -> Ignore (system UI)
|----------------------------------|
| HEADER (30-80px)                |  -> Navigation buttons, icons
|----------------------------------|
| TITLE AREA (80-160px)           |  -> Page heading, section title
|----------------------------------|
| MAIN CONTENT (160-500px)        |  -> Cards, lists, form fields
|----------------------------------|
| SECONDARY CONTENT (500-580px)   |  -> Additional sections
|----------------------------------|
| FOOTER / CTA (580-632px)        |  -> Action buttons, tab bar
|----------------------------------+-
```

### Step B3: Identify components by visual cues

For each zone, identify components using these visual rules:

| Visual cue | Component type | Annotation |
|------------|---------------|------------|
| Large bold text | Heading | H tag |
| Smaller text with content | Label / description | Label tag |
| Rounded rectangle with text | Button / CTA | Button tag |
| Card with shadow/border | Group of related items | Group outline |
| Icon without text nearby | Decorative element | Ignore Area |
| Row with icon + text | List item / option | Button or Label |
| Input field with border | Form input | Label tag |
| Toggle / switch | Interactive control | Button tag |

### Step B4: Estimate positions systematically

For each identified component, estimate its bounding box in device coordinates:

**Method: Proportional estimation**

```
Device width: 318px (or whatever the actual width)
Device height: 632px

For a component that appears:
- At roughly 1/3 from the left -> x ~ 318 * 0.33 = 105
- At roughly 1/4 from the top -> y ~ 632 * 0.25 = 158
- Spanning about 80% of width -> w ~ 318 * 0.80 = 254
- Height appears to be about 12% of screen -> h ~ 632 * 0.12 = 76
```

**Common component sizes on mobile (approximate):**

| Component | Typical width | Typical height |
|-----------|--------------|----------------|
| Page heading | 60-90% of screen | 28-40px |
| Section header | 40-60% | 18-24px |
| Card | 85-95% of screen | 60-100px |
| Button / CTA | 85-95% | 44-56px |
| List row | 85-95% | 48-64px |
| Icon | 24-32px | 24-32px |
| Tab bar | 100% | 49-83px |
| Status bar | 100% | 44px (iOS) / 24px (Android) |

### Step B5: Validate with a second screenshot

After estimating positions and placing tags, take a screenshot to verify that lines actually point at the correct components. Adjust if misaligned.

---

## Phase C: Hybrid Detection

When you have the ORIGINAL screen's node ID (before it was flattened/screenshotted):

1. Use `figma_execute` to run `mapComponents(originalNodeId)` on the ORIGINAL screen
2. Get exact bounding boxes from the live frame
3. Apply these coordinates when positioning tags on the screenshot copy

This gives programmatic precision even when working with screenshots.

```javascript
// Step 1: Map original screen (before cloning)
const components = await mapComponents('ORIGINAL_NODE_ID');

// Step 2: Clone screen as image
const original = await figma.getNodeByIdAsync('ORIGINAL_NODE_ID');
const bytes = await original.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
const image = figma.createImage(bytes);
const rect = figma.createRectangle();
rect.resize(original.width, original.height);
rect.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }];

// Step 3: Use component map coordinates for tag placement
// The coordinates from mapComponents are relative to the screen's top-left
// They apply directly to the cloned image since it's the same dimensions
```

---

## Connection Point Rules

After detecting components, apply these rules to determine where each tag's line connects:

### For LEFT-side tags (direita - line goes right)

```
Line tip touches -> TARGET's LEFT EDGE
Connection point: (component.x, component.centerY)

Root frame calculation:
  root.x = tagStartX (usually 0 or negative)
  root.width = component.x - root.x
  root.y = component.centerY - root.height / 2
```

### For RIGHT-side tags (esquerda - line goes left)

```
Line tip touches -> TARGET's RIGHT EDGE
Connection point: (component.x + component.w, component.centerY)

Root frame calculation:
  root.x = component.x + component.w
  root.width = screenFrameWidth - root.x (or enough for tag box)
  root.y = component.centerY - root.height / 2
```

### For TOP tags (baixo - line goes down)

```
Line tip touches -> TARGET's TOP EDGE
Connection point: (component.centerX, component.y)

Root frame calculation:
  root.x = component.centerX - root.width / 2
  root.height = component.y - root.y
  root.y = above the screen
```

### For BOTTOM tags (cima - line goes up)

```
Line tip touches -> TARGET's BOTTOM EDGE
Connection point: (component.centerX, component.y + component.h)

Root frame calculation:
  root.x = component.centerX - root.width / 2
  root.y = component.y + component.h
  root.height = enough for line + tag box
```

### Overlap resolution

After calculating ideal positions, check for overlaps:

```
for each pair of adjacent tags on the same side:
  gap = nextTag.y - (prevTag.y + prevTag.height)
  if gap < 32:
    nextTag.y = prevTag.y + prevTag.height + 32
```

When shifted due to overlap, the line X/Y endpoint remains correct (points at the component edge), but the line angle becomes slightly diagonal visually. This is acceptable - the connection point is what matters.

---

## Summary: The Detection Pipeline

```
1. DETECT   -> Is it a live frame or screenshot?
2. EXTRACT  -> Get component boundaries (programmatic or visual)
3. MAP      -> Build connection point map for each component
4. ASSIGN   -> Decide which side each tag goes on
5. CALCULATE -> Set root.width/height so line tip = connection point
6. STACK    -> Resolve overlaps with 32px minimum gap
7. CREATE   -> Build tags with calculated dimensions
8. VERIFY   -> Screenshot and visually confirm alignment
```

This pipeline ensures that EVERY tag's line connects precisely to its target component, regardless of the screen content or layout.