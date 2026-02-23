/**
 * Repair Tag - Figma Plugin API
 *
 * Auto-fixes common issues found by validate-handoff.js
 * Pass the screen frame nodeId to repair all annotation children.
 *
 * Usage: call repairHandoff('nodeId') via figma_execute
 * Returns: { repaired: number, actions: string[] }
 */

async function repairHandoff(screenNodeId) {
  const screen = await figma.getNodeByIdAsync(screenNodeId);
  if (!screen) return { repaired: 0, actions: ['Node not found'] };

  const actions = [];
  let repaired = 0;

  for (const child of screen.children) {
    // Remove stray ellipses (AP-03)
    if (child.type === 'ELLIPSE') {
      actions.push('Removed circle endpoint: ' + child.name);
      child.remove();
      repaired++;
      continue;
    }

    // Fix tag root frames
    if (child.type === 'FRAME' && child.layoutMode && child.layoutMode !== 'NONE') {
      repaired += repairTag(child, actions);
    }
  }

  return { repaired: repaired, actions: actions };
}

function repairTag(root, actions) {
  const tagName = root.name;
  let fixes = 0;

  for (const child of root.children) {
    // Fix Tag Box sizing (AP-02)
    if (child.cornerRadius && child.cornerRadius > 0 && child.fills && child.fills.length > 0) {
      if (child.layoutSizingHorizontal !== 'HUG') {
        child.layoutSizingHorizontal = 'HUG';
        actions.push('Fixed tag box horizontal sizing to HUG in "' + tagName + '"');
        fixes++;
      }
      if (child.layoutSizingVertical !== 'HUG') {
        child.layoutSizingVertical = 'HUG';
        actions.push('Fixed tag box vertical sizing to HUG in "' + tagName + '"');
        fixes++;
      }

      // Fix text nodes inside (AP-08)
      fixes += repairTextNodes(child, tagName, actions);

      // Remove any ellipses inside (AP-03)
      fixes += removeEllipses(child, tagName, actions);
    }

    // Fix Line Frame sizing (AP-05)
    if (child.name === 'Line' || (!child.cornerRadius && child.fills && child.fills.length > 0)) {
      const isHorizontal = root.layoutMode === 'HORIZONTAL';
      if (isHorizontal && child.layoutSizingHorizontal !== 'FILL') {
        child.layoutSizingHorizontal = 'FILL';
        actions.push('Fixed line horizontal sizing to FILL in "' + tagName + '"');
        fixes++;
      }
      if (!isHorizontal && child.layoutSizingVertical !== 'FILL') {
        child.layoutSizingVertical = 'FILL';
        actions.push('Fixed line vertical sizing to FILL in "' + tagName + '"');
        fixes++;
      }
    }
  }

  return fixes;
}

function repairTextNodes(node, tagName, actions) {
  if (!node.children) return 0;
  let fixes = 0;
  for (const child of node.children) {
    if (child.type === 'TEXT' && child.textAutoResize !== 'WIDTH_AND_HEIGHT') {
      child.textAutoResize = 'WIDTH_AND_HEIGHT';
      actions.push('Fixed text auto-resize for "' + child.characters + '" in "' + tagName + '"');
      fixes++;
    }
    if (child.children) fixes += repairTextNodes(child, tagName, actions);
  }
  return fixes;
}

function removeEllipses(node, tagName, actions) {
  if (!node.children) return 0;
  let fixes = 0;
  const toRemove = [];
  for (const child of node.children) {
    if (child.type === 'ELLIPSE' && child.width > 4 && child.width < 10) {
      toRemove.push(child);
    }
    if (child.children) fixes += removeEllipses(child, tagName, actions);
  }
  for (const el of toRemove) {
    actions.push('Removed circle inside "' + tagName + '"');
    el.remove();
    fixes++;
  }
  return fixes;
}

/**
 * Fix stacking gaps on one side (AP-06)
 * Pass an array of tag node IDs and the desired gap.
 */
async function fixStackingGaps(tagNodeIds, gap) {
  if (!gap) gap = 32;
  const tags = [];
  for (const id of tagNodeIds) {
    const node = await figma.getNodeByIdAsync(id);
    if (node) tags.push(node);
  }
  tags.sort(function(a, b) { return a.y - b.y; });
  const actions = [];
  for (var i = 1; i < tags.length; i++) {
    const expectedY = tags[i - 1].y + tags[i - 1].height + gap;
    if (Math.abs(tags[i].y - expectedY) > 2) {
      tags[i].y = expectedY;
      actions.push('Moved "' + tags[i].name + '" to y=' + Math.round(expectedY));
    }
  }
  return actions;
}