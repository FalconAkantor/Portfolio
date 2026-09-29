import type { ReactNode } from 'react';
import type { ProjectId } from '../data/projects';
import { useI18n } from '../i18n/context';
import type { Localized } from '../i18n/types';
import { useInView } from '../hooks/useInView';

/**
 * Tiny looping "GIF" for each example in the simple version: what the tool does, in
 * ~8 seconds, without words to read. Pure SVG + CSS (crisp, a few KB, pauses offscreen).
 * Elements use four synchronised stages (.ll-s1 … .ll-s4) that appear one after another.
 */
export function LiteLoop({ project }: { project: ProjectId }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });
  const scenes: Record<ProjectId, () => ReactNode> = {
    'inventory-ai': Shelf,
    cctv: Camera,
    docs: Docs,
    'whatsapp-desk': Desk,
    workspace: Workspace,
  };
  const Scene = scenes[project];
  return (
    <div ref={ref} className={`ll${inView ? '' : ' is-paused'}`} aria-hidden="true">
      <svg viewBox="0 0 320 150" className="ll__svg">
        <Scene />
      </svg>
    </div>
  );
}

function useL() {
  const { l } = useI18n();
  return (t: Localized) => l(t);
}

/* ── Inventario: photo → count → restocking list ───────────────── */
function Shelf() {
  const l = useL();
  const boxes = [
    [118, 34, 1],
    [140, 34, 1],
    [162, 34, 0],
    [184, 34, 1],
    [206, 34, 1],
    [118, 80, 1],
    [140, 80, 0],
    [162, 80, 1],
    [184, 80, 1],
    [206, 80, 0],
  ] as const;
  return (
    <>
      {/* phone taking the photo */}
      <rect x="22" y="30" width="52" height="92" rx="9" className="ll-dev" />
      <rect x="28" y="40" width="40" height="64" rx="3" className="ll-screen" />
      <circle cx="48" cy="72" r="9" className="ll-lens" />
      <circle cx="48" cy="72" r="26" className="ll-flash" />
      <path d="M80 76 H100" className="ll-arrow ll-s1" />
      {/* shelf */}
      <rect x="110" y="22" width="126" height="108" rx="6" className="ll-card" />
      <rect x="114" y="66" width="118" height="3" className="ll-plank" />
      <rect x="114" y="112" width="118" height="3" className="ll-plank" />
      {boxes.map(([x, y, full], k) =>
        full ? (
          <g key={k}>
            <rect x={x} y={y} width="18" height="30" rx="2" className={k % 3 ? 'll-box' : 'll-box ll-box--b'} />
            <path d={`M${x + 5} ${y + 15} l4 4 l7 -8`} className="ll-tick ll-s2" />
          </g>
        ) : (
          <rect key={k} x={x} y={y} width="18" height="30" rx="2" className="ll-gap ll-s3" />
        ),
      )}
      <rect x="112" y="24" width="4" height="104" className="ll-scan" />
      {/* results */}
      <g className="ll-s2">
        <rect x="246" y="26" width="64" height="22" rx="11" className="ll-pill ll-pill--ok" />
        <text x="278" y="41" textAnchor="middle" className="ll-t ll-t--dark">
          {l({ en: '7 counted', es: '7 contados' })}
        </text>
      </g>
      <g className="ll-s3">
        <rect x="246" y="54" width="64" height="22" rx="11" className="ll-pill ll-pill--bad" />
        <text x="278" y="69" textAnchor="middle" className="ll-t ll-t--dark">
          {l({ en: '3 missing', es: 'faltan 3' })}
        </text>
      </g>
      <g className="ll-s4">
        <rect x="246" y="84" width="64" height="46" rx="6" className="ll-card ll-card--hl" />
        <text x="254" y="98" className="ll-t ll-t--sig">
          08:00 📋
        </text>
        <rect x="254" y="106" width="46" height="4" rx="2" className="ll-line" />
        <rect x="254" y="115" width="34" height="4" rx="2" className="ll-line" />
      </g>
    </>
  );
}

/* ── CCTV: someone walks in → detected → AI judges → alert ────── */
function Camera() {
  const l = useL();
  return (
    <>
      <rect width="320" height="150" className="ll-night" />
      <path d="M0 100 H320" className="ll-ground" />
      <line x1="60" y1="18" x2="60" y2="100" className="ll-post" />
      <path d="M60 20 L28 100 L92 100 Z" className="ll-cone" />
      {/* learned car */}
      <g>
        <rect x="150" y="80" width="70" height="20" rx="6" className="ll-car" />
        <path d="M162 80 L170 70 H200 L208 80 Z" className="ll-car" />
        <rect x="146" y="64" width="78" height="40" className="ll-learned" />
      </g>
      {/* walker */}
      <g className="ll-walker">
        <circle cx="0" cy="66" r="6" className="ll-person" />
        <rect x="-6" y="73" width="12" height="24" rx="4" className="ll-person" />
        <rect x="-12" y="58" width="24" height="42" className="ll-det ll-s1" />
      </g>
      <circle cx="14" cy="14" r="4" className="ll-rec" />
      <text x="24" y="18" className="ll-t ll-t--dim">
        REC · 03:12
      </text>
      <g className="ll-s2">
        <rect x="196" y="14" width="112" height="30" rx="8" className="ll-card ll-card--warn" />
        <text x="252" y="33" textAnchor="middle" className="ll-t">
          {l({ en: 'AI: suspicious', es: 'IA: sospechoso' })}
        </text>
      </g>
      <g className="ll-s3">
        <rect x="220" y="110" width="88" height="30" rx="8" className="ll-card ll-card--hl" />
        <text x="264" y="129" textAnchor="middle" className="ll-t">
          🔔 {l({ en: 'Alert sent', es: 'Aviso enviado' })}
        </text>
      </g>
    </>
  );
}

/* ── Docs: a scan comes in → read → tagged → found by a question ─ */
function Docs() {
  const l = useL();
  return (
    <>
      <g className="ll-drop">
        <rect x="26" y="22" width="76" height="100" rx="4" className="ll-page" />
        {[38, 48, 58, 68, 78, 88, 98].map((y) => (
          <rect key={y} x="36" y={y} width={y % 20 ? 56 : 44} height="3" rx="1.5" className="ll-ink" />
        ))}
        <rect x="26" y="22" width="76" height="4" className="ll-scan-y" />
        <text x="30" y="116" className="ll-t ll-t--pdf">
          PDF
        </text>
      </g>
      <g className="ll-s2">
        <rect x="116" y="26" width="58" height="18" rx="9" className="ll-tag" />
        <text x="145" y="39" textAnchor="middle" className="ll-t ll-t--flow">
          #{l({ en: 'pricelist', es: 'tarifa' })}
        </text>
        <rect x="180" y="26" width="50" height="18" rx="9" className="ll-tag" />
        <text x="205" y="39" textAnchor="middle" className="ll-t ll-t--flow">
          #2026
        </text>
      </g>
      <g className="ll-s3">
        <rect x="116" y="60" width="192" height="26" rx="13" className="ll-search" />
        <text x="130" y="77" className="ll-t">
          ⌕ {l({ en: 'new supplier?', es: '¿alta de proveedor?' })}
        </text>
      </g>
      <g className="ll-s4">
        <rect x="116" y="96" width="192" height="36" rx="8" className="ll-card ll-card--ok" />
        <text x="128" y="112" className="ll-t">
          alta_proveedor.docx
        </text>
        <text x="128" y="125" className="ll-t ll-t--ok">
          91 % · {l({ en: 'answer found', es: 'respuesta encontrada' })}
        </text>
      </g>
    </>
  );
}

/* ── WhatsApp desk: customer → AI → “asistente” → the team answers ─ */
function Desk() {
  const l = useL();
  return (
    <>
      <rect x="18" y="10" width="120" height="132" rx="14" className="ll-dev" />
      <rect x="26" y="20" width="104" height="112" rx="8" className="ll-wa" />
      <g className="ll-s1">
        <rect x="58" y="28" width="66" height="18" rx="7" className="ll-bub ll-bub--me" />
        <text x="64" y="40" className="ll-t ll-t--s">
          {l({ en: 'Hi! I need…', es: '¡Hola! Busco…' })}
        </text>
      </g>
      <g className="ll-s2">
        <rect x="32" y="52" width="74" height="18" rx="7" className="ll-bub" />
        <text x="38" y="64" className="ll-t ll-t--s">
          🤖 {l({ en: 'I suggest…', es: 'Te recomiendo…' })}
        </text>
      </g>
      <g className="ll-s3">
        <rect x="70" y="76" width="54" height="18" rx="7" className="ll-bub ll-bub--me" />
        <text x="76" y="88" className="ll-t ll-t--s">
          asistente
        </text>
      </g>
      <g className="ll-s4">
        <rect x="32" y="100" width="80" height="24" rx="7" className="ll-bub ll-bub--agent" />
        <text x="38" y="115" className="ll-t ll-t--s ll-t--sig">
          👨‍💻 Ana: {l({ en: 'Hi!', es: '¡Hola!' })}
        </text>
      </g>
      {/* the bridge and the team */}
      <path d="M144 76 H176" className="ll-bridge ll-s3" />
      <rect x="182" y="22" width="126" height="108" rx="10" className="ll-dc" />
      <text x="192" y="40" className="ll-t ll-t--dim">
        # wa-marta
      </text>
      {[
        ['A', 206, 'll-av--a'],
        ['L', 240, 'll-av--b'],
        ['S', 274, 'll-av--c'],
      ].map(([ch, x, cls]) => (
        <g key={String(ch)} className="ll-s3">
          <circle cx={Number(x)} cy="78" r="15" className={`ll-av ${cls}`} />
          <text x={Number(x)} y="83" textAnchor="middle" className="ll-t ll-t--dark ll-t--b">
            {ch}
          </text>
        </g>
      ))}
      <text x="245" y="116" textAnchor="middle" className="ll-t ll-t--sig ll-s4">
        {l({ en: '3 people · 1 number', es: '3 personas · 1 número' })}
      </text>
    </>
  );
}

/* ── Workspace: windows open, snap, the AI points to the tool ───── */
function Workspace() {
  const l = useL();
  return (
    <>
      <rect x="14" y="10" width="292" height="130" rx="10" className="ll-desk" />
      <rect x="14" y="124" width="292" height="16" className="ll-taskbar" />
      <g className="ll-s1 ll-zoom">
        <rect x="26" y="20" width="130" height="62" rx="5" className="ll-win" />
        <rect x="26" y="20" width="130" height="12" rx="5" className="ll-winbar" />
        <rect x="36" y="42" width="90" height="4" rx="2" className="ll-line" />
        <rect x="36" y="52" width="70" height="4" rx="2" className="ll-line" />
        <rect x="36" y="62" width="80" height="4" rx="2" className="ll-line" />
      </g>
      <g className="ll-s2 ll-zoom">
        <rect x="164" y="20" width="130" height="98" rx="5" className="ll-win" />
        <rect x="164" y="20" width="130" height="12" rx="5" className="ll-winbar" />
        <rect x="174" y="44" width="16" height="50" className="ll-bar" />
        <rect x="196" y="60" width="16" height="34" className="ll-bar" />
        <rect x="218" y="52" width="16" height="42" className="ll-bar" />
        <rect x="240" y="70" width="16" height="24" className="ll-bar" />
      </g>
      <g className="ll-s3">
        <rect x="26" y="90" width="130" height="26" rx="13" className="ll-card ll-card--hl" />
        <text x="91" y="107" textAnchor="middle" className="ll-t">
          ✦ {l({ en: 'Use: Supplier search', es: 'Usa: Buscador' })}
        </text>
      </g>
      <g className="ll-s4">
        <rect x="190" y="96" width="98" height="18" rx="9" className="ll-pill ll-pill--ok" />
        <text x="239" y="109" textAnchor="middle" className="ll-t ll-t--dark">
          ✓ {l({ en: 'signed in', es: 'sesión iniciada' })}
        </text>
      </g>
      <path d="M0 0 L0 13 L4 9 L7 15 L9 14 L6 8 L11 8 Z" className="ll-cursor" />
    </>
  );
}
