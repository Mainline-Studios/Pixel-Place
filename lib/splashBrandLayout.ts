/**
 * Single source of truth for splash brand geometry (HTML overlay + canvas morph targets).
 * Values mirror StartupSplashAnimation CSS (rem = 16px, clamp formulas).
 */

const REM = 16;

function clamp3(min: number, preferred: number, max: number): number {
  return Math.max(min, Math.min(preferred, max));
}

export type MainlineBrandLayout = {
  cx: number;
  cy: number;
  stackTop: number;
  stackHeight: number;
  markSize: number;
  markCy: number;
  titleFontPx: number;
  titleMarginTop: number;
  titleY: number;
  titleLetterSpacingEm: number;
  presentsFontPx: number;
  presentsMarginTop: number;
  presentsY: number;
  presentsLetterSpacingEm: number;
};

export type PixelBrandLayout = {
  cx: number;
  cy: number;
  stackTop: number;
  stackHeight: number;
  logoSize: number;
  logoTop: number;
  logoCy: number;
  logoRadius: number;
  titleFontPx: number;
  titleMarginTop: number;
  titleY: number;
  titleLetterSpacingEm: number;
};

/** Match on-screen overlay scale (compact — dots morph to this size). */
export const MAINLINE_MARK_SIZE = 96;
export const PIXEL_LOGO_SIZE = 108;
export const PIXEL_LOGO_RADIUS = 16;

export function computeMainlineBrandLayout(viewW: number, viewH: number): MainlineBrandLayout {
  const cx = viewW / 2;
  const markSize = MAINLINE_MARK_SIZE;
  const titleFontPx = clamp3(REM * 0.8, viewW * 0.024, REM * 1.15);
  const presentsFontPx = clamp3(REM * 0.68, viewW * 0.018, REM * 0.95);
  const titleMarginTop = REM * 0.75;
  const presentsMarginTop = REM * 0.45;
  const titleLine = titleFontPx * 1.15;
  const presentsLine = presentsFontPx * 1.15;

  const stackHeight = markSize + titleMarginTop + titleLine + presentsMarginTop + presentsLine;
  const stackTop = viewH / 2 - stackHeight / 2;
  const markCy = stackTop + markSize / 2;
  const titleY = stackTop + markSize + titleMarginTop + titleLine / 2;
  const presentsY = stackTop + markSize + titleMarginTop + titleLine + presentsMarginTop + presentsLine / 2;

  return {
    cx,
    cy: viewH / 2,
    stackTop,
    stackHeight,
    markSize,
    markCy,
    titleFontPx,
    titleMarginTop,
    titleY,
    titleLetterSpacingEm: 0.28,
    presentsFontPx,
    presentsMarginTop,
    presentsY,
    presentsLetterSpacingEm: 0.42,
  };
}

export function computePixelBrandLayout(viewW: number, viewH: number): PixelBrandLayout {
  const cx = viewW / 2;
  const logoSize = PIXEL_LOGO_SIZE;
  const titleFontPx = clamp3(REM * 1.35, viewW * 0.042, REM * 2.1);
  const titleMarginTop = REM * 0.85;
  const titleLine = titleFontPx * 1.1;
  const stackHeight = logoSize + titleMarginTop + titleLine;
  const stackTop = viewH / 2 - stackHeight / 2;
  const logoTop = stackTop;
  const logoCy = logoTop + logoSize / 2;
  const titleY = logoTop + logoSize + titleMarginTop + titleLine / 2;

  return {
    cx,
    cy: viewH / 2,
    stackTop,
    stackHeight,
    logoSize,
    logoTop,
    logoCy,
    logoRadius: PIXEL_LOGO_RADIUS,
    titleFontPx,
    titleMarginTop,
    titleY,
    titleLetterSpacingEm: 0.14,
  };
}

/** Match MainlineBrandMark SVG viewBox (0 0 100 100). */
export function drawMainlineMarkSvgAccurate(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number
): void {
  const s = size / 100;
  const left = cx - size / 2;
  const top = cy - size / 2;

  const stroke = () => {
    ctx.strokeStyle = '#5eb0f7';
    ctx.lineWidth = 3 * s;
    ctx.stroke();
  };

  ctx.beginPath();
  const ox = left + 10 * s;
  const oy = top + 10 * s;
  const ow = 80 * s;
  const oh = 80 * s;
  const orx = 10 * s;
  ctx.moveTo(ox + orx, oy);
  ctx.lineTo(ox + ow - orx, oy);
  ctx.quadraticCurveTo(ox + ow, oy, ox + ow, oy + orx);
  ctx.lineTo(ox + ow, oy + oh - orx);
  ctx.quadraticCurveTo(ox + ow, oy + oh, ox + ow - orx, oy + oh);
  ctx.lineTo(ox + orx, oy + oh);
  ctx.quadraticCurveTo(ox, oy + oh, ox, oy + oh - orx);
  ctx.lineTo(ox, oy + orx);
  ctx.quadraticCurveTo(ox, oy, ox + orx, oy);
  ctx.closePath();
  stroke();

  ctx.beginPath();
  const ix = left + 25 * s;
  const iy = top + 25 * s;
  const iw = 50 * s;
  const ih = 50 * s;
  const irx = 5 * s;
  ctx.moveTo(ix + irx, iy);
  ctx.lineTo(ix + iw - irx, iy);
  ctx.quadraticCurveTo(ix + iw, iy, ix + iw, iy + irx);
  ctx.lineTo(ix + iw, iy + ih - irx);
  ctx.quadraticCurveTo(ix + iw, iy + ih, ix + iw - irx, iy + ih);
  ctx.lineTo(ix + irx, iy + ih);
  ctx.quadraticCurveTo(ix, iy + ih, ix, iy + ih - irx);
  ctx.lineTo(ix, iy + irx);
  ctx.quadraticCurveTo(ix, iy, ix + irx, iy);
  ctx.closePath();
  ctx.fillStyle = '#2b6cb0';
  ctx.fill();
}

export function setCanvasBrandText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fontPx: number,
  weight: number,
  letterSpacingEm: number,
  fill: string
): void {
  ctx.save();
  ctx.font = `${weight} ${fontPx}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = fill;
  if ('letterSpacing' in ctx) {
    (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${letterSpacingEm}em`;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}
