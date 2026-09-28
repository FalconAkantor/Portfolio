import { networkLayouts, type NetworkEdge, type NetworkNode } from '../data/network';

export type LayoutName = keyof typeof networkLayouts;

const r = (n: number) => Math.round(n * 10) / 10;

/**
 * Cubic Bézier path between two nodes, anchored on the sides that face each other.
 * Observability links get their own routing so they never cut through other nodes.
 */
export function edgePath(edge: NetworkEdge, from: NetworkNode, to: NetworkNode, layout: LayoutName): string {
  const { nodeWidth, nodeHeight: h, width } = networkLayouts[layout];
  const wa = nodeWidthFor(from, layout, nodeWidth);
  const wb = nodeWidthFor(to, layout, nodeWidth);
  const a = from[layout];
  const b = to[layout];
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  // Tall layout: the monitoring → AI link goes around the right-hand side.
  if (layout === 'tall' && edge.kind === 'watch' && Math.abs(dy) > 200) {
    const sx = a.x + wa / 2;
    const tx = b.x + wb / 2;
    const bulge = width - 6;
    return `M${r(sx)},${r(a.y)} C${bulge},${r(a.y)} ${bulge},${r(b.y)} ${r(tx)},${r(b.y)}`;
  }

  const vertical = layout === 'wide' && edge.kind === 'watch' ? true : Math.abs(dy) > Math.abs(dx);

  if (vertical) {
    const sy = a.y + Math.sign(dy) * (h / 2);
    const ty = b.y - Math.sign(dy) * (h / 2);
    const my = (sy + ty) / 2;
    return `M${r(a.x)},${r(sy)} C${r(a.x)},${r(my)} ${r(b.x)},${r(my)} ${r(b.x)},${r(ty)}`;
  }
  const sx = a.x + Math.sign(dx) * (wa / 2);
  const tx = b.x - Math.sign(dx) * (wb / 2);
  const mx = (sx + tx) / 2;
  return `M${r(sx)},${r(a.y)} C${r(mx)},${r(a.y)} ${r(mx)},${r(b.y)} ${r(tx)},${r(b.y)}`;
}

export function nodeWidthFor(node: NetworkNode, layout: LayoutName, fallback: number = networkLayouts[layout].nodeWidth): number {
  return node.width?.[layout] ?? fallback;
}
