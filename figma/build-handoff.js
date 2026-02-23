/**
 * build-handoff.js v2.1 — Deterministic Handoff Builder (No Lines)
 *
 * Creates accessibility hand-off annotations in Figma.
 *
 * v2.1 design:
 *   - NO lines connecting tags to components
 *   - Label cards always stacked on the RIGHT side of the screen
 *   - Numbered badge circles placed ON each component on the screen
 *   - Colored highlight rectangles around components on the screen
 *   - Hatched gray overlay for Ignore areas
 *
 * The AI produces JSON (schema/handoff-data.schema.json).
 * This script consumes it. Same input = same output, always.
 *
 * Usage via figma_execute:
 *   const data = { screen: {...}, template: {...}, annotations: [...] };
 *   // paste this entire script, then:
 *   const result = await buildHandoff(data);
 *   return result;
 */

const TAG_COLORS = {
  Button: { r: 41/255, g: 130/255, b: 11/255 },
  Label:  { r: 39/255, g: 72/255, b: 113/255 },
  H:      { r: 37/255, g: 41/255, b: 169/255 },
  Group:  { r: 218/255, g: 67/255, b: 12/255 },
  Ignore: { r: 153/255, g: 153/255, b: 153/255 }
};

const TEMPLATE = {
  dark: { r: 38/255, g: 37/255, b: 54/255 },
  sidebar: { r: 237/255, g: 237/255, b: 237/255 },
  white: { r: 1, g: 1, b: 1 },
  black: { r: 0, g: 0, b: 0 },
  sectionMarginLeft: 231,
  sectionMarginTop: 318,
  titleFlowH: 605,
  titleCornerRadius: 80,
  titlePadT: 252, titlePadR: 215, titlePadB: 252, titlePadL: 215,
  textItemSpacing: 48,
  titleToFlowGap: 114,
  sidebarW: 427,
  sidebarCornerRadius: 40,
  sidebarToFlowGap: 51,
  screenW: 861,
  screenH: 864,
  screenGap: 234,
  screenLeftPad: 188,
  screenRightPad: 394,
  screenTopPad: 474,
  screenBottomPad: 140,
  deviceW: 318,
  deviceH: 632,
  deviceCornerRadius: 32
};

const TAG_SPEC = {
  boxPadT: 8, boxPadR: 12, boxPadB: 8, boxPadL: 12,
  boxCornerRadius: 8,
  boxItemSpacing: 8,
  badgeSize: 22,
  badgeRadius: 11,
  badgeFontSize: 9.3,
  typeFontSize: 14,
  nameFontSize: 10,
  labelCardGap: 18,
  badgeOnScreenSize: 22,
  highlightPadding: 6,
  highlightStrokeWeight: 2,
  highlightCornerRadius: 8
};

async function buildHandoff(data) {
  await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Bold' });
  await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'Bold' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'SemiBold' });

  const T = TEMPLATE;
  const S = TAG_SPEC;

  // --- Calculate dimensions ---
  const flowSectionW = T.screenLeftPad + T.screenW + T.screenRightPad;
  const flowSectionH = T.screenTopPad + T.screenH + T.screenBottomPad;
  const titleFlowW = T.sidebarW + T.sidebarToFlowGap + flowSectionW;
  const totalW = T.sectionMarginLeft + titleFlowW + 247;
  const totalH = T.sectionMarginTop + T.titleFlowH + T.titleToFlowGap + flowSectionH + 265;

  // --- 1. Main Section ---
  const section = figma.createSection();
  section.name = 'Hand-off';
  section.resizeWithoutConstraints(totalW, totalH);
  section.fills = [{ type: 'SOLID', color: T.white }];

  // --- 2. Title flow ---
  const titleFlow = figma.createFrame();
  titleFlow.name = 'Title flow';
  section.appendChild(titleFlow);
  titleFlow.resize(titleFlowW, T.titleFlowH);
  titleFlow.x = T.sectionMarginLeft;
  titleFlow.y = T.sectionMarginTop;
  titleFlow.fills = [{ type: 'SOLID', color: T.dark }];
  titleFlow.cornerRadius = T.titleCornerRadius;
  titleFlow.layoutMode = 'VERTICAL';
  titleFlow.layoutSizingHorizontal = 'FIXED';
  titleFlow.layoutSizingVertical = 'FIXED';
  titleFlow.paddingTop = T.titlePadT;
  titleFlow.paddingRight = T.titlePadR;
  titleFlow.paddingBottom = T.titlePadB;
  titleFlow.paddingLeft = T.titlePadL;

  const textFrame = figma.createFrame();
  textFrame.name = 'Text';
  textFrame.fills = [];
  titleFlow.appendChild(textFrame);
  textFrame.layoutMode = 'VERTICAL';
  textFrame.itemSpacing = T.textItemSpacing;
  textFrame.layoutSizingHorizontal = 'FILL';
  textFrame.layoutSizingVertical = 'HUG';

  const headlineText = figma.createText();
  headlineText.fontName = { family: 'Roboto', style: 'Regular' };
  headlineText.characters = (data.template.headline || 'CATEGORY').toUpperCase();
  headlineText.fontSize = 50;
  headlineText.fills = [{ type: 'SOLID', color: T.white }];
  headlineText.textAutoResize = 'WIDTH_AND_HEIGHT';
  textFrame.appendChild(headlineText);
  headlineText.layoutSizingHorizontal = 'HUG';

  const titleText = figma.createText();
  titleText.fontName = { family: 'Roboto', style: 'SemiBold' };
  titleText.characters = data.template.title || '{Title}';
  titleText.fontSize = 200;
  titleText.fills = [{ type: 'SOLID', color: T.white }];
  titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
  textFrame.appendChild(titleText);
  titleText.layoutSizingHorizontal = 'HUG';

  const descText = figma.createText();
  descText.fontName = { family: 'Roboto', style: 'Regular' };
  descText.characters = data.template.description || 'Description';
  descText.fontSize = 32;
  descText.fills = [{ type: 'SOLID', color: T.white }];
  descText.textAutoResize = 'WIDTH_AND_HEIGHT';
  textFrame.appendChild(descText);
  descText.layoutSizingHorizontal = 'HUG';

  // --- 3. Sidebar ---
  const flowY = T.sectionMarginTop + T.titleFlowH + T.titleToFlowGap;

  const sidebarFrame = figma.createFrame();
  sidebarFrame.name = data.template.subflowLabel || 'Sub-flow';
  section.appendChild(sidebarFrame);
  sidebarFrame.resize(T.sidebarW, flowSectionH);
  sidebarFrame.x = T.sectionMarginLeft;
  sidebarFrame.y = flowY;
  sidebarFrame.fills = [{ type: 'SOLID', color: T.sidebar }];
  sidebarFrame.cornerRadius = T.sidebarCornerRadius;
  sidebarFrame.layoutMode = 'VERTICAL';
  sidebarFrame.layoutSizingVertical = 'FIXED';
  sidebarFrame.counterAxisAlignItems = 'CENTER';
  sidebarFrame.primaryAxisAlignItems = 'CENTER';

  const subflowText = figma.createText();
  subflowText.fontName = { family: 'Roboto', style: 'Regular' };
  subflowText.characters = data.template.subflowLabel || 'Sub-flow';
  subflowText.fontSize = 64;
  subflowText.fills = [{ type: 'SOLID', color: T.black }];
  subflowText.textAutoResize = 'WIDTH_AND_HEIGHT';
  sidebarFrame.appendChild(subflowText);

  // --- 4. Flow section ---
  const flowSection = figma.createSection();
  flowSection.name = data.template.flowName || '{Flow name}';
  section.appendChild(flowSection);
  flowSection.resizeWithoutConstraints(flowSectionW, flowSectionH);
  flowSection.x = T.sectionMarginLeft + T.sidebarW + T.sidebarToFlowGap;
  flowSection.y = flowY;
  flowSection.fills = [{ type: 'SOLID', color: T.dark }];

  // --- 5. Screen frame ---
  const screenFrame = figma.createFrame();
  screenFrame.name = 'Screen {1}';
  flowSection.appendChild(screenFrame);
  screenFrame.resize(T.screenW, T.screenH);
  screenFrame.x = T.screenLeftPad;
  screenFrame.y = T.screenTopPad;
  screenFrame.fills = [];
  screenFrame.clipsContent = false;

  // --- 6. Clone the original screen ---
  let deviceFrame;
  try {
    const original = await figma.getNodeByIdAsync(data.screen.nodeId);
    if (original) {
      deviceFrame = original.clone();
      screenFrame.appendChild(deviceFrame);
      const scale = Math.min(T.deviceW / deviceFrame.width, T.deviceH / deviceFrame.height);
      deviceFrame.rescale(scale);
      deviceFrame.x = 0;
      deviceFrame.y = 0;
    }
  } catch (e) {
    deviceFrame = figma.createFrame();
    deviceFrame.name = data.screen.name || '{Screen}';
    screenFrame.appendChild(deviceFrame);
    deviceFrame.resize(T.deviceW, T.deviceH);
    deviceFrame.x = 0;
    deviceFrame.y = 0;
    deviceFrame.fills = [{ type: 'SOLID', color: T.white }];
    deviceFrame.cornerRadius = T.deviceCornerRadius;
  }

  const devW = deviceFrame.width;
  const devH = deviceFrame.height;
  const devX = deviceFrame.x;
  const devY = deviceFrame.y;

  // --- 7. Filter annotations ---
  const numbered = data.annotations.filter(a => a.order > 0).sort((a, b) => a.order - b.order);
  const ignores = data.annotations.filter(a => a.tagType === 'Ignore');

  // --- 8. Place badge circles ON the screen + highlight rectangles ---
  const badgePositions = [];
  const rowHeight = Math.floor(devH / (numbered.length + 1));

  for (let i = 0; i < numbered.length; i++) {
    const ann = numbered[i];
    const color = TAG_COLORS[ann.tagType] || TAG_COLORS.Label;
    const posY = devY + rowHeight * (i + 1) - S.badgeOnScreenSize / 2;

    // Highlight rectangle around estimated component area
    if (ann.tagType !== 'Group') {
      const highlight = figma.createFrame();
      highlight.name = 'Highlight ' + ann.order;
      highlight.fills = [];
      highlight.strokes = [{ type: 'SOLID', color: color }];
      highlight.strokeWeight = S.highlightStrokeWeight;
      highlight.cornerRadius = S.highlightCornerRadius;
      highlight.resize(devW - S.highlightPadding * 2, rowHeight - 8);
      highlight.x = devX + S.highlightPadding;
      highlight.y = devY + rowHeight * i + 4;
      screenFrame.appendChild(highlight);
    }

    // Badge circle on screen
    const badgeGroup = figma.createFrame();
    badgeGroup.name = 'Badge ' + ann.order;
    badgeGroup.resize(S.badgeOnScreenSize, S.badgeOnScreenSize);
    badgeGroup.fills = [{ type: 'SOLID', color: color }];
    badgeGroup.cornerRadius = S.badgeRadius;
    badgeGroup.layoutMode = 'HORIZONTAL';
    badgeGroup.counterAxisAlignItems = 'CENTER';
    badgeGroup.primaryAxisAlignItems = 'CENTER';

    const badgeNumOnScreen = figma.createText();
    badgeNumOnScreen.fontName = { family: 'Roboto', style: 'Bold' };
    badgeNumOnScreen.characters = String(ann.order);
    badgeNumOnScreen.fontSize = S.badgeFontSize;
    badgeNumOnScreen.fills = [{ type: 'SOLID', color: T.white }];
    badgeNumOnScreen.textAutoResize = 'WIDTH_AND_HEIGHT';
    badgeGroup.appendChild(badgeNumOnScreen);

    badgeGroup.x = devX + devW - S.badgeOnScreenSize - 4;
    badgeGroup.y = posY;
    screenFrame.appendChild(badgeGroup);

    badgePositions.push({ order: ann.order, y: posY });
  }

  // --- 9. Ignore area overlays ---
  for (const ann of ignores) {
    const ignoreRect = figma.createFrame();
    ignoreRect.name = 'Ignore Area';
    ignoreRect.fills = [{ type: 'SOLID', color: TAG_COLORS.Ignore, opacity: 0.3 }];
    ignoreRect.resize(54, 49);
    ignoreRect.x = devX + 36;
    ignoreRect.y = devY + devH - 90;
    screenFrame.appendChild(ignoreRect);
  }

  // --- 10. Label cards on the RIGHT side ---
  const labelStartX = devX + devW + 25;
  let labelY = devY;

  for (const ann of numbered) {
    const color = TAG_COLORS[ann.tagType] || TAG_COLORS.Label;

    const card = figma.createFrame();
    card.name = ann.tagType + ' ' + ann.order;
    card.layoutMode = 'HORIZONTAL';
    card.paddingTop = S.boxPadT;
    card.paddingRight = S.boxPadR;
    card.paddingBottom = S.boxPadB;
    card.paddingLeft = S.boxPadL;
    card.itemSpacing = S.boxItemSpacing;
    card.cornerRadius = S.boxCornerRadius;
    card.fills = [{ type: 'SOLID', color: color }];
    card.counterAxisAlignItems = 'CENTER';

    // Badge circle
    const badge = figma.createEllipse();
    badge.name = 'Badge';
    badge.resize(S.badgeSize, S.badgeSize);
    badge.fills = [{ type: 'SOLID', color: T.white }];
    card.appendChild(badge);

    const badgeNum = figma.createText();
    badgeNum.fontName = { family: 'Roboto', style: 'Bold' };
    badgeNum.characters = String(ann.order);
    badgeNum.fontSize = S.badgeFontSize;
    badgeNum.fills = [{ type: 'SOLID', color: T.black }];
    badgeNum.textAutoResize = 'WIDTH_AND_HEIGHT';
    card.appendChild(badgeNum);

    // Content
    const content = figma.createFrame();
    content.name = 'Content';
    content.layoutMode = 'VERTICAL';
    content.fills = [];
    content.itemSpacing = 2;
    card.appendChild(content);

    const typeText = figma.createText();
    typeText.fontName = { family: 'JetBrains Mono', style: 'Bold' };
    typeText.characters = ann.tagType;
    typeText.fontSize = S.typeFontSize;
    typeText.fills = [{ type: 'SOLID', color: T.white }];
    typeText.textAutoResize = 'WIDTH_AND_HEIGHT';
    content.appendChild(typeText);

    const nameText = figma.createText();
    nameText.fontName = { family: 'JetBrains Mono', style: 'Regular' };
    nameText.characters = ann.accessibilityName;
    nameText.fontSize = S.nameFontSize;
    nameText.fills = [{ type: 'SOLID', color: T.white }];
    nameText.textAutoResize = 'WIDTH_AND_HEIGHT';
    content.appendChild(nameText);

    // Set HUG sizing AFTER appendChild
    card.layoutSizingHorizontal = 'HUG';
    card.layoutSizingVertical = 'HUG';
    content.layoutSizingHorizontal = 'HUG';
    content.layoutSizingVertical = 'HUG';

    screenFrame.appendChild(card);
    card.x = labelStartX;
    card.y = labelY;

    labelY += card.height + S.labelCardGap;
  }

  figma.viewport.scrollAndZoomIntoView([section]);

  return {
    success: true,
    sectionId: section.id,
    screenFrameId: screenFrame.id,
    annotationCount: numbered.length,
    ignoreCount: ignores.length
  };
}