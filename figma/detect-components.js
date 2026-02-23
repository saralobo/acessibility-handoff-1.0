/**
 * Component Detection - Figma Plugin API
 *
 * Scans a screen node and returns a structured map of every component's
 * position, boundaries, and connection points for annotation tag placement.
 *
 * Supports:
 * - Live Figma frames (traverses children for exact bounding boxes)
 * - Screenshots/images (returns device frame info for visual estimation)
 *
 * Usage: call detectComponents('screenNodeId') via figma_execute
 */

async function detectComponents(screenNodeId) {
  const screen = await figma.getNodeByIdAsync(screenNodeId);
  if (!screen) return { error: 'Node not found' };

  const screenBB = screen.absoluteBoundingBox;
  const screenW = Math.round(screenBB.width);
  const screenH = Math.round(screenBB.height);

  // Detect if this is a live frame or a flat image
  const isLiveFrame = screen.type === 'FRAME' && screen.children && screen.children.length > 0;
  const isImage = screen.type === 'RECTANGLE' && screen.fills &&
    screen.fills.length > 0 && screen.fills[0].type === 'IMAGE';

  if (isImage) {
    return {
      mode: 'screenshot',
      message: 'Screen is a flat image. Use visual estimation or hybrid detection with original node ID.',
      device: { width: screenW, height: screenH },
      instruction: 'Take screenshot at scale 3, visually identify components, estimate positions using proportional method from docs/11-component-detection.md'
    };
  }

  // Live frame: traverse and extract all components
  const components = [];

  function traverse(node, depth, parentName) {
    if (!node.visible) return;
    var bb = node.absoluteBoundingBox;
    if (!bb) return;

    var relX = Math.round(bb.x - screenBB.x);
    var relY = Math.round(bb.y - screenBB.y);
    var w = Math.round(bb.width);
    var h = Math.round(bb.height);

    if (w < 8 || h < 8) return;
    if (depth === 0) {
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          traverse(node.children[i], depth + 1, node.name);
        }
      }
      return;
    }

    var role = 'unknown';
    var detail = '';

    if (node.type === 'TEXT') {
      role = node.fontSize > 20 ? 'heading' : 'text';
      detail = node.characters || '';
    } else if (node.type === 'INSTANCE' || node.type === 'COMPONENT') {
      role = 'component';
      detail = node.name;
    } else if (node.type === 'VECTOR' || node.type === 'BOOLEAN_OPERATION') {
      role = w <= 32 ? 'icon' : 'graphic';
    } else if ((node.type === 'FRAME' || node.type === 'GROUP') && depth <= 3) {
      role = 'container';
      detail = node.name;
    } else if (node.type === 'RECTANGLE') {
      if (node.fills && node.fills.length > 0 && node.fills[0].type === 'IMAGE') {
        role = 'image';
      } else {
        role = 'shape';
      }
    }

    var midX = Math.round(screenW / 2);

    components.push({
      id: node.id,
      name: node.name,
      type: node.type,
      role: role,
      detail: detail.substring(0, 60),
      depth: depth,
      bounds: { x: relX, y: relY, w: w, h: h },
      center: { x: relX + Math.round(w / 2), y: relY + Math.round(h / 2) },
      connectionPoints: {
        leftEdge:   { x: relX, y: relY + Math.round(h / 2) },
        rightEdge:  { x: relX + w, y: relY + Math.round(h / 2) },
        topEdge:    { x: relX + Math.round(w / 2), y: relY },
        bottomEdge: { x: relX + Math.round(w / 2), y: relY + h }
      },
      suggestedSide: relX + Math.round(w / 2) < midX ? 'left' : 'right'
    });

    if (node.children && depth < 4) {
      for (var i = 0; i < node.children.length; i++) {
        traverse(node.children[i], depth + 1, node.name);
      }
    }
  }

  traverse(screen, 0, '');

  // Filter to meaningful components
  var annotatable = components.filter(function(c) {
    if (c.role === 'heading') return true;
    if (c.role === 'text' && c.detail.length > 2) return true;
    if (c.role === 'component') return true;
    if (c.role === 'icon') return true;
    if (c.role === 'image') return true;
    if (c.role === 'container' && c.depth <= 2) return true;
    return false;
  });

  return {
    mode: 'live_frame',
    screenSize: { width: screenW, height: screenH },
    totalNodes: components.length,
    annotatableCount: annotatable.length,
    components: annotatable
  };
}


/**
 * Hybrid Detection - use original screen's structure to map a screenshot
 *
 * Usage: call hybridDetect('originalNodeId', deviceX, deviceY) via figma_execute
 * Returns component map with coordinates converted to screen frame space
 */
async function hybridDetect(originalNodeId, deviceFrameX, deviceFrameY) {
  var result = await detectComponents(originalNodeId);
  if (result.error || result.mode !== 'live_frame') return result;

  // Convert all coordinates from device-relative to screen-frame-relative
  for (var i = 0; i < result.components.length; i++) {
    var c = result.components[i];
    c.screenBounds = {
      x: c.bounds.x + deviceFrameX,
      y: c.bounds.y + deviceFrameY,
      w: c.bounds.w,
      h: c.bounds.h
    };
    c.screenCenter = {
      x: c.center.x + deviceFrameX,
      y: c.center.y + deviceFrameY
    };
    c.screenConnectionPoints = {
      leftEdge:   { x: c.connectionPoints.leftEdge.x + deviceFrameX,   y: c.connectionPoints.leftEdge.y + deviceFrameY },
      rightEdge:  { x: c.connectionPoints.rightEdge.x + deviceFrameX,  y: c.connectionPoints.rightEdge.y + deviceFrameY },
      topEdge:    { x: c.connectionPoints.topEdge.x + deviceFrameX,    y: c.connectionPoints.topEdge.y + deviceFrameY },
      bottomEdge: { x: c.connectionPoints.bottomEdge.x + deviceFrameX, y: c.connectionPoints.bottomEdge.y + deviceFrameY }
    };
  }

  result.mode = 'hybrid';
  result.deviceOffset = { x: deviceFrameX, y: deviceFrameY };
  return result;
}