/**
 * build-handoff.js — Deterministic Handoff Builder
 *
 * This is the ONLY script that creates visual output in Figma.
 * It receives a structured JSON (matching schema/handoff-data.schema.json)
 * and produces an identical hand-off layout every time.
 *
 * The AI's job is to ANALYZE and produce the JSON.
 * This script's job is to BUILD the visual output.
 * These two concerns must NEVER be mixed.
 *
 * Usage via figma_execute:
 *   const data = { screen: {...}, template: {...}, annotations: [...] };
 *   // paste this entire script, then call:
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
  badgeFontSize: 10,
  typeFontSize: 14,
  labelFontSize: 12,
  stateFontSize: 10,
  lineWeight: 2,
  lineFrameThickness: 4,
  stackGap: 32
};

async function buildHandoff(data) {
  await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Bold' });
  await figma.loadFontAsync({ family: 'JetBrains Mono', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'SemiBold' });

  const T = TEMPLATE;
  const screenCount = 1;

  // --- Calculate dimensions ---
  const flowSectionW = T.screenLeftPad + (T.screenW * screenCount) + T.screenRightPad;
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
  titleText.characters = data.template.title || '{Title flow}';
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
      deviceFrame.x = Math.round((T.screenW - deviceFrame.width) / 2);
      deviceFrame.y = Math.round((T.screenH - deviceFrame.height) / 2);
    }
  } catch (e) {
    // Fallback: create placeholder
    deviceFrame = figma.createFrame();
    deviceFrame.name = data.screen.name || '{Screen}';
    screenFrame.appendChild(deviceFrame);
    deviceFrame.resize(T.deviceW, T.deviceH);
    deviceFrame.x = Math.round((T.screenW - T.deviceW) / 2);
    deviceFrame.y = Math.round((T.screenH - T.deviceH) / 2);
    deviceFrame.fills = [{ type: 'SOLID', color: T.white }];
    deviceFrame.cornerRadius = T.deviceCornerRadius;
  }

  const deviceBB = { x: deviceFrame.x, y: deviceFrame.y, w: deviceFrame.width, h: deviceFrame.height };

  // --- 7. Build annotation tags ---
  const sides = { direita: [], esquerda: [], baixo: [], cima: [] };
  const tagAnnotations = data.annotations.filter(a => a.tagType !== 'Group' && a.tagType !== 'Ignore');
  const groupAnnotations = data.annotations.filter(a => a.tagType === 'Group');
  const ignoreAnnotations = data.annotations.filter(a => a.tagType === 'Ignore');

  for (const ann of tagAnnotations) {
    if (!sides[ann.side]) continue;
    sides[ann.side].push(ann);
  }

  for (const side in sides) {
    const tags = sides[side];
    const isHorizontal = (side === 'direita' || side === 'esquerda');
    let offset = 0;

    for (let i = 0; i < tags.length; i++) {
      const ann = tags[i];
      const color = TAG_COLORS[ann.tagType];
      const S = TAG_SPEC;

      // Root frame
      const root = figma.createFrame();
      root.name = ann.tagType + ' ' + side;
      root.layoutMode = isHorizontal ? 'HORIZONTAL' : 'VERTICAL';
      root.primaryAxisSizingMode = 'FIXED';
      root.counterAxisSizingMode = 'AUTO';
      root.counterAxisAlignItems = 'CENTER';
      root.itemSpacing = 0;
      root.fills = [];
      root.clipsContent = false;

      // Tag box
      const tagBox = figma.createFrame();
      tagBox.name = 'Tag';
      tagBox.layoutMode = 'HORIZONTAL';
      tagBox.paddingTop = S.boxPadT;
      tagBox.paddingRight = S.boxPadR;
      tagBox.paddingBottom = S.boxPadB;
      tagBox.paddingLeft = S.boxPadL;
      tagBox.itemSpacing = S.boxItemSpacing;
      tagBox.cornerRadius = S.boxCornerRadius;
      tagBox.fills = [{ type: 'SOLID', color: color }];
      tagBox.counterAxisAlignItems = 'CENTER';

      // Badge (only if order > 0)
      if (ann.order > 0) {
        const badge = figma.createEllipse();
        badge.name = 'Badge';
        badge.resize(S.badgeSize, S.badgeSize);
        badge.fills = [{ type: 'SOLID', color: T.white }];
        tagBox.appendChild(badge);

        const badgeNum = figma.createText();
        badgeNum.fontName = { family: 'JetBrains Mono', style: 'Bold' };
        badgeNum.characters = String(ann.order);
        badgeNum.fontSize = S.badgeFontSize;
        badgeNum.fills = [{ type: 'SOLID', color: T.black }];
        badgeNum.textAutoResize = 'WIDTH_AND_HEIGHT';
        badgeNum.textAlignHorizontal = 'CENTER';
        tagBox.appendChild(badgeNum);
      }

      // Content frame
      const content = figma.createFrame();
      content.name = 'Content';
      content.layoutMode = 'VERTICAL';
      content.fills = [];
      content.itemSpacing = 2;
      tagBox.appendChild(content);

      // Type text
      const typeText = figma.createText();
      typeText.fontName = { family: 'JetBrains Mono', style: 'Bold' };
      typeText.characters = ann.tagType;
      typeText.fontSize = S.typeFontSize;
      typeText.fills = [{ type: 'SOLID', color: T.white }];
      typeText.textAutoResize = 'WIDTH_AND_HEIGHT';
      content.appendChild(typeText);

      // Label text
      const labelText = figma.createText();
      labelText.fontName = { family: 'JetBrains Mono', style: 'Regular' };
      labelText.characters = ann.accessibilityName;
      labelText.fontSize = S.labelFontSize;
      labelText.fills = [{ type: 'SOLID', color: T.white }];
      labelText.textAutoResize = 'WIDTH_AND_HEIGHT';
      content.appendChild(labelText);

      // State text (Button only)
      if (ann.state && ann.tagType === 'Button') {
        const stateText = figma.createText();
        stateText.fontName = { family: 'JetBrains Mono', style: 'Regular' };
        stateText.characters = ann.state;
        stateText.fontSize = S.stateFontSize;
        stateText.fills = [{ type: 'SOLID', color: T.white }];
        stateText.textAutoResize = 'WIDTH_AND_HEIGHT';
        content.appendChild(stateText);
      }

      // Line frame with vector
      const lineFrame = figma.createFrame();
      lineFrame.name = 'Line';
      lineFrame.fills = [];
      lineFrame.clipsContent = false;

      const lineVector = figma.createVector();
      lineVector.name = 'Line';
      lineVector.strokes = [{ type: 'SOLID', color: color }];
      lineVector.strokeWeight = S.lineWeight;
      lineVector.fills = [];
      lineFrame.appendChild(lineVector);

      // Assemble based on side
      if (side === 'direita' || side === 'baixo') {
        root.appendChild(tagBox);
        root.appendChild(lineFrame);
      } else {
        root.appendChild(lineFrame);
        root.appendChild(tagBox);
      }

      // Set sizing AFTER appendChild
      tagBox.layoutSizingHorizontal = 'HUG';
      tagBox.layoutSizingVertical = 'HUG';
      content.layoutSizingHorizontal = 'HUG';
      content.layoutSizingVertical = 'HUG';

      if (isHorizontal) {
        lineFrame.resize(100, S.lineFrameThickness);
        lineFrame.layoutSizingHorizontal = 'FILL';
        lineFrame.layoutSizingVertical = 'FIXED';
        lineVector.vectorPaths = [{ windingRule: 'NONE', data: 'M 0 ' + (S.lineFrameThickness/2) + ' L 100 ' + (S.lineFrameThickness/2) }];
        lineVector.constraints = { horizontal: 'STRETCH', vertical: 'CENTER' };
      } else {
        lineFrame.resize(S.lineFrameThickness, 100);
        lineFrame.layoutSizingHorizontal = 'FIXED';
        lineFrame.layoutSizingVertical = 'FILL';
        lineVector.vectorPaths = [{ windingRule: 'NONE', data: 'M ' + (S.lineFrameThickness/2) + ' 0 L ' + (S.lineFrameThickness/2) + ' 100' }];
        lineVector.constraints = { horizontal: 'CENTER', vertical: 'STRETCH' };
      }

      // Position the tag
      screenFrame.appendChild(root);

      if (side === 'direita') {
        root.resize(deviceBB.x + 30, root.height);
        root.x = deviceBB.x - root.width;
        root.y = deviceBB.y + 40 + offset;
      } else if (side === 'esquerda') {
        root.resize(T.screenW - (deviceBB.x + deviceBB.w) + 30, root.height);
        root.x = deviceBB.x + deviceBB.w - 30;
        root.y = deviceBB.y + 40 + offset;
      } else if (side === 'baixo') {
        root.resize(root.width, deviceBB.y + 30);
        root.x = deviceBB.x + 20 + offset;
        root.y = 0;
      } else if (side === 'cima') {
        root.resize(root.width, T.screenH - (deviceBB.y + deviceBB.h) + 30);
        root.x = deviceBB.x + 20 + offset;
        root.y = deviceBB.y + deviceBB.h - 30;
      }

      offset += root.height + S.stackGap;
    }
  }

  // --- 8. Group outlines ---
  for (const ann of groupAnnotations) {
    const groupOutline = figma.createFrame();
    groupOutline.name = 'Group';
    groupOutline.fills = [];
    groupOutline.strokes = [{ type: 'SOLID', color: TAG_COLORS.Group }];
    groupOutline.strokeWeight = 2;
    groupOutline.cornerRadius = 8;
    groupOutline.resize(deviceBB.w + 20, 80);
    groupOutline.x = deviceBB.x - 10;
    groupOutline.y = deviceBB.y + deviceBB.h * 0.3;
    screenFrame.appendChild(groupOutline);
  }

  // --- 9. Ignore areas ---
  for (const ann of ignoreAnnotations) {
    const ignoreArea = figma.createFrame();
    ignoreArea.name = 'Ignore Area';
    ignoreArea.fills = [{ type: 'SOLID', color: TAG_COLORS.Ignore, opacity: 0.3 }];
    ignoreArea.resize(54, 49);
    ignoreArea.x = deviceBB.x + 36;
    ignoreArea.y = deviceBB.y + deviceBB.h - 90;
    screenFrame.appendChild(ignoreArea);
  }

  figma.viewport.scrollAndZoomIntoView([section]);

  return {
    success: true,
    sectionId: section.id,
    screenFrameId: screenFrame.id,
    tagCount: tagAnnotations.length,
    groupCount: groupAnnotations.length,
    ignoreCount: ignoreAnnotations.length
  };
}