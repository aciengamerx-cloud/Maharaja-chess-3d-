import * as THREE from 'three';

/**
 * Generates high-resolution procedural textures for the 8x8 Chessboard tiles:
 * - Light squares: Smooth luminous warm-ivory alabaster
 * - Dark squares: Deep midnight obsidian-navy stone with subtle gold-vein sheen
 */
export function createChessboardMarbleTextures() {
  const size = 512;

  // 1. Light Square Texture (Warm Ivory Alabaster)
  const lightCanvas = document.createElement('canvas');
  lightCanvas.width = size;
  lightCanvas.height = size;
  const lCtx = lightCanvas.getContext('2d');

  const lGrad = lCtx.createLinearGradient(0, 0, size, size);
  lGrad.addColorStop(0, '#fbf9f4');
  lGrad.addColorStop(0.5, '#f5f1e6');
  lGrad.addColorStop(1, '#ede6d6');
  lCtx.fillStyle = lGrad;
  lCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 18; i++) {
    const x = (Math.sin(i * 73.1) * 0.5 + 0.5) * size;
    const y = (Math.cos(i * 41.7) * 0.5 + 0.5) * size;
    const r = 60 + (i % 5) * 30;
    const g = lCtx.createRadialGradient(x, y, 4, x, y, r);
    g.addColorStop(0, 'rgba(225, 214, 192, 0.14)');
    g.addColorStop(1, 'rgba(225, 214, 192, 0.0)');
    lCtx.fillStyle = g;
    lCtx.fillRect(0, 0, size, size);
  }

  lCtx.strokeStyle = 'rgba(210, 192, 155, 0.28)';
  lCtx.lineWidth = 4;
  lCtx.strokeRect(2, 2, size - 4, size - 4);

  const lightMarbleMap = new THREE.CanvasTexture(lightCanvas);
  lightMarbleMap.colorSpace = THREE.SRGBColorSpace;

  // 2. Dark Square Texture (Deep Midnight Obsidian-Navy)
  const darkCanvas = document.createElement('canvas');
  darkCanvas.width = size;
  darkCanvas.height = size;
  const dCtx = darkCanvas.getContext('2d');

  const dGrad = dCtx.createLinearGradient(0, 0, size, size);
  dGrad.addColorStop(0, '#0f1c3a');
  dGrad.addColorStop(0.5, '#132347');
  dGrad.addColorStop(1, '#0b152c');
  dCtx.fillStyle = dGrad;
  dCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 16; i++) {
    const x = (Math.cos(i * 53.9) * 0.5 + 0.5) * size;
    const y = (Math.sin(i * 89.3) * 0.5 + 0.5) * size;
    const r = 55 + (i % 4) * 35;
    const g = dCtx.createRadialGradient(x, y, 4, x, y, r);
    g.addColorStop(0, 'rgba(38, 68, 128, 0.16)');
    g.addColorStop(1, 'rgba(10, 20, 44, 0.0)');
    dCtx.fillStyle = g;
    dCtx.fillRect(0, 0, size, size);
  }

  dCtx.strokeStyle = 'rgba(28, 52, 102, 0.35)';
  dCtx.lineWidth = 4;
  dCtx.strokeRect(2, 2, size - 4, size - 4);

  const darkMarbleMap = new THREE.CanvasTexture(darkCanvas);
  darkMarbleMap.colorSpace = THREE.SRGBColorSpace;

  return { lightMarbleMap, darkMarbleMap };
}

/**
 * Generates the Sapphire-Blue Nordic Rune Frame texture surrounding the chessboard
 * with double gold borders, crisp golden Elder Futhark runes along all 4 sides,
 * and glowing cyan-white arcane lightning veins.
 */
function createSapphireRuneBorderTextures() {
  const size = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const emCanvas = document.createElement('canvas');
  emCanvas.width = size;
  emCanvas.height = size;
  const emCtx = emCanvas.getContext('2d');
  emCtx.fillStyle = '#000000';
  emCtx.fillRect(0, 0, size, size);

  const bgGrad = ctx.createRadialGradient(size * 0.5, size * 0.5, size * 0.25, size * 0.5, size * 0.5, size * 0.72);
  bgGrad.addColorStop(0, '#1c3775');
  bgGrad.addColorStop(0.55, '#162c60');
  bgGrad.addColorStop(1, '#0e1e46');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  let seed = 303;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 120; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 35 + rand() * 95;
    const g = ctx.createRadialGradient(x, y, 4, x, y, r);
    g.addColorStop(0, rand() > 0.45 ? 'rgba(56, 104, 196, 0.14)' : 'rgba(8, 16, 38, 0.18)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const drawLightningVein = (x0, y0, x1, y1, steps, jitter, colorMain, colorGlow, width) => {
    const pts = [{ x: x0, y: y0 }];
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      pts.push({
        x: x0 + (x1 - x0) * t + (rand() - 0.5) * jitter,
        y: y0 + (y1 - y0) * t + (rand() - 0.5) * jitter
      });
    }
    pts.push({ x: x1, y: y1 });

    for (const targetCtx of [ctx, emCtx]) {
      targetCtx.save();
      targetCtx.strokeStyle = colorGlow;
      targetCtx.lineWidth = width * 3.0;
      targetCtx.lineCap = 'round';
      targetCtx.lineJoin = 'round';
      targetCtx.beginPath();
      targetCtx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) targetCtx.lineTo(pts[i].x, pts[i].y);
      targetCtx.stroke();

      targetCtx.strokeStyle = colorMain;
      targetCtx.lineWidth = width;
      targetCtx.beginPath();
      targetCtx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) targetCtx.lineTo(pts[i].x, pts[i].y);
      targetCtx.stroke();
      targetCtx.restore();
    }
  };

  for (let i = 0; i < 24; i++) {
    const isTop = i < 12;
    const xStart = 120 + rand() * (size - 240);
    const yStart = isTop ? (20 + rand() * 210) : (size - 230 + rand() * 210);
    drawLightningVein(
      xStart,
      yStart,
      xStart + (rand() - 0.5) * 220,
      yStart + (rand() - 0.5) * 180,
      8,
      26,
      'rgba(195, 240, 255, 0.85)',
      'rgba(80, 185, 255, 0.28)',
      2.2
    );
  }

  const drawGoldRect = (pad, lw) => {
    ctx.strokeStyle = '#e5c158';
    ctx.lineWidth = lw;
    ctx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);

    emCtx.strokeStyle = 'rgba(212, 165, 55, 0.42)';
    emCtx.lineWidth = lw;
    emCtx.strokeRect(pad, pad, size - pad * 2, size - pad * 2);
  };

  drawGoldRect(18, 8);
  drawGoldRect(38, 5);
  drawGoldRect(228, 6);
  drawGoldRect(244, 10);

  const drawRuneGlyph = (targetCtx, type, cx, cy, h, lw, color) => {
    targetCtx.save();
    targetCtx.strokeStyle = color;
    targetCtx.lineWidth = lw;
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';
    const w = h * 0.48;
    const top = cy - h * 0.5;
    const bot = cy + h * 0.5;
    const left = cx - w * 0.5;
    const right = cx + w * 0.5;

    targetCtx.beginPath();
    switch (type % 10) {
      case 0:
        targetCtx.moveTo(cx, bot);
        targetCtx.lineTo(cx, top);
        targetCtx.moveTo(left, top + h * 0.28);
        targetCtx.lineTo(cx, top);
        targetCtx.lineTo(right, top + h * 0.28);
        break;
      case 1:
        targetCtx.moveTo(left, bot);
        targetCtx.lineTo(right, top + h * 0.35);
        targetCtx.lineTo(cx, top);
        targetCtx.lineTo(left, top + h * 0.35);
        targetCtx.lineTo(right, bot);
        break;
      case 2:
        targetCtx.moveTo(left, bot);
        targetCtx.lineTo(left, top);
        targetCtx.moveTo(left, top + h * 0.22);
        targetCtx.lineTo(right, top);
        targetCtx.moveTo(left, cy);
        targetCtx.lineTo(right * 0.9 + left * 0.1, top + h * 0.28);
        break;
      case 3:
        targetCtx.moveTo(left, top);
        targetCtx.lineTo(left, bot);
        targetCtx.moveTo(right, top);
        targetCtx.lineTo(right, bot);
        targetCtx.moveTo(left, top + h * 0.35);
        targetCtx.lineTo(right, bot - h * 0.35);
        break;
      case 4:
        targetCtx.moveTo(left, top);
        targetCtx.lineTo(left, bot);
        targetCtx.lineTo(right, top);
        targetCtx.lineTo(right, bot);
        targetCtx.closePath();
        break;
      case 5:
        targetCtx.moveTo(right, top);
        targetCtx.lineTo(left, top + h * 0.36);
        targetCtx.lineTo(right, bot - h * 0.36);
        targetCtx.lineTo(left, bot);
        break;
      case 6:
        targetCtx.moveTo(left, top);
        targetCtx.lineTo(right, bot);
        targetCtx.moveTo(right, top);
        targetCtx.lineTo(left, bot);
        break;
      case 7:
        targetCtx.moveTo(cx, bot);
        targetCtx.lineTo(cx, top);
        targetCtx.moveTo(left, top + h * 0.12);
        targetCtx.lineTo(cx, cy - h * 0.05);
        targetCtx.lineTo(right, top + h * 0.12);
        break;
      case 8:
        targetCtx.moveTo(left, bot);
        targetCtx.lineTo(left, top);
        targetCtx.lineTo(right, cy);
        targetCtx.moveTo(right, bot);
        targetCtx.lineTo(right, top);
        targetCtx.lineTo(left, cy);
        break;
      default:
        targetCtx.moveTo(left, bot);
        targetCtx.lineTo(left, top);
        targetCtx.lineTo(right, top + h * 0.25);
        targetCtx.lineTo(left, cy);
        targetCtx.lineTo(right, bot);
        break;
    }
    targetCtx.stroke();
    targetCtx.restore();
  };

  const numRunes = 14;
  for (let i = 0; i < numRunes; i++) {
    const rx = 210 + (i / (numRunes - 1)) * (size - 420);
    drawRuneGlyph(ctx, i, rx, size - 134, 96, 9, 'rgba(255, 198, 70, 0.35)');
    drawRuneGlyph(ctx, i, rx, size - 134, 96, 5, '#f6d574');
    drawRuneGlyph(emCtx, i, rx, size - 134, 96, 6, 'rgba(245, 185, 55, 0.72)');

    drawRuneGlyph(ctx, (i + 5) % 10, rx, 134, 92, 9, 'rgba(255, 198, 70, 0.35)');
    drawRuneGlyph(ctx, (i + 5) % 10, rx, 134, 92, 5, '#f6d574');
    drawRuneGlyph(emCtx, (i + 5) % 10, rx, 134, 92, 6, 'rgba(245, 185, 55, 0.72)');
  }

  const numSideRunes = 10;
  for (let i = 0; i < numSideRunes; i++) {
    const ry = 310 + (i / (numSideRunes - 1)) * (size - 620);
    drawRuneGlyph(ctx, (i + 2) % 10, 134, ry, 76, 4.5, '#e8c45c');
    drawRuneGlyph(emCtx, (i + 2) % 10, 134, ry, 76, 5, 'rgba(235, 175, 50, 0.55)');

    drawRuneGlyph(ctx, (i + 7) % 10, size - 134, ry, 76, 4.5, '#e8c45c');
    drawRuneGlyph(emCtx, (i + 7) % 10, size - 134, ry, 76, 5, 'rgba(235, 175, 50, 0.55)');
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  const emissiveMap = new THREE.CanvasTexture(emCanvas);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;

  return { map, emissiveMap };
}

/**
 * Generates the Dark Obsidian-Teal Floor Texture with Glowing Cyan Arcane Lightning Veins
 * and Chiseled Square Stone Tile Joints.
 */
function createArcaneVeinedFloorTextures() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const emCanvas = document.createElement('canvas');
  emCanvas.width = size;
  emCanvas.height = size;
  const emCtx = emCanvas.getContext('2d');
  emCtx.fillStyle = '#000000';
  emCtx.fillRect(0, 0, size, size);

  const baseGrad = ctx.createLinearGradient(0, 0, size, size);
  baseGrad.addColorStop(0, '#0a1829');
  baseGrad.addColorStop(0.5, '#0e2238');
  baseGrad.addColorStop(1, '#081524');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  let seed = 909;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const gridN = 8;
  const tileW = size / gridN;
  for (let r = 0; r < gridN; r++) {
    for (let c = 0; c < gridN; c++) {
      const x = c * tileW;
      const y = r * tileW;
      const shade = (rand() - 0.5) * 14;
      ctx.fillStyle = `rgb(${Math.max(6, Math.round(13 + shade * 0.6))}, ${Math.max(18, Math.round(32 + shade))}, ${Math.max(32, Math.round(54 + shade * 1.3))})`;
      ctx.fillRect(x + 3, y + 3, tileW - 6, tileW - 6);

      ctx.strokeStyle = 'rgba(72, 165, 210, 0.14)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 4, y + 4, tileW - 8, tileW - 8);

      ctx.strokeStyle = '#040a12';
      ctx.lineWidth = 5;
      ctx.strokeRect(x, y, tileW, tileW);
    }
  }

  const drawBranchingVein = (x0, y0, angle, length, depth, width) => {
    if (depth <= 0 || length < 12) return;
    const steps = Math.max(5, Math.floor(length / 18));
    const pts = [{ x: x0, y: y0 }];
    let cx = x0;
    let cy = y0;
    let curAng = angle;

    for (let i = 1; i <= steps; i++) {
      curAng += (rand() - 0.5) * 0.65;
      const stepLen = length / steps;
      cx += Math.cos(curAng) * stepLen;
      cy += Math.sin(curAng) * stepLen;
      pts.push({ x: cx, y: cy });

      if (depth > 1 && rand() > 0.72) {
        const branchAng = curAng + (rand() > 0.5 ? 1 : -1) * (0.45 + rand() * 0.55);
        drawBranchingVein(cx, cy, branchAng, length * 0.55, depth - 1, width * 0.65);
      }
    }

    for (const targetCtx of [ctx, emCtx]) {
      targetCtx.save();
      targetCtx.lineCap = 'round';
      targetCtx.lineJoin = 'round';

      targetCtx.strokeStyle = targetCtx === ctx ? 'rgba(36, 168, 220, 0.24)' : 'rgba(28, 145, 200, 0.30)';
      targetCtx.lineWidth = width * 4.2;
      targetCtx.beginPath();
      targetCtx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) targetCtx.lineTo(pts[i].x, pts[i].y);
      targetCtx.stroke();

      targetCtx.strokeStyle = targetCtx === ctx ? 'rgba(195, 246, 255, 0.88)' : 'rgba(165, 238, 255, 0.82)';
      targetCtx.lineWidth = width * 0.85;
      targetCtx.beginPath();
      targetCtx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) targetCtx.lineTo(pts[i].x, pts[i].y);
      targetCtx.stroke();
      targetCtx.restore();
    }
  };

  for (let i = 0; i < 34; i++) {
    drawBranchingVein(rand() * size, rand() * size, rand() * Math.PI * 2, 95 + rand() * 180, 3, 1.6 + rand() * 1.1);
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const emissiveMap = new THREE.CanvasTexture(emCanvas);
  emissiveMap.colorSpace = THREE.SRGBColorSpace;
  emissiveMap.wrapS = THREE.RepeatWrapping;
  emissiveMap.wrapT = THREE.RepeatWrapping;

  return { map, emissiveMap };
}

/**
 * Generates the Glowing Cyan Arcane Magic Circle / Hexagram Sigil texture.
 */
function createArcaneMagicCircleTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size * 0.5;
  const cy = size * 0.5;

  const glow = ctx.createRadialGradient(cx, cy, size * 0.08, cx, cy, size * 0.48);
  glow.addColorStop(0, 'rgba(72, 195, 255, 0.24)');
  glow.addColorStop(0.65, 'rgba(45, 145, 235, 0.16)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  const drawGlowStroke = (drawFn) => {
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 175, 255, 0.45)';
    ctx.lineWidth = 8;
    drawFn();
    ctx.stroke();

    ctx.strokeStyle = '#dffaff';
    ctx.lineWidth = 2;
    drawFn();
    ctx.stroke();
    ctx.restore();
  };

  for (const r of [215, 196, 155, 146, 72]) {
    drawGlowStroke(() => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    });
  }

  for (let t = 0; t < 2; t++) {
    drawGlowStroke(() => {
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const ang = (i * Math.PI * 2) / 3 + (t * Math.PI) / 3 - Math.PI / 2;
        const x = cx + Math.cos(ang) * 155;
        const y = cy + Math.sin(ang) * 155;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Generates ornate Gold Filigree Leather Grimoire cover texture.
 */
function createGrimoireCoverTexture(baseHex, borderHex) {
  const w = 256;
  const h = 320;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = borderHex;
  ctx.lineWidth = 6;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.lineWidth = 2.5;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function build3DGrimoire({ coverColor, width = 0.72, height = 0.14, depth = 0.88, hasStrap = false }) {
  const group = new THREE.Group();
  const coverTex = createGrimoireCoverTexture(coverColor, '#dfb754');
  const coverMat = new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.42, metalness: 0.18 });
  const pageMat = new THREE.MeshStandardMaterial({ color: 0xe8dec3, roughness: 0.65, metalness: 0.02 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xe6be53, roughness: 0.22, metalness: 0.88 });

  const coverH = 0.022;
  const botCover = new THREE.Mesh(new THREE.BoxGeometry(width, coverH, depth), coverMat);
  botCover.position.y = coverH * 0.5;
  group.add(botCover);

  const pageBlockH = height - coverH * 2;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(width * 0.94, pageBlockH, depth * 0.95), pageMat);
  pages.position.set(width * 0.015, coverH + pageBlockH * 0.5, 0);
  group.add(pages);

  const topCover = new THREE.Mesh(new THREE.BoxGeometry(width, coverH, depth), coverMat);
  topCover.position.y = height - coverH * 0.5;
  group.add(topCover);

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.035, height, depth), coverMat);
  spine.position.set(-width * 0.5 + 0.012, height * 0.5, 0);
  group.add(spine);

  for (const zOff of [-depth * 0.26, depth * 0.26]) {
    const clasp = new THREE.Mesh(new THREE.BoxGeometry(0.045, height * 0.92, 0.055), goldMat);
    clasp.position.set(width * 0.5, height * 0.5, zOff);
    group.add(clasp);
  }

  if (hasStrap) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(width * 0.36, 0.018, 0.14), coverMat);
    strap.position.set(width * 0.34, height + 0.006, 0);
    group.add(strap);
  }
  return group;
}

/**
 * Generates Royal Crimson & Gold Crown Banner Texture for the Castle Towers.
 */
function createRoyalCrownBannerTexture() {
  const w = 256;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#5a0e18');
  grad.addColorStop(0.5, '#7a1422');
  grad.addColorStop(1, '#3d0810');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#e0b243';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  // Golden Crown Emblem in the center
  ctx.fillStyle = '#f2c955';
  ctx.beginPath();
  ctx.moveTo(w * 0.24, h * 0.50);
  ctx.lineTo(w * 0.20, h * 0.35);
  ctx.lineTo(w * 0.36, h * 0.43);
  ctx.lineTo(w * 0.50, h * 0.31);
  ctx.lineTo(w * 0.64, h * 0.43);
  ctx.lineTo(w * 0.80, h * 0.35);
  ctx.lineTo(w * 0.76, h * 0.50);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(w * 0.24, h * 0.52, w * 0.52, 16);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Builds the combined Arcane Sanctum Floor + Magical Floating Castle & Glowing Purple Portal Arena.
 */
export function buildFloatingCastleEnvironment(scene, renderer) {
  const envGroup = new THREE.Group();
  envGroup.name = 'WizardChessArenaRoot';
  scene.add(envGroup);

  const animatedUpdaters = [];

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xe5c158,
    emissive: 0x5a3e08,
    emissiveIntensity: 0.22,
    roughness: 0.20,
    metalness: 0.88
  });

  const darkStoneMat = new THREE.MeshStandardMaterial({
    color: 0x16243b,
    roughness: 0.42,
    metalness: 0.18
  });

  const castleStoneMat = new THREE.MeshStandardMaterial({
    color: 0x3b3d54,
    roughness: 0.68,
    metalness: 0.08
  });

  const darkBevelStoneMat = new THREE.MeshStandardMaterial({
    color: 0x0b1628,
    roughness: 0.28,
    metalness: 0.28
  });

  // =========================================================================
  // 1. Sapphire-Blue Nordic Rune Frame Surrounding the 8x8 Chessboard (y = 0.684)
  // =========================================================================
  const boardAltarGroup = new THREE.Group();
  boardAltarGroup.name = 'WizardChessBoardAltar';
  scene.add(boardAltarGroup);

  const { map: runeMap, emissiveMap: runeEmissiveMap } = createSapphireRuneBorderTextures();
  const runeBorderMat = new THREE.MeshStandardMaterial({
    map: runeMap,
    emissiveMap: runeEmissiveMap,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.85,
    roughness: 0.22,
    metalness: 0.26
  });

  const runeFrameWidth = 3.84;
  const runeFrameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(runeFrameWidth, 0.06, runeFrameWidth),
    runeBorderMat
  );
  runeFrameMesh.position.set(0, 0.684, 0);
  runeFrameMesh.receiveShadow = true;
  boardAltarGroup.add(runeFrameMesh);

  const outerRimHalf = runeFrameWidth * 0.5 + 0.018;
  const outerRimW = 0.036;
  const outerRimH = 0.068;
  for (const s of [-1, 1]) {
    const hRim = new THREE.Mesh(
      new THREE.BoxGeometry(outerRimHalf * 2 + outerRimW, outerRimH, outerRimW),
      goldMat
    );
    hRim.position.set(0, 0.686, s * outerRimHalf);
    boardAltarGroup.add(hRim);

    const vRim = new THREE.Mesh(
      new THREE.BoxGeometry(outerRimW, outerRimH, outerRimHalf * 2),
      goldMat
    );
    vRim.position.set(s * outerRimHalf, 0.686, 0);
    boardAltarGroup.add(vRim);
  }

  const altarPlinth = new THREE.Mesh(new THREE.BoxGeometry(4.02, 0.28, 4.02), darkStoneMat);
  altarPlinth.position.set(0, 0.52, 0);
  altarPlinth.receiveShadow = true;
  boardAltarGroup.add(altarPlinth);

  // =========================================================================
  // 2. Top & Bottom Captured-Piece Statuary Shelves & Recessed Alcoves
  // =========================================================================
  const miniWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf4efe2, roughness: 0.25, metalness: 0.10 });
  const miniBlackMat = new THREE.MeshStandardMaterial({ color: 0x1e2749, roughness: 0.22, metalness: 0.32 });

  function buildMiniStatue(isWhite, heightScale = 1.0) {
    const g = new THREE.Group();
    const pMat = isWhite ? miniWhiteMat : miniBlackMat;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.078, 0.045, 12), goldMat);
    base.position.y = 0.022;
    g.add(base);

    const bodyH = 0.14 * heightScale;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.062, bodyH, 12), pMat);
    body.position.y = 0.045 + bodyH * 0.5;
    g.add(body);

    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 10), goldMat);
    crown.position.y = 0.045 + bodyH + 0.025;
    g.add(crown);
    return g;
  }

  for (const side of [-1, 1]) {
    const isWhite = side < 0;
    const shelfX = side * 0.92;
    const shelfZ = -2.08;

    const shelfBase = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.08, 0.26), darkBevelStoneMat);
    shelfBase.position.set(shelfX, 0.62, shelfZ);
    envGroup.add(shelfBase);

    const goldBar = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.022, 0.032), goldMat);
    goldBar.position.set(shelfX, 0.665, shelfZ + 0.11);
    envGroup.add(goldBar);

    const heights = isWhite ? [1.1, 1.35, 0.85, 0.85] : [0.9, 1.15, 1.3, 0.9];
    for (let i = 0; i < 4; i++) {
      const statue = buildMiniStatue(isWhite, heights[i]);
      statue.position.set(shelfX - 0.27 + i * 0.18, 0.66, shelfZ);
      envGroup.add(statue);
    }
  }

  for (const side of [-1, 1]) {
    const isWhite = side < 0;
    const alcX = side * 1.32;
    const alcZ = 2.16;

    const outerBox = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.18, 0.46), darkStoneMat);
    outerBox.position.set(alcX, 0.56, alcZ);
    envGroup.add(outerBox);

    const innerPit = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.19, 0.34), darkBevelStoneMat);
    innerPit.position.set(alcX, 0.565, alcZ);
    envGroup.add(innerPit);

    const topGold = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.028, 0.036), goldMat);
    topGold.position.set(alcX, 0.655, alcZ - 0.21);
    envGroup.add(topGold);

    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 2; c++) {
        const st = buildMiniStatue(isWhite, 0.78);
        st.position.set(alcX - 0.13 + c * 0.26, 0.61, alcZ - 0.07 + r * 0.15);
        envGroup.add(st);
      }
    }
  }

  for (let s = 0; s < 3; s++) {
    const stepBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.62, 0.16 - s * 0.035, 0.15),
      s % 2 === 0 ? darkStoneMat : darkBevelStoneMat
    );
    stepBar.position.set(0, 0.54, 2.02 + s * 0.14);
    envGroup.add(stepBar);
  }

  // =========================================================================
  // 3. Dark Arcane Marble Floor with Glowing Cyan Lightning Veins & Props (y = 0.42)
  // =========================================================================
  const { map: floorMap, emissiveMap: floorEmMap } = createArcaneVeinedFloorTextures();
  floorMap.repeat.set(2.4, 2.4);
  floorEmMap.repeat.set(2.4, 2.4);

  const arcaneFloorMat = new THREE.MeshStandardMaterial({
    map: floorMap,
    emissiveMap: floorEmMap,
    emissive: new THREE.Color(0x5ce1ff),
    emissiveIntensity: 0.72,
    roughness: 0.26,
    metalness: 0.26
  });

  const mainFloorMesh = new THREE.Mesh(new THREE.BoxGeometry(12.0, 0.24, 11.5), arcaneFloorMat);
  mainFloorMesh.position.set(0, 0.30, -0.5);
  mainFloorMesh.receiveShadow = true;
  envGroup.add(mainFloorMesh);

  // Bottom-Center Glowing Cyan Arcane Magic Circle
  const magicCircleTex = createArcaneMagicCircleTexture();
  const magicCircleMat = new THREE.MeshBasicMaterial({
    map: magicCircleTex,
    transparent: true,
    opacity: 0.90,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const magicCircleMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 1.36), magicCircleMat);
  magicCircleMesh.rotation.x = -Math.PI / 2;
  magicCircleMesh.position.set(0, 0.428, 3.35);
  envGroup.add(magicCircleMesh);

  // Grimoire & Potion Props on the Sanctum Floor
  const botLeftGrimoire = build3DGrimoire({ coverColor: '#165a3c', width: 0.74, height: 0.14, depth: 0.88, hasStrap: true });
  botLeftGrimoire.position.set(-1.52, 0.42, 3.18);
  botLeftGrimoire.rotation.y = -0.55;
  envGroup.add(botLeftGrimoire);

  const botRightGrimoire = build3DGrimoire({ coverColor: '#1b3b78', width: 0.72, height: 0.14, depth: 0.86, hasStrap: false });
  botRightGrimoire.position.set(1.52, 0.42, 3.22);
  botRightGrimoire.rotation.y = 0.52;
  envGroup.add(botRightGrimoire);

  // =========================================================================
  // 4. Magical Fantasy Castle Gatehouse & Glowing Purple Portal (z = -4.25)
  // =========================================================================
  const castleGroup = new THREE.Group();
  castleGroup.position.set(0, 0.42, -4.35);
  envGroup.add(castleGroup);

  // Stepped dais leading up to the Portal Gatehouse
  for (let s = 0; s < 3; s++) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(3.8 - s * 0.3, 0.14, 1.2 - s * 0.25),
      castleStoneMat
    );
    step.position.set(0, 0.07 + s * 0.14, 0.55 - s * 0.22);
    step.receiveShadow = true;
    castleGroup.add(step);
  }

  // Left & Right Castle Gatehouse Pillars + Battlements
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 3.4, 1.25), castleStoneMat);
    pillar.position.set(side * 1.75, 1.70, 0);
    pillar.castShadow = true;
    pillar.receiveShadow = true;
    castleGroup.add(pillar);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.24, 1.42), darkStoneMat);
    cap.position.set(side * 1.75, 3.45, 0);
    castleGroup.add(cap);
  }

  // Upper Castle Arch Bridge above the Portal
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.95, 1.30), castleStoneMat);
  lintel.position.set(0, 3.25, 0);
  lintel.castShadow = true;
  castleGroup.add(lintel);

  // Sculpted Stone Archway Ring framing the Glowing Purple Portal
  const archTorus = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.18, 14, 32, Math.PI),
    goldMat
  );
  archTorus.position.set(0, 1.55, 0.35);
  castleGroup.add(archTorus);

  // Swirling Glowing Purple Magical Portal Vortex Shader
  const vortexMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        vec2 p = (vUv - 0.5) * 2.0;
        float r = length(p);
        if (r > 1.0) discard;
        float angle = atan(p.y, p.x);
        float swirl = sin(angle * 5.0 - r * 10.0 + uTime * 3.2) * 0.5 + 0.5;
        float spiral2 = cos(angle * 3.0 + r * 14.0 - uTime * 2.4) * 0.5 + 0.5;
        float core = smoothstep(0.95, 0.05, r);
        vec3 deepViolet = vec3(0.26, 0.04, 0.58);
        vec3 brightMagenta = vec3(0.76, 0.28, 1.0);
        vec3 arcaneWhite = vec3(0.96, 0.82, 1.0);
        vec3 col = mix(deepViolet, brightMagenta, swirl * 0.7 + spiral2 * 0.3);
        col = mix(col, arcaneWhite, pow(core, 2.2) * 0.78);
        float alpha = smoothstep(1.0, 0.82, r);
        gl_FragColor = vec4(col * 1.45, alpha * 0.96);
      }
    `
  });

  const portalDisc = new THREE.Mesh(new THREE.CircleGeometry(1.16, 40), vortexMat);
  portalDisc.position.set(0, 1.55, 0.32);
  castleGroup.add(portalDisc);

  // Royal Crimson & Gold Crown Banners Hanging on Left & Right Castle Towers
  const bannerTex = createRoyalCrownBannerTexture();
  const bannerMat = new THREE.MeshStandardMaterial({
    map: bannerTex,
    roughness: 0.55,
    metalness: 0.12,
    side: THREE.DoubleSide
  });
  for (const side of [-1, 1]) {
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 1.48), bannerMat);
    banner.position.set(side * 1.75, 2.05, 0.66);
    castleGroup.add(banner);
  }

  // =========================================================================
  // 5. Left & Right Glowing Purple Amethyst Crystals & Golden Fire Braziers
  // =========================================================================
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0xb548ff,
    emissive: 0x7b1fa2,
    emissiveIntensity: 1.25,
    roughness: 0.12,
    metalness: 0.18
  });

  for (const side of [-1, 1]) {
    const ped = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.62), darkStoneMat);
    ped.position.set(side * 2.55, 0.63, -1.65);
    envGroup.add(ped);

    for (let i = 0; i < 4; i++) {
      const shard = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.48 - i * 0.06, 6), crystalMat);
      shard.position.set(
        side * 2.55 + (i === 0 ? 0 : (i - 2) * 0.11),
        1.02,
        -1.65 + (i % 2 === 0 ? 0.05 : -0.06)
      );
      shard.rotation.z = (i - 1.5) * 0.18;
      envGroup.add(shard);
    }

    // Golden Fire Torches / Braziers flanking the Castle Courtyard
    const brazierPed = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.78, 0.56), castleStoneMat);
    brazierPed.position.set(side * 2.45, 0.81, -3.15);
    envGroup.add(brazierPed);

    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.16, 0.22, 14), goldMat);
    bowl.position.set(side * 2.45, 1.31, -3.15);
    envGroup.add(bowl);

    const flameCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.20, 0.46, 10),
      new THREE.MeshBasicMaterial({ color: 0xffa834 })
    );
    flameCone.position.set(side * 2.45, 1.58, -3.15);
    envGroup.add(flameCone);
  }

  // =========================================================================
  // 6. Surrounding Floating Sky Islands with Purple Crystals
  // =========================================================================
  const islandConfigs = [
    { x: -5.6, y: 1.8, z: -6.8, s: 1.15, phase: 0.0 },
    { x: 5.8,  y: 2.2, z: -6.5, s: 1.05, phase: 1.8 },
    { x: -4.2, y: 2.6, z: -10.5, s: 0.90, phase: 3.1 },
    { x: 4.5,  y: 2.5, z: -10.2, s: 0.95, phase: 4.5 }
  ];

  const floatingIslands = [];
  for (const cfg of islandConfigs) {
    const isl = new THREE.Group();
    isl.position.set(cfg.x, cfg.y, cfg.z);
    isl.scale.setScalar(cfg.s);

    const topDeck = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.35, 1.6), castleStoneMat);
    isl.add(topDeck);

    const midRock = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.55, 1.15), darkStoneMat);
    midRock.position.y = -0.45;
    isl.add(midRock);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.9, 6), darkStoneMat);
    spire.rotation.x = Math.PI;
    spire.position.y = -1.15;
    isl.add(spire);

    const islCrystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), crystalMat);
    islCrystal.position.y = 0.52;
    isl.add(islCrystal);

    envGroup.add(isl);
    floatingIslands.push({ group: isl, baseY: cfg.y, phase: cfg.phase });
  }

  // =========================================================================
  // 7. Dynamic Portal & Torch Lighting + Animation Loop
  // =========================================================================
  const portalLight = new THREE.PointLight(0xa855f7, 3.6, 18.0, 1.35);
  portalLight.position.set(0, 2.2, -3.5);
  envGroup.add(portalLight);

  animatedUpdaters.push((elapsedTotal) => {
    vortexMat.uniforms.uTime.value = elapsedTotal;
    magicCircleMat.opacity = 0.84 + Math.sin(elapsedTotal * 2.4) * 0.08;
    runeBorderMat.emissiveIntensity = 0.80 + Math.sin(elapsedTotal * 3.1) * 0.08;
    arcaneFloorMat.emissiveIntensity = 0.70 + Math.cos(elapsedTotal * 2.0) * 0.08;
    for (let i = 0; i < floatingIslands.length; i++) {
      const fi = floatingIslands[i];
      fi.group.position.y = fi.baseY + Math.sin(elapsedTotal * 1.2 + fi.phase) * 0.14;
    }
  });

  // =========================================================================
  // 8. Studio & Fantasy PMREM Reflection Map
  // =========================================================================
  function createSanctumPMREM(glRenderer) {
    const pmremGen = new THREE.PMREMGenerator(glRenderer);
    pmremGen.compileEquirectangularShader();
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0x161d3a);

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const addPanel = (colorHex, intensity, pos, scl) => {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorHex).multiplyScalar(intensity)
      });
      const m = new THREE.Mesh(boxGeo, mat);
      m.position.fromArray(pos);
      m.scale.fromArray(scl);
      envScene.add(m);
    };

    addPanel(0xdbeeff, 2.4, [0, 12.0, 0.0], [18.0, 1.5, 18.0]);
    addPanel(0xb554ff, 4.2, [0, 3.5, -8.0], [6.5, 4.5, 1.5]);
    addPanel(0xffaa33, 3.6, [-4.0, 3.0, -4.0], [3.5, 2.5, 3.5]);
    addPanel(0x48cae4, 3.0, [4.0, 3.0, 4.0], [5.0, 2.5, 5.0]);

    const envTex = pmremGen.fromScene(envScene, 0.035).texture;
    boxGeo.dispose();
    pmremGen.dispose();
    return envTex;
  }

  scene.environment = createSanctumPMREM(renderer);
  if ('environmentIntensity' in scene) {
    scene.environmentIntensity = 0.82;
  }

  scene.background = new THREE.Color(0x0c1428);
  scene.fog = new THREE.FogExp2(0x121936, 0.018);

  return {
    group: envGroup,
    boardAltarGroup,
    portalLight,
    vortexMat,
    setFacingSide: (sideColor) => {
      envGroup.rotation.y = sideColor === 'b' ? Math.PI : 0;
    },
    setFacingAngle: (angleRad) => {
      envGroup.rotation.y = angleRad;
    },
    update: (elapsedTotal, dt) => {
      for (let i = 0; i < animatedUpdaters.length; i++) {
        animatedUpdaters[i](elapsedTotal, dt);
      }
    }
  };
}
