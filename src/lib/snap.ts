import { prefersReducedMotion } from './motion';

/**
 * Dust engine — the "snap": elements disintegrate into particles that blow away
 * (or gather back together), without libraries and without screenshots.
 *
 * How it works:
 *  1. The elements are repainted onto a canvas (boxes, borders, text, images),
 *     reading their computed styles — the copy sits exactly on top of the page.
 *  2. The real elements fade out underneath (class `is-snapped`).
 *  3. The copy is sampled into particles. A sweep with some noise decides when each
 *     grain lets go: its cell is erased from the copy and it drifts off with the wind.
 * Reversed ('in'), the grains fly back and the copy is rebuilt cell by cell.
 */

export const SNAPPED = 'is-snapped';

export interface SnapOptions {
  /** 'out' disintegrates the elements; 'in' gathers them back (they must be snapped). */
  direction?: 'out' | 'in';
  /** Total length of the effect, ms. */
  duration?: number;
  /** Direction the dust blows to. */
  wind?: { x: number; y: number };
}

const MAX_PARTICLES = 60_000;
const LIFE_MIN = 0.55;
const LIFE_MAX = 1.05;

export function canSnap(): boolean {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  const probe = document.createElement('canvas');
  return Boolean(probe.getContext && probe.getContext('2d'));
}

/** Nearest keyword for a computed font-stretch percentage (canvas only takes keywords). */
export function stretchKeyword(value: string): string {
  const pct = parseFloat(value);
  if (!Number.isFinite(pct)) return 'normal';
  const scale: [number, string][] = [
    [50, 'ultra-condensed'],
    [62.5, 'extra-condensed'],
    [75, 'condensed'],
    [87.5, 'semi-condensed'],
    [100, 'normal'],
    [112.5, 'semi-expanded'],
    [125, 'expanded'],
    [150, 'extra-expanded'],
    [200, 'ultra-expanded'],
  ];
  return scale.reduce((best, cur) => (Math.abs(cur[0] - pct) < Math.abs(best[0] - pct) ? cur : best))[1];
}

export function applyTextTransform(text: string, transform: string): string {
  if (transform === 'uppercase') return text.toUpperCase();
  if (transform === 'lowercase') return text.toLowerCase();
  return text;
}

const isClear = (color: string) => !color || color === 'transparent' || /rgba\(.*,\s*0\)$/.test(color) || /\/\s*0\)$/.test(color);

// ── 1. Repaint ───────────────────────────────────────────────────────────────
function paintBox(ctx: CanvasRenderingContext2D, style: CSSStyleDeclaration, r: DOMRect) {
  if (!isClear(style.backgroundColor)) {
    ctx.fillStyle = style.backgroundColor;
    const radius = Math.min(parseFloat(style.borderTopLeftRadius) || 0, r.width / 2, r.height / 2);
    ctx.beginPath();
    if (radius > 0 && ctx.roundRect) ctx.roundRect(r.left, r.top, r.width, r.height, radius);
    else ctx.rect(r.left, r.top, r.width, r.height);
    ctx.fill();
  }
  const bt = parseFloat(style.borderTopWidth) || 0;
  const bb = parseFloat(style.borderBottomWidth) || 0;
  const bl = parseFloat(style.borderLeftWidth) || 0;
  const br = parseFloat(style.borderRightWidth) || 0;
  const side = (width: number, color: string, x: number, y: number, w: number, h: number) => {
    if (!width || isClear(color)) return;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  side(bt, style.borderTopColor, r.left, r.top, r.width, bt);
  side(bb, style.borderBottomColor, r.left, r.bottom - bb, r.width, bb);
  side(bl, style.borderLeftColor, r.left, r.top, bl, r.height);
  side(br, style.borderRightColor, r.right - br, r.top, br, r.height);
}

function paintText(ctx: CanvasRenderingContext2D, node: Text, style: CSSStyleDeclaration, range: Range) {
  const fill = style.color;
  const strokeWidth = parseFloat(style.getPropertyValue('-webkit-text-stroke-width')) || 0;
  const strokeColor = style.getPropertyValue('-webkit-text-stroke-color');
  if (isClear(fill) && (!strokeWidth || isClear(strokeColor))) return;

  ctx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  if ('fontStretch' in ctx) ctx.fontStretch = stretchKeyword(style.fontStretch) as CanvasFontStretch;
  if ('letterSpacing' in ctx) ctx.letterSpacing = style.letterSpacing === 'normal' ? '0px' : style.letterSpacing;
  ctx.textBaseline = 'alphabetic';

  const words = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = words.exec(node.data))) {
    range.setStart(node, match.index);
    range.setEnd(node, match.index + match[0].length);
    const rects = range.getClientRects();
    const r = rects[0];
    if (!r || r.width === 0 || r.bottom < 0 || r.top > window.innerHeight) continue;
    const word = applyTextTransform(match[0], style.textTransform);
    const metrics = ctx.measureText(word);
    const scaleX = metrics.width > 0 ? Math.min(2, Math.max(0.5, r.width / metrics.width)) : 1;
    const ascent = metrics.fontBoundingBoxAscent ?? r.height * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? r.height * 0.2;
    const baseline = r.top + (r.height - (ascent + descent)) / 2 + ascent;
    ctx.save();
    ctx.translate(r.left, baseline);
    ctx.scale(scaleX, 1);
    if (!isClear(fill)) {
      ctx.fillStyle = fill;
      ctx.fillText(word, 0, 0);
    }
    if (strokeWidth && !isClear(strokeColor)) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.strokeText(word, 0, 0);
    }
    ctx.restore();
  }
}

function paintTree(ctx: CanvasRenderingContext2D, el: Element, alpha: number, isRoot: boolean, range: Range) {
  const style = getComputedStyle(el);
  if (style.display === 'none') return;
  const r = el.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) {
    if (style.overflow !== 'visible') return;
  }
  // The snapped root is faded out on purpose; paint it as it looked.
  const a = isRoot ? alpha : alpha * (parseFloat(style.opacity) || 0);
  if (a <= 0.02) return;
  ctx.globalAlpha = a;

  const visible = style.visibility !== 'hidden';
  if (visible) {
    if (el instanceof HTMLCanvasElement || el instanceof HTMLImageElement) {
      try {
        ctx.drawImage(el, r.left, r.top, r.width, r.height);
      } catch {
        /* tainted or not ready: skip */
      }
      return;
    }
    if (el instanceof SVGElement) return;
    paintBox(ctx, style, r);
  }

  // Respect clipping (overflow, visually hidden text) so nothing hidden shows up as dust.
  const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible';
  if (clips) {
    if (r.width <= 1 || r.height <= 1) return;
    ctx.save();
    ctx.beginPath();
    ctx.rect(r.left, r.top, r.width, r.height);
    ctx.clip();
  }

  for (const child of el.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (visible && (child as Text).data.trim()) {
        ctx.globalAlpha = a;
        paintText(ctx, child as Text, style, range);
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      paintTree(ctx, child as Element, a, false, range);
    }
  }
  if (clips) ctx.restore();
}

// ── 2. Particles ─────────────────────────────────────────────────────────────
interface Dust {
  count: number;
  ox: Float32Array;
  oy: Float32Array;
  cell: Int32Array; // index of the source cell (device px) for erase / restore
  rgba: Uint32Array;
  delay: Float32Array;
  life: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  phase: Float32Array;
  done: Uint8Array;
}

const INK = 10;

/** Byte offset of the most opaque pixel in a step × step cell. */
function inkiest(data: Uint8ClampedArray, width: number, height: number, x0: number, y0: number, step: number): number {
  let best = (y0 * width + x0) * 4;
  if (step === 1) return best;
  for (let y = y0; y < Math.min(height, y0 + step); y++) {
    for (let x = x0; x < Math.min(width, x0 + step); x++) {
      const o = (y * width + x) * 4;
      if (data[o + 3]! > data[best + 3]!) best = o;
    }
  }
  return best;
}

function sampleDust(
  src: ImageData,
  box: { x: number; y: number },
  dpr: number,
  sweep: number,
  wind: { x: number; y: number },
  bounds: { left: number; width: number; top: number; height: number },
): { dust: Dust; step: number } {
  const { data, width, height } = src;
  let step = Math.max(1, Math.round(dpr * 1.25));
  let ink: number;
  for (;;) {
    ink = 0;
    for (let y = 0; y < height; y += step) for (let x = 0; x < width; x += step) if (data[inkiest(data, width, height, x, y, step) + 3]! > INK) ink++;
    if (ink <= MAX_PARTICLES) break;
    step++;
  }

  const dust: Dust = {
    count: ink,
    ox: new Float32Array(ink),
    oy: new Float32Array(ink),
    cell: new Int32Array(ink * 2),
    rgba: new Uint32Array(ink),
    delay: new Float32Array(ink),
    life: new Float32Array(ink),
    vx: new Float32Array(ink),
    vy: new Float32Array(ink),
    phase: new Float32Array(ink),
    done: new Uint8Array(ink),
  };

  // Coarse random field so the dust lets go in clumps, like ash.
  const clump = new Map<number, number>();
  const clumpAt = (cx: number, cy: number) => {
    const key = cx * 7919 + cy;
    let v = clump.get(key);
    if (v === undefined) clump.set(key, (v = Math.random()));
    return v;
  };

  const windLen = Math.hypot(wind.x, wind.y) || 1;
  const wx = wind.x / windLen;
  const wy = wind.y / windLen;
  let i = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      // Each grain carries its whole cell, so no faint edges are left behind.
      const p = inkiest(data, width, height, x, y, step);
      const alpha = data[p + 3]!;
      if (alpha <= INK) continue;
      const cssX = (box.x + x) / dpr;
      const cssY = (box.y + y) / dpr;
      dust.ox[i] = cssX;
      dust.oy[i] = cssY;
      dust.cell[i * 2] = x;
      dust.cell[i * 2 + 1] = y;
      // Little-endian ABGR for a Uint32 view over RGBA bytes.
      dust.rgba[i] = ((alpha << 24) | (data[p + 2]! << 16) | (data[p + 1]! << 8) | data[p]!) >>> 0;
      // The sweep follows the wind: grains upwind go first.
      const along = ((cssX - bounds.left) / Math.max(1, bounds.width)) * wx + ((cssY - bounds.top) / Math.max(1, bounds.height)) * wy;
      const sweepPos = wx >= 0 ? along : 1 + along;
      dust.delay[i] = Math.max(0, sweepPos) * sweep * 0.7 + clumpAt(Math.floor(cssX / 18), Math.floor(cssY / 18)) * sweep * 0.3 + Math.random() * 0.06;
      dust.life[i] = LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN);
      const speed = 60 + Math.random() * 170;
      const spread = (Math.random() - 0.5) * 1.1;
      dust.vx[i] = (wx * Math.cos(spread) - wy * Math.sin(spread)) * speed;
      dust.vy[i] = (wx * Math.sin(spread) + wy * Math.cos(spread)) * speed - 25 - Math.random() * 45;
      dust.phase[i] = Math.random() * Math.PI * 2;
      i++;
    }
  }
  return { dust, step };
}

// ── 3. Run ───────────────────────────────────────────────────────────────────
function layer(width: number, height: number, cssW: number, cssH: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  c.setAttribute('aria-hidden', 'true');
  Object.assign(c.style, {
    position: 'fixed',
    inset: '0',
    width: `${cssW}px`,
    height: `${cssH}px`,
    zIndex: '500',
    pointerEvents: 'none',
  });
  return c;
}

/**
 * Disintegrate (or rebuild) elements. Resolves when the effect ends.
 * Without canvas or with reduced motion it just hides / shows them.
 */
export function snap(targets: Element[], options: SnapOptions = {}): Promise<void> {
  const { direction = 'out', duration = 1500, wind = { x: 1, y: -0.35 } } = options;
  const elements = targets.filter((el) => el.isConnected);
  if (elements.length === 0) return Promise.resolve();
  if (!canSnap()) {
    elements.forEach((el) => el.classList.toggle(SNAPPED, direction === 'out'));
    return Promise.resolve();
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Visible bounds of everything that turns to dust.
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const el of elements) {
    const r = el.getBoundingClientRect();
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  left = Math.max(0, Math.floor(left) - 4);
  top = Math.max(0, Math.floor(top) - 4);
  right = Math.min(vw, Math.ceil(right) + 4);
  bottom = Math.min(vh, Math.ceil(bottom) + 4);
  if (right <= left || bottom <= top) {
    elements.forEach((el) => el.classList.toggle(SNAPPED, direction === 'out'));
    return Promise.resolve();
  }

  // 1. Repaint the elements onto the source canvas (full viewport, device pixels).
  const source = document.createElement('canvas');
  source.width = Math.round(vw * dpr);
  source.height = Math.round(vh * dpr);
  const sctx = source.getContext('2d', { willReadFrequently: true });
  if (!sctx) return Promise.resolve();
  sctx.scale(dpr, dpr);
  const range = document.createRange();
  for (const el of elements) paintTree(sctx, el, 1, true, range);
  sctx.setTransform(1, 0, 0, 1, 0, 0);
  sctx.globalAlpha = 1;

  const box = { x: Math.round(left * dpr), y: Math.round(top * dpr), w: Math.round((right - left) * dpr), h: Math.round((bottom - top) * dpr) };
  const pixels = sctx.getImageData(box.x, box.y, box.w, box.h);
  const sweep = Math.max(0.2, duration / 1000 - LIFE_MAX);
  const { dust, step } = sampleDust(pixels, box, dpr, sweep, wind, { left, top, width: right - left, height: bottom - top });

  // Layer A: the static copy, eroded (or rebuilt) cell by cell. Layer B: flying dust, 1 css px each.
  const staticLayer = layer(source.width, source.height, vw, vh);
  const actx = staticLayer.getContext('2d')!;
  const dustLayer = layer(vw, vh, vw, vh);
  const bctx = dustLayer.getContext('2d')!;
  const frame = bctx.createImageData(vw, vh);
  const buf = new Uint32Array(frame.data.buffer);

  if (direction === 'out') actx.drawImage(source, 0, 0);
  document.body.append(staticLayer, dustLayer);
  elements.forEach((el) => el.classList.add(SNAPPED));

  const total = sweep + 0.06 + LIFE_MAX;
  const start = performance.now();

  return new Promise((resolve) => {
    const finish = () => {
      if (direction === 'in') {
        elements.forEach((el) => el.classList.remove(SNAPPED));
        // Let the real elements fade back in under the rebuilt copy, then drop it.
        window.setTimeout(() => {
          staticLayer.remove();
          dustLayer.remove();
          resolve();
        }, 220);
      } else {
        staticLayer.remove();
        dustLayer.remove();
        resolve();
      }
    };

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      buf.fill(0);
      for (let i = 0; i < dust.count; i++) {
        // Out: time runs forward. In: the same film, played backwards.
        const tau = direction === 'out' ? t - dust.delay[i]! : total - t - dust.delay[i]!;
        const life = dust.life[i]!;
        if (tau <= 0) {
          if (direction === 'in' && !dust.done[i]) {
            dust.done[i] = 1;
            const cx = box.x + dust.cell[i * 2]!;
            const cy = box.y + dust.cell[i * 2 + 1]!;
            actx.drawImage(source, cx, cy, step, step, cx, cy, step, step);
          }
          continue;
        }
        if (direction === 'out' && !dust.done[i]) {
          dust.done[i] = 1;
          actx.clearRect(box.x + dust.cell[i * 2]!, box.y + dust.cell[i * 2 + 1]!, step, step);
        }
        if (tau >= life) continue;
        const p = tau / life;
        const drift = tau * tau * 90;
        const x = dust.ox[i]! + dust.vx[i]! * tau + drift * Math.sign(wind.x || 1) + Math.sin(dust.phase[i]! + tau * 7) * 10 * p;
        const y = dust.oy[i]! + dust.vy[i]! * tau - drift * 0.35 + Math.cos(dust.phase[i]! + tau * 5) * 6 * p;
        const ix = x | 0;
        const iy = y | 0;
        if (ix < 0 || iy < 0 || ix >= vw || iy >= vh) continue;
        const a = (((dust.rgba[i]! >>> 24) * (1 - p) * (1 - p)) | 0) & 0xff;
        const px = ((a << 24) | (dust.rgba[i]! & 0x00ffffff)) >>> 0;
        const at = iy * vw + ix;
        buf[at] = px;
        // Fresh grains are coarser clumps; they crumble to fine dust as they fly.
        if (p < 0.4 && ix + 1 < vw && iy + 1 < vh) {
          buf[at + 1] = px;
          buf[at + vw] = px;
          buf[at + vw + 1] = px;
        }
      }
      bctx.putImageData(frame, 0, 0);
      if (t < total) requestAnimationFrame(tick);
      else {
        if (direction === 'in') {
          actx.clearRect(0, 0, staticLayer.width, staticLayer.height);
          actx.drawImage(source, 0, 0);
        }
        finish();
      }
    };
    requestAnimationFrame(tick);
  });
}

/** Leaf-ish blocks inside the roots that are on screen: small enough to look good as dust. */
export function visibleBlocks(roots: (Element | null)[], exclude: string[] = []): HTMLElement[] {
  const out: HTMLElement[] = [];
  const vh = window.innerHeight;
  const skip = exclude.join(',');
  const visit = (el: Element) => {
    if (!(el instanceof HTMLElement) || (skip && el.matches(skip))) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > vh) return;
    const children = [...el.children];
    if (r.height > vh * 0.4 && children.length) children.forEach(visit);
    else out.push(el);
  };
  roots.forEach((root) => root && visit(root));
  return out;
}

/** Terminal easter egg: half of what is on screen turns to dust, then comes back. */
export async function balance(): Promise<void> {
  const blocks = visibleBlocks([document.querySelector('main'), document.querySelector('.rail')], ['.hero__terminal', '.term-drawer']);
  const half = blocks
    .map((el) => ({ el, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, Math.ceil(blocks.length / 2))
    .map((x) => x.el);
  await snap(half, { duration: 2600 });
  await new Promise((r) => window.setTimeout(r, 1200));
  await snap(half, { direction: 'in', duration: 2000 });
}
