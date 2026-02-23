/**
 * verify-handoff.js v2.2 — Strict QA Verification Layer
 *
 * 16 checks that catch real visual problems, not just existence.
 * Detects: equal-height bands, oversized highlights, filled highlights,
 * badges outside device, overlapping cards, missing elements, wrong sizing.
 *
 * The AI must NOT say "done" until all checks pass.
 *
 * Usage via figma_execute:
 *   const result = await verifyHandoff('SCREEN_FRAME_ID', expectedCount);
 *   return result;
 */

async function verifyHandoff(screenFrameId, expectedAnnotationCount) {
  const screen = await figma.getNodeByIdAsync(screenFrameId);
  if (!screen) {
    return {
      passed: false,
      score: '0/16',
      checks: [{ name: '1. Screen frame exists', status: 'FAIL', detail: 'Node not found: ' + screenFrameId, severity: 'CRITICAL' }],
      summary: 'BLOCKED — Screen frame not found.'
    };
  }

  const checks = [];
  let passCount = 0;

  function check(name, condition, detail, severity) {
    const status = condition ? 'PASS' : 'FAIL';
    if (condition) passCount++;
    checks.push({ name: name, status: status, detail: detail, severity: severity || 'CRITICAL' });
  }

  const children = screen.children || [];
  const deviceFrame = children[0] || null;
  const devRight = deviceFrame ? deviceFrame.x + deviceFrame.width : 0;
  const devBottom = deviceFrame ? deviceFrame.y + deviceFrame.height : 0;
  const devW = deviceFrame ? deviceFrame.width : 1;
  const devH = deviceFrame ? deviceFrame.height : 1;
  const devArea = devW * devH;

  // --- Collect elements by name prefix ---
  const labelCards = [];
  const highlights = [];
  const badges = [];

  for (const child of children) {
    const n = child.name || '';
    if (n.startsWith('Label Card ')) { labelCards.push(child); continue; }
    if (n.startsWith('Highlight ')) { highlights.push(child); continue; }
    if (n.startsWith('Badge ')) { badges.push(child); continue; }
  }

  // === CHECK 1: Screen frame type ===
  check('1. Screen frame exists', screen.type === 'FRAME', 'Type: ' + screen.type);

  // === CHECK 2: Has enough children ===
  check('2. Screen has children', children.length > 2, 'Children: ' + children.length);

  // === CHECK 3: Device frame is cloned (not rebuilt) ===
  const hasRealContent = deviceFrame && deviceFrame.children && deviceFrame.children.length > 2;
  const isCloneType = deviceFrame && ['FRAME', 'COMPONENT', 'INSTANCE', 'GROUP'].includes(deviceFrame.type);
  check('3. Device is cloned (not rebuilt)',
    isCloneType && hasRealContent,
    deviceFrame
      ? 'Type: ' + deviceFrame.type + ', Children: ' + (deviceFrame.children ? deviceFrame.children.length : 0)
      : 'No device frame found');

  // === CHECK 4: No connecting lines ===
  let lineCount = 0;
  let vectorCount = 0;
  for (const child of children) {
    if (child.type === 'VECTOR' || child.type === 'LINE') vectorCount++;
    if (child.name && child.name.toLowerCase().includes('line')) lineCount++;
    if (child.children) {
      for (const gc of child.children) {
        if (gc.type === 'VECTOR' || gc.type === 'LINE') vectorCount++;
      }
    }
  }
  check('4. No connecting lines', lineCount === 0 && vectorCount === 0,
    'Line-named: ' + lineCount + ', Vectors: ' + vectorCount);

  // === CHECK 5: Label cards exist ===
  check('5. Label cards exist', labelCards.length > 0, 'Found: ' + labelCards.length);

  // === CHECK 6: ALL label cards on right side ===
  const cardsOnLeft = labelCards.filter(function(c) { return c.x <= devRight; });
  check('6. All labels on RIGHT of device', cardsOnLeft.length === 0,
    cardsOnLeft.length > 0
      ? cardsOnLeft.length + ' card(s) at x <= ' + Math.round(devRight) + 'px (device right edge)'
      : 'All ' + labelCards.length + ' cards positioned correctly');

  // === CHECK 7: Label cards don't overlap ===
  let cardOverlaps = 0;
  const sortedCards = labelCards.slice().sort(function(a, b) { return a.y - b.y; });
  for (let i = 1; i < sortedCards.length; i++) {
    var prev = sortedCards[i - 1];
    var curr = sortedCards[i];
    if (curr.y < prev.y + prev.height - 2) cardOverlaps++;
  }
  check('7. Label cards don\'t overlap', cardOverlaps === 0,
    'Overlapping pairs: ' + cardOverlaps, 'HIGH');

  // === CHECK 8: Badges exist ===
  check('8. Badge circles exist', badges.length > 0, 'Found: ' + badges.length);

  // === CHECK 9: Badges within device bounds ===
  var margin = 20;
  var badgesOutside = 0;
  for (var bi = 0; bi < badges.length; bi++) {
    var b = badges[bi];
    var cx = b.x + b.width / 2;
    var cy = b.y + b.height / 2;
    if (deviceFrame && (cx < deviceFrame.x - margin || cx > devRight + margin ||
        cy < deviceFrame.y - margin || cy > devBottom + margin)) {
      badgesOutside++;
    }
  }
  check('9. Badges near device bounds', badgesOutside === 0,
    badgesOutside > 0
      ? badgesOutside + '/' + badges.length + ' badge(s) outside device area'
      : 'All ' + badges.length + ' within bounds');

  // === CHECK 10: Highlights are stroke-only (no solid fills) ===
  var filledHighlights = 0;
  for (var hi = 0; hi < highlights.length; hi++) {
    var h = highlights[hi];
    if (h.fills && h.fills.length > 0) {
      for (var fi = 0; fi < h.fills.length; fi++) {
        var f = h.fills[fi];
        if (f.type === 'SOLID' && f.visible !== false && (!('opacity' in f) || f.opacity > 0.05)) {
          filledHighlights++;
          break;
        }
      }
    }
  }
  check('10. Highlights are stroke-only',
    filledHighlights === 0 || highlights.length === 0,
    filledHighlights > 0
      ? filledHighlights + '/' + highlights.length + ' highlight(s) have solid fills — must be stroke-only'
      : 'All clean');

  // === CHECK 11: No oversized highlights (>40% of device area) ===
  var oversized = 0;
  for (var oi = 0; oi < highlights.length; oi++) {
    var oh = highlights[oi];
    if (oh.width * oh.height > devArea * 0.4) oversized++;
  }
  check('11. No oversized highlights (>40% of screen)',
    oversized === 0 || highlights.length === 0,
    oversized > 0
      ? oversized + '/' + highlights.length + ' highlight(s) cover >40% of screen — they should wrap individual components, not large areas'
      : 'All appropriately sized');

  // === CHECK 12: Highlights are NOT equal-height bands ===
  var isEqualBands = false;
  if (highlights.length >= 3) {
    var hHeights = highlights.map(function(h) { return Math.round(h.height); });
    var hWidths = highlights.map(function(h) { return Math.round(h.width); });
    var allSameH = hHeights.every(function(h) { return Math.abs(h - hHeights[0]) < 5; });
    var allFullW = hWidths.every(function(w) { return w > devW * 0.85; });
    isEqualBands = allSameH && allFullW;
  }
  check('12. Highlights are NOT uniform bands', !isEqualBands,
    isEqualBands
      ? 'All highlights are same-height (' + Math.round(highlights[0].height) + 'px) full-width bands — this means targetBounds was missing or wrong. Each highlight should wrap its specific component.'
      : highlights.length >= 3
        ? 'Heights vary: [' + highlights.map(function(h) { return Math.round(h.height); }).join(', ') + ']px'
        : 'OK (' + highlights.length + ' highlights)');

  // === CHECK 13: Annotation count ===
  if (expectedAnnotationCount) {
    check('13a. Label card count matches',
      labelCards.length === expectedAnnotationCount,
      'Expected: ' + expectedAnnotationCount + ', Found: ' + labelCards.length);
    check('13b. Badge count matches',
      badges.length === expectedAnnotationCount,
      'Expected: ' + expectedAnnotationCount + ', Found: ' + badges.length);
  }

  // === CHECK 14: All cards use HUG sizing ===
  var fixedCards = 0;
  for (var ci = 0; ci < labelCards.length; ci++) {
    if (labelCards[ci].layoutSizingHorizontal && labelCards[ci].layoutSizingHorizontal !== 'HUG') fixedCards++;
  }
  check('14. Label cards use HUG sizing', fixedCards === 0,
    fixedCards > 0 ? fixedCards + ' card(s) use FIXED sizing instead of HUG' : 'All HUG');

  // === CHECK 15: Text auto-resizes ===
  var textOk = 0;
  var textBad = 0;
  function scanTexts(node) {
    if (!node || !node.children) return;
    for (var ti = 0; ti < node.children.length; ti++) {
      var child = node.children[ti];
      if (child.type === 'TEXT') {
        if (child.textAutoResize === 'WIDTH_AND_HEIGHT') textOk++;
        else textBad++;
      }
      if (child.children) scanTexts(child);
    }
  }
  for (var si = 0; si < labelCards.length; si++) scanTexts(labelCards[si]);
  check('15. All text auto-resizes', textBad === 0,
    'Auto: ' + textOk + ', Fixed: ' + textBad);

  // === CHECK 16: Badge numbers are sequential ===
  var sequential = true;
  var badgeNums = badges.map(function(b) {
    return parseInt(b.name.replace('Badge ', ''));
  }).sort(function(a, b) { return a - b; });
  for (var ni = 0; ni < badgeNums.length; ni++) {
    if (badgeNums[ni] !== ni + 1) { sequential = false; break; }
  }
  check('16. Badge numbers sequential', sequential,
    'Numbers: [' + badgeNums.join(', ') + ']', 'HIGH');

  // --- Summary ---
  var total = checks.length;
  var criticalFails = checks.filter(function(c) { return c.status === 'FAIL' && c.severity === 'CRITICAL'; }).length;
  var highFails = checks.filter(function(c) { return c.status === 'FAIL' && c.severity === 'HIGH'; }).length;
  var allPassed = passCount === total;

  return {
    passed: allPassed,
    score: passCount + '/' + total,
    criticalFails: criticalFails,
    highFails: highFails,
    checks: checks,
    summary: allPassed
      ? 'ALL CHECKS PASSED — hand-off is valid.'
      : criticalFails > 0
        ? 'BLOCKED — ' + criticalFails + ' critical failure(s). Must fix before delivery.'
        : 'WARNING — ' + highFails + ' non-critical issue(s). Review recommended.'
  };
}