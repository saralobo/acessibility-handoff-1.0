/**
 * verify-handoff.js — QA Verification Layer
 *
 * Run this AFTER build-handoff.js to verify the output matches
 * the reference design. Returns objective PASS/FAIL for each check.
 *
 * The AI must NOT say "done" until all checks pass.
 * The AI must NOT give subjective opinions — only this script decides.
 *
 * Usage via figma_execute:
 *   const result = await verifyHandoff('SCREEN_FRAME_NODE_ID', expectedAnnotationCount);
 *   return result;
 */

async function verifyHandoff(screenFrameId, expectedAnnotationCount) {
  const screen = await figma.getNodeByIdAsync(screenFrameId);
  if (!screen) return { passed: false, score: '0/10', checks: [{ name: 'Node exists', status: 'FAIL', detail: 'Screen frame not found: ' + screenFrameId }] };

  const checks = [];
  let passCount = 0;

  function check(name, condition, detail) {
    const status = condition ? 'PASS' : 'FAIL';
    if (condition) passCount++;
    checks.push({ name: name, status: status, detail: detail });
  }

  // --- 1. Screen exists and has children ---
  check('Screen frame exists', screen.type === 'FRAME', 'Type: ' + screen.type);
  check('Screen has children', screen.children && screen.children.length > 0, 'Children: ' + (screen.children ? screen.children.length : 0));

  // --- 2. Device frame (cloned screen, not rebuilt) ---
  const firstChild = screen.children ? screen.children[0] : null;
  const isClone = firstChild && (firstChild.type === 'FRAME' || firstChild.type === 'COMPONENT' || firstChild.type === 'INSTANCE' || (firstChild.type === 'RECTANGLE' && firstChild.fills && firstChild.fills[0] && firstChild.fills[0].type === 'IMAGE'));
  check('Screen is cloned (not rebuilt)', isClone, firstChild ? 'First child type: ' + firstChild.type : 'No children');

  // --- 3. NO line frames (v2.1 requirement) ---
  let lineCount = 0;
  let vectorCount = 0;
  for (const child of (screen.children || [])) {
    if (child.type === 'FRAME' && child.children) {
      for (const grandchild of child.children) {
        if (grandchild.type === 'VECTOR') vectorCount++;
      }
    }
    if (child.name && child.name.toLowerCase().includes('line')) lineCount++;
  }
  check('No connecting lines (v2.1)', lineCount === 0 && vectorCount === 0, 'Lines found: ' + lineCount + ', Vectors found: ' + vectorCount);

  // --- 4. Label cards exist on the right side ---
  let labelCardCount = 0;
  let deviceRight = 0;
  if (firstChild) deviceRight = firstChild.x + firstChild.width;
  for (const child of (screen.children || [])) {
    if (child.type === 'FRAME' && child.cornerRadius === 8 && child.fills && child.fills.length > 0) {
      const fill = child.fills[0];
      if (fill.type === 'SOLID' && fill.color) {
        const isTagColor = (Math.abs(fill.color.r - 41/255) < 0.02 && Math.abs(fill.color.g - 130/255) < 0.02) ||
                           (Math.abs(fill.color.r - 39/255) < 0.02 && Math.abs(fill.color.g - 72/255) < 0.02) ||
                           (Math.abs(fill.color.r - 37/255) < 0.02 && Math.abs(fill.color.g - 41/255) < 0.02);
        if (isTagColor && child.x > deviceRight) {
          labelCardCount++;
        }
      }
    }
  }
  check('Label cards exist', labelCardCount > 0, 'Found: ' + labelCardCount + ' label cards');
  check('Label cards on RIGHT of screen', labelCardCount > 0 && deviceRight > 0, 'Device right edge: ' + Math.round(deviceRight) + 'px');

  // --- 5. Badge circles on screen ---
  let badgeCount = 0;
  for (const child of (screen.children || [])) {
    if (child.name && child.name.startsWith('Badge ')) badgeCount++;
  }
  check('Badge circles on screen', badgeCount > 0, 'Found: ' + badgeCount + ' badges');

  // --- 6. Highlight rectangles on screen ---
  let highlightCount = 0;
  for (const child of (screen.children || [])) {
    if (child.name && child.name.startsWith('Highlight ')) highlightCount++;
  }
  check('Highlight rectangles on screen', highlightCount > 0, 'Found: ' + highlightCount + ' highlights');

  // --- 7. Annotation count matches ---
  if (expectedAnnotationCount) {
    check('Annotation count matches', labelCardCount === expectedAnnotationCount, 'Expected: ' + expectedAnnotationCount + ', Found: ' + labelCardCount);
  }

  // --- 8. Tag sizing is HUG ---
  let hugCount = 0;
  let fixedCount = 0;
  for (const child of (screen.children || [])) {
    if (child.type === 'FRAME' && child.cornerRadius === 8 && child.layoutMode) {
      if (child.layoutSizingHorizontal === 'HUG') hugCount++;
      else fixedCount++;
    }
  }
  check('Tag cards use HUG sizing', fixedCount === 0, 'HUG: ' + hugCount + ', FIXED: ' + fixedCount);

  // --- 9. Text auto-resize ---
  let textOk = 0;
  let textBad = 0;
  function checkTexts(node) {
    if (!node.children) return;
    for (const child of node.children) {
      if (child.type === 'TEXT') {
        if (child.textAutoResize === 'WIDTH_AND_HEIGHT') textOk++;
        else textBad++;
      }
      if (child.children) checkTexts(child);
    }
  }
  checkTexts(screen);
  check('All text nodes auto-resize', textBad === 0, 'OK: ' + textOk + ', Bad: ' + textBad);

  // --- 10. No ELLIPSE orphans (stray circles) ---
  let strayEllipses = 0;
  for (const child of (screen.children || [])) {
    if (child.type === 'ELLIPSE') strayEllipses++;
  }
  check('No stray ellipses', strayEllipses === 0, 'Found: ' + strayEllipses);

  const total = checks.length;
  const allPassed = passCount === total;

  return {
    passed: allPassed,
    score: passCount + '/' + total,
    checks: checks,
    summary: allPassed ? 'ALL CHECKS PASSED — hand-off is valid.' : 'FAILED — ' + (total - passCount) + ' check(s) need fixing before delivery.'
  };
}