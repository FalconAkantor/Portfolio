import { useI18n } from '../../i18n/context';
import { useSessionClock } from '../../hooks/useSessionClock';
import { formatClock, formatDate } from '../../lib/format';

/** Abstract CCTV frame: perspective floor, two walking figures, YOLO-style boxes. */
export function CctvFeed() {
  const { t } = useI18n();
  const now = useSessionClock();
  const floor = Array.from({ length: 9 }, (_, i) => i);

  return (
    <svg className="feed__svg" viewBox="0 0 480 290" aria-hidden="true">
      <defs>
        <linearGradient id="cctv-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c1117" />
          <stop offset="1" stopColor="#06080b" />
        </linearGradient>
      </defs>
      <rect width="480" height="290" fill="url(#cctv-fade)" />
      {/* Floor grid converging on a vanishing point */}
      <g className="feed__floor">
        {floor.map((i) => (
          <line key={`v${i}`} x1={240} y1={110} x2={-120 + i * 90} y2={290} />
        ))}
        {[130, 160, 200, 250].map((y) => (
          <line key={`h${y}`} x1={0} y1={y} x2={480} y2={y} />
        ))}
        <line x1={0} y1={110} x2={480} y2={110} className="feed__horizon" />
      </g>

      {/* Walker A: left → right */}
      <g className="walker walker--a">
        <g transform="translate(0 132)">
          <circle cx="0" cy="10" r="8" className="walker__shape" />
          <rect x="-11" y="21" width="22" height="46" rx="6" className="walker__shape" />
          <rect x="-20" y="-4" width="40" height="80" className="det" />
          <text x="-20" y="-9" className="det__label">
            {t.vision.person}
          </text>
        </g>
      </g>

      {/* Walker B: right → left, further away */}
      <g className="walker walker--b">
        <g transform="translate(0 118) scale(0.7)">
          <circle cx="0" cy="10" r="8" className="walker__shape" />
          <rect x="-11" y="21" width="22" height="46" rx="6" className="walker__shape" />
          <rect x="-20" y="-4" width="40" height="80" className="det" />
          <text x="-20" y="-9" className="det__label">
            {t.vision.person}
          </text>
        </g>
      </g>

      {/* HUD */}
      <g className="feed__hud">
        <circle cx="20" cy="20" r="4" className="feed__rec" />
        <text x="30" y="26">
          {t.vision.rec} · cam-01 · rtsp
        </text>
        <text x="460" y="24" textAnchor="end">
          yolov5 · cuda:0
        </text>
        <text x="24" y="266">
          {now ? `${formatDate(now)} ${formatClock(now)}` : '----------'}
        </text>
        <path d="M12 40 V12 H40 M440 12 H468 V40 M12 250 V278 H40 M440 278 H468 V250" className="feed__corners" />
      </g>
    </svg>
  );
}
