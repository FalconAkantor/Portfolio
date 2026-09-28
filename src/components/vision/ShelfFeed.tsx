import { useI18n } from '../../i18n/context';

const COLS = 6;
const ROWS = 3;
const SWATCHES = ['#5cc8d6', '#f2a93b', '#8d99a6', '#52d18e'];
/** Index of the slot that is expected but not found in the illustration. */
const MISSING = 9;

/** Abstract shelf photo: boxes detected one by one, codes and colours read, one gap flagged. */
export function ShelfFeed() {
  const { t } = useI18n();
  const slots = Array.from({ length: COLS * ROWS }, (_, i) => i);

  return (
    <svg className="feed__svg" viewBox="0 0 480 290" aria-hidden="true">
      <rect width="480" height="290" fill="#0a0e13" />
      {[0, 1, 2].map((r) => (
        <rect key={r} x="24" y={98 + r * 72} width="432" height="4" className="shelf__plank" />
      ))}
      {slots.map((i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = 36 + col * 70;
        const y = 44 + row * 72;
        const colour = SWATCHES[(i * 7) % SWATCHES.length];
        if (i === MISSING) {
          return (
            <g key={i} className="shelf__slot shelf__slot--missing" style={{ ['--i' as string]: i }}>
              <rect x={x} y={y} width="54" height="54" className="shelf__gap" />
              <text x={x + 27} y={y + 31} textAnchor="middle" className="shelf__gap-label">
                ?
              </text>
            </g>
          );
        }
        return (
          <g key={i} className="shelf__slot" style={{ ['--i' as string]: i }}>
            <rect x={x + 4} y={y + 4} width="46" height="50" rx="2" className="shelf__box" />
            <rect x={x + 10} y={y + 12} width="16" height="4" fill={colour} />
            <g className="shelf__code">
              {[0, 1, 2, 3, 4, 5, 6].map((b) => (
                <rect key={b} x={x + 10 + b * 4} y={y + 36} width={b % 3 === 0 ? 2 : 1} height="10" />
              ))}
            </g>
            <rect x={x} y={y} width="54" height="58" className="det det--shelf" />
          </g>
        );
      })}
      <g className="feed__hud">
        <circle cx="20" cy="20" r="4" className="feed__wa" />
        <text x="30" y="26">whatsapp · photo received</text>
        <text x="460" y="24" textAnchor="end">
          {t.vision.box} · code · colour
        </text>
        <text x="24" y="266">detected vs expected stock</text>
        <path d="M12 40 V12 H40 M440 12 H468 V40 M12 250 V278 H40 M440 278 H468 V250" className="feed__corners" />
      </g>
    </svg>
  );
}
