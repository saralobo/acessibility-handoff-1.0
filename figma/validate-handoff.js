/**
 * Validate Hand-off - Figma Plugin API
 *
 * Run this AFTER creating a hand-off to detect broken tags.
 * Pass the screen frame nodeId to validate all annotation children.
 *
 * Usage: call validateHandoff('nodeId') via figma_execute
 * Returns: { passed: boolean, issues: string[], stats: object }
 */

async function validateHandoff(screenNodeId) {
  const screen = await figma.getNodeByIdAsync(screenNodeId);
  if (!screen) return { passed: false, issues: ['Screen node not found: ' + screenNodeId], stats: {} };

  const issues = [];
  const stats = {
    totalTags: 0,
    totalEllipses: 0,
    fixedWidthBoxes: 0,
    fixedLines: 0,
    clippedText: 0,
    overlapPairs: 0,
    sidesUsed: { left: 0, right: 0, top: 0, bottom: 0 },
    screenType: 'unknown'
  };

  // Check screen type
  const firstChild = screen.children[0];
  if (firstChild) {
    if (firstChild.type === 'RECTANGLE' && firstChild.fills && firstChild.fills.length > 0 && firstChild.fills[0].type === 'IMAGE') {
      stats.screenType = 'screenshot (correct)';
    } else if (firstChild.type === 'FRAME' && firstChild.children && firstChild.children.length > 5) {
      stats.screenType = 'REBUILT FROM SCRATCH (wrong)';
      issues.push('AP-01: Screen appears rebuilt from scratch. Use clone or screenshot instead.');
    } else {
      stats.screenType = 'cloned frame (likely correct)';
    }
  }

  // Scan all children
  const tagRoots = [];
  for (const child of screen.children) {
    // Check for stray ellipses
    if (child.type === 'ELLIPSE') {
      stats.totalEllipses++;
      issues.push('AP-03: Found ELLIPSE node "' + child.name + '" (circle endpoint). Delete it.');
    }

    // Identify tag root frames
    if (child.type === 'FRAME' && child.layoutMode && child.layoutMode !== 'NONE') {
      tagRoots.push(child);
      stats.totalTags++;

      // Determine side by name
      if (child.name.indexOf('direita') !== -1) stats.sidesUsed.left++;
      else if (child.name.indexOf('esquerda') !== -1) stats.sidesUsed.right++;
      else if (child.name.indexOf('baixo') !== -1) stats.sidesUsed.top++;
      else if (child.name.indexOf('cima') !== -1) stats.sidesUsed.bottom++;

      // Validate tag structure
      validateTag(child, issues, stats);
    }
  }

  // Check stacking gaps
  const sides = { left: [], right: [], top: [], bottom: [] };
  for (const tag of tagRoots) {
    if (tag.name.indexOf('direita') !== -1) sides.left.push(tag);
    else if (tag.name.indexOf('esquerda') !== -1) sides.right.push(tag);
    else if (tag.name.indexOf('baixo') !== -1) sides.top.push(tag);
    else if (tag.name.indexOf('cima') !== -1) sides.bottom.push(tag);
  }

  for (const sideName in sides) {
    const tags = sides[sideName].sort(function(a, b) { return a.y - b.y; });
    for (var i = 0; i < tags.length - 1; i++) {
      const gap = tags[i + 1].y - (tags[i].y + tags[i].height);
      if (gap < 28) {
        stats.overlapPairs++;
        issues.push('AP-06: Tags "' + tags[i].name + '" and "' + tags[i + 1].name + '" overlap or gap < 32px (gap=' + Math.round(gap) + 'px) on ' + sideName + ' side.');
      }
    }
  }

  // Check side distribution
  const usedSides = Object.values(stats.sidesUsed).filter(function(v) { return v > 0; }).length;
  if (usedSides < 2 && stats.totalTags > 3) {
    issues.push('AP-07: All tags on ' + usedSides + ' side(s). Distribute across at least 2 sides.');
  }

  return {
    passed: issues.length === 0,
    issues: issues,
    stats: stats
  };
}

function validateTag(root, issues, stats) {
  const tagName = root.name;

  for (const child of root.children) {
    // Find Tag Box (has cornerRadius and colored fill)
    if (child.cornerRadius && child.cornerRadius > 0 && child.fills && child.fills.length > 0) {
      // This is the tag box
      if (child.layoutSizingHorizontal !== 'HUG') {
        stats.fixedWidthBoxes++;
        issues.push('AP-02: Tag box in "' + tagName + '" has layoutSizingHorizontal=' + child.layoutSizingHorizontal + ' (should be HUG).');
      }
      if (child.layoutSizingVertical !== 'HUG') {
        stats.fixedWidthBoxes++;
        issues.push('AP-02: Tag box in "' + tagName + '" has layoutSizingVertical=' + child.layoutSizingVertical + ' (should be HUG).');
      }

      // Check for ellipses inside tag box
      checkForEllipses(child, tagName, issues, stats);

      // Check text nodes
      checkTextNodes(child, tagName, issues, stats);
    }

    // Find Line Frame (small height/width, FILL sizing expected)
    if (child.name === 'Line' || (child.fills && child.fills.length > 0 && !child.cornerRadius)) {
      const isHorizontal = root.layoutMode === 'HORIZONTAL';
      if (isHorizontal && child.layoutSizingHorizontal !== 'FILL') {
        stats.fixedLines++;
        issues.push('AP-05: Line in "' + tagName + '" has layoutSizingHorizontal=' + child.layoutSizingHorizontal + ' (should be FILL).');
      }
      if (!isHorizontal && child.layoutSizingVertical !== 'FILL') {
        stats.fixedLines++;
        issues.push('AP-05: Line in "' + tagName + '" has layoutSizingVertical=' + child.layoutSizingVertical + ' (should be FILL).');
      }
    }
  }
}

function checkForEllipses(node, tagName, issues, stats) {
  if (!node.children) return;
  for (const child of node.children) {
    if (child.type === 'ELLIPSE' && child.width > 4 && child.width < 10) {
      stats.totalEllipses++;
      issues.push('AP-03: Circle endpoint found inside "' + tagName + '". Remove it.');
    }
    if (child.children) checkForEllipses(child, tagName, issues, stats);
  }
}

function checkTextNodes(node, tagName, issues, stats) {
  if (!node.children) return;
  for (const child of node.children) {
    if (child.type === 'TEXT') {
      if (child.textAutoResize !== 'WIDTH_AND_HEIGHT') {
        stats.clippedText++;
        issues.push('AP-08: Text "' + child.characters + '" in "' + tagName + '" has textAutoResize=' + child.textAutoResize + ' (should be WIDTH_AND_HEIGHT).');
      }
    }
    if (child.children) checkTextNodes(child, tagName, issues, stats);
  }
}