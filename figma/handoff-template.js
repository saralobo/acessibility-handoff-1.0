/**
 * Hand-off Template - Figma Plugin API
 *
 * Creates the complete hand-off layout structure matching the exact specs:
 *   Hand-off (SECTION, white) -> Title flow + Sub-flow sidebar + Flow section with screens
 *
 * All measurements extracted from the reference design at node 7:6148.
 */

const COLORS = {
  dark: { r: 38/255, g: 37/255, b: 54/255 },
  sidebar: { r: 237/255, g: 237/255, b: 237/255 },
  white: { r: 1, g: 1, b: 1 },
  black: { r: 0, g: 0, b: 0 }
};

const LAYOUT = {
  sectionMarginLeft: 231,
  sectionMarginTop: 318,
  sectionMarginRight: 247,
  sectionMarginBottom: 265,
  titleToFlowGap: 114,
  sidebarW: 427,
  sidebarToFlowGap: 51,
  titleFlowH: 605,
  titleCornerRadius: 80,
  titlePadT: 100,
  titlePadR: 215,
  titlePadB: 100,
  titlePadL: 215,
  textItemSpacing: 32,
  sidebarCornerRadius: 40,
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

async function createHandoffTemplate(options) {
  const {
    headline = 'CATEGORY',
    title = '{Title flow}',
    description = 'Description of the flow and its screens',
    subflowLabel = 'Sub-flow',
    flowName = '{Flow name}',
    screenCount = 5,
    startX = 0,
    startY = 0
  } = options || {};

  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'SemiBold' });

  // --- Calculate dimensions ---
  const flowSectionW = LAYOUT.screenLeftPad
    + (LAYOUT.screenW * screenCount)
    + (LAYOUT.screenGap * (screenCount - 1))
    + LAYOUT.screenRightPad;
  const flowSectionH = LAYOUT.screenTopPad + LAYOUT.screenH + LAYOUT.screenBottomPad;
  const titleFlowW = LAYOUT.sidebarW + LAYOUT.sidebarToFlowGap + flowSectionW;
  const totalW = LAYOUT.sectionMarginLeft + titleFlowW + LAYOUT.sectionMarginRight;
  const totalH = LAYOUT.sectionMarginTop + LAYOUT.titleFlowH + LAYOUT.titleToFlowGap + flowSectionH + LAYOUT.sectionMarginBottom;

  // --- 1. Main Section ---
  const section = figma.createSection();
  section.name = 'Hand-off';
  section.x = startX;
  section.y = startY;
  section.resizeWithoutConstraints(totalW, totalH);
  section.fills = [{ type: 'SOLID', color: COLORS.white }];

  // --- 2. Title flow ---
  const titleFlow = figma.createFrame();
  titleFlow.name = 'Title flow';
  section.appendChild(titleFlow);
  titleFlow.resize(titleFlowW, LAYOUT.titleFlowH);
  titleFlow.x = LAYOUT.sectionMarginLeft;
  titleFlow.y = LAYOUT.sectionMarginTop;
  titleFlow.fills = [{ type: 'SOLID', color: COLORS.dark }];
  titleFlow.cornerRadius = LAYOUT.titleCornerRadius;
  titleFlow.layoutMode = 'VERTICAL';
  titleFlow.layoutSizingHorizontal = 'FIXED';
  titleFlow.layoutSizingVertical = 'FIXED';
  titleFlow.paddingTop = LAYOUT.titlePadT;
  titleFlow.paddingRight = LAYOUT.titlePadR;
  titleFlow.paddingBottom = LAYOUT.titlePadB;
  titleFlow.paddingLeft = LAYOUT.titlePadL;

  // Text container
  const textFrame = figma.createFrame();
  textFrame.name = 'Text';
  textFrame.fills = [];
  titleFlow.appendChild(textFrame);
  textFrame.layoutMode = 'VERTICAL';
  textFrame.itemSpacing = LAYOUT.textItemSpacing;
  textFrame.layoutSizingHorizontal = 'FILL';
  textFrame.layoutSizingVertical = 'HUG';

  // HEADLINE
  const headlineText = figma.createText();
  headlineText.name = 'HEADLINE';
  headlineText.fontName = { family: 'Roboto', style: 'Regular' };
  headlineText.characters = headline.toUpperCase();
  headlineText.fontSize = 50;
  headlineText.fills = [{ type: 'SOLID', color: COLORS.white }];
  headlineText.textAutoResize = 'HEIGHT';
  textFrame.appendChild(headlineText);
  headlineText.layoutSizingHorizontal = 'FIXED';

  // Title
  const titleText = figma.createText();
  titleText.name = title;
  titleText.fontName = { family: 'Roboto', style: 'SemiBold' };
  titleText.characters = title;
  titleText.fontSize = 200;
  titleText.fills = [{ type: 'SOLID', color: COLORS.white }];
  titleText.textAutoResize = 'WIDTH_AND_HEIGHT';
  textFrame.appendChild(titleText);
  titleText.layoutSizingHorizontal = 'HUG';

  // Description
  const descText = figma.createText();
  descText.name = 'Description';
  descText.fontName = { family: 'Roboto', style: 'Regular' };
  descText.characters = description;
  descText.fontSize = 32;
  descText.fills = [{ type: 'SOLID', color: COLORS.white }];
  descText.textAutoResize = 'WIDTH_AND_HEIGHT';
  textFrame.appendChild(descText);
  descText.layoutSizingHorizontal = 'HUG';

  // --- 3. Sub-flow sidebar ---
  const flowY = LAYOUT.sectionMarginTop + LAYOUT.titleFlowH + LAYOUT.titleToFlowGap;

  const sidebarFrame = figma.createFrame();
  sidebarFrame.name = 'Sidebar';
  section.appendChild(sidebarFrame);
  sidebarFrame.resize(LAYOUT.sidebarW, flowSectionH);
  sidebarFrame.x = LAYOUT.sectionMarginLeft;
  sidebarFrame.y = flowY;
  sidebarFrame.fills = [{ type: 'SOLID', color: COLORS.sidebar }];
  sidebarFrame.cornerRadius = LAYOUT.sidebarCornerRadius;
  sidebarFrame.layoutMode = 'VERTICAL';
  sidebarFrame.layoutSizingVertical = 'FIXED';
  sidebarFrame.counterAxisAlignItems = 'CENTER';
  sidebarFrame.primaryAxisAlignItems = 'CENTER';

  const subflowText = figma.createText();
  subflowText.name = 'Sub-flow';
  subflowText.fontName = { family: 'Roboto', style: 'Regular' };
  subflowText.characters = subflowLabel;
  subflowText.fontSize = 64;
  subflowText.fills = [{ type: 'SOLID', color: COLORS.black }];
  subflowText.textAutoResize = 'WIDTH_AND_HEIGHT';
  subflowText.textAlignHorizontal = 'CENTER';
  sidebarFrame.appendChild(subflowText);

  // --- 4. Flow section ---
  const flowSection = figma.createSection();
  flowSection.name = flowName;
  section.appendChild(flowSection);
  flowSection.resizeWithoutConstraints(flowSectionW, flowSectionH);
  flowSection.x = LAYOUT.sectionMarginLeft + LAYOUT.sidebarW + LAYOUT.sidebarToFlowGap;
  flowSection.y = flowY;
  flowSection.fills = [{ type: 'SOLID', color: COLORS.dark }];

  // --- 5. Screen frames ---
  const screens = [];
  for (let i = 0; i < screenCount; i++) {
    const screenFrame = figma.createFrame();
    screenFrame.name = 'Screen {'.concat(String(i + 1), '}');
    flowSection.appendChild(screenFrame);
    screenFrame.resize(LAYOUT.screenW, LAYOUT.screenH);
    screenFrame.x = LAYOUT.screenLeftPad + i * (LAYOUT.screenW + LAYOUT.screenGap);
    screenFrame.y = LAYOUT.screenTopPad;
    screenFrame.fills = [];
    screenFrame.clipsContent = false;

    const deviceFrame = figma.createFrame();
    deviceFrame.name = '{Screen name}';
    screenFrame.appendChild(deviceFrame);
    deviceFrame.resize(LAYOUT.deviceW, LAYOUT.deviceH);
    deviceFrame.x = Math.round((LAYOUT.screenW - LAYOUT.deviceW) / 2);
    deviceFrame.y = Math.round((LAYOUT.screenH - LAYOUT.deviceH) / 2);
    deviceFrame.fills = [{ type: 'SOLID', color: COLORS.white }];
    deviceFrame.cornerRadius = LAYOUT.deviceCornerRadius;

    screens.push(screenFrame);
  }

  return {
    section: section,
    titleFlow: titleFlow,
    sidebar: sidebarFrame,
    flowSection: flowSection,
    screens: screens
  };
}