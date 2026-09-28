import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useI18n } from '../../i18n/context';
import type { Localized } from '../../i18n/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './sentinel.css';

/**
 * Interactive replica of the autonomous CCTV: a night scene where the whole chain plays out
 * (detection → event session → AI forensic analysis → Telegram topics), plus the
 * plain-language investigation. Scene, times and events are sample data.
 */

type Step = 'idle' | 'enter' | 'near' | 'leave' | 'close' | 'analyse' | 'result';

const SCRIPT: { step: Step; ms: number }[] = [
  { step: 'idle', ms: 1800 },
  { step: 'enter', ms: 2600 },
  { step: 'near', ms: 2800 },
  { step: 'leave', ms: 2400 },
  { step: 'close', ms: 1500 },
  { step: 'analyse', ms: 2300 },
  { step: 'result', ms: 6500 },
];
const ORDER = SCRIPT.map((s) => s.step);
const reached = (current: Step, target: Step) => ORDER.indexOf(current) >= ORDER.indexOf(target);

/** Person position along the scripted walk (viewBox units). */
const PERSON: Record<Step, { x: number; y: number; ms: number }> = {
  idle: { x: -40, y: 262, ms: 0 },
  enter: { x: 262, y: 250, ms: 2500 },
  near: { x: 286, y: 246, ms: 900 },
  leave: { x: 700, y: 236, ms: 2300 },
  close: { x: 700, y: 236, ms: 0 },
  analyse: { x: 700, y: 236, ms: 0 },
  result: { x: 700, y: 236, ms: 0 },
};

const TXT = {
  label: { en: 'Interactive replica of the autonomous CCTV', es: 'Réplica interactiva del CCTV autónomo' },
  live: { en: 'Live', es: 'Vivo' },
  ask: { en: 'Investigate', es: 'Investigar' },
  cam: { en: 'CAMERA', es: 'CÁMARA' },
  night: { en: 'night mode 20:00–07:00', es: 'modo nocturno 20:00–07:00' },
  learned: { en: 'learned', es: 'aprendido' },
  car: { en: 'car', es: 'coche' },
  person: { en: 'person', es: 'persona' },
  session: { en: 'EVENT', es: 'EVENTO' },
  calm: { en: 'calm 5 s · closing session', es: 'calma 5 s · cerrando sesión' },
  quiet: { en: 'no events · 3 vehicles learned', es: 'sin eventos · 3 vehículos aprendidos' },
  topics: { en: 'Telegram · topics', es: 'Telegram · topics' },
  analysing: { en: 'Analysing 12 key frames + pose hints on the local model…', es: 'Analizando 12 fotogramas clave + pistas de pose en el modelo local…' },
  aiTitle: { en: 'AI analysis · suspicious behaviour', es: 'Análisis IA · comportamiento sospechoso' },
  level: { en: 'HIGH', es: 'ALTO' },
  risk: { en: 'risk', es: 'riesgo' },
  summary: {
    en: 'A person on foot walks up to a parked car, looks in through the window for about 20 s and leaves towards the exit without getting in.',
    es: 'Una persona a pie se acerca a un turismo aparcado, mira por la ventanilla unos 20 s y se va hacia la salida sin entrar.',
  },
  timeline: [
    { en: 'start · enters from the left, walking', es: 'inicio · entra por la izquierda, caminando' },
    { en: 'middle · stops at car 02, leans towards the window', es: 'medio · se para junto al coche 02 y se inclina hacia la ventanilla' },
    { en: 'end · walks away to the right, fast pace', es: 'final · se aleja hacia la derecha, paso rápido' },
  ],
  unsure: { en: 'Not determinable: clothing colour (dark, low light).', es: 'No determinable: color de la ropa (oscura, poca luz).' },
  sample: { en: 'sample scene', es: 'escena de ejemplo' },
  askPlaceholder: { en: 'Ask about any day…', es: 'Pregunta sobre cualquier día…' },
  thinking: { en: 'Searching the event database with the local AI', es: 'Buscando en la base de eventos con la IA local' },
  videos: { en: 'Videos', es: 'Vídeos' },
} satisfies Record<string, Localized | Localized[]>;

type TopicKey = 'people' | 'videos' | 'ai' | 'alerts';
const TOPICS: { key: TopicKey; at: Step; icon: string; name: Localized; text: Localized }[] = [
  { key: 'people', at: 'enter', icon: '📸', name: { en: 'people', es: 'personas' }, text: { en: 'Person detected · 0.91 · photo', es: 'Persona detectada · 0.91 · foto' } },
  { key: 'videos', at: 'close', icon: '🎬', name: { en: 'videos', es: 'vídeos' }, text: { en: 'Person event · 00:21 · MP4', es: 'Evento persona · 00:21 · MP4' } },
  { key: 'ai', at: 'result', icon: '🧠', name: { en: 'ai', es: 'ia' }, text: { en: 'HIGH · person close to car · ▶ video', es: 'ALTO · persona cerca de coche · ▶ vídeo' } },
  { key: 'alerts', at: 'result', icon: '🚨', name: { en: 'alerts', es: 'alertas' }, text: { en: '#alerta · emergency push sent', es: '#alerta · push de emergencia enviado' } },
];

const QUESTIONS: { q: Localized; a: Localized; clips: Localized[] }[] = [
  {
    q: { en: 'Anything odd last night?', es: '¿Pasó algo raro anoche?' },
    a: {
      en: 'Yes, one important event: at 03:12 a person on foot walked up to a parked car and looked through the window for about 20 seconds (high level). The rest of the night there were only headlights from the street, with no activity in the car park.',
      es: 'Sí, un evento importante: a las 03:12 una persona a pie se acercó a un turismo aparcado y miró por la ventanilla unos 20 segundos (nivel alto). El resto de la noche solo hubo luces de faros desde la calle, sin actividad en el parking.',
    },
    clips: [
      { en: '03:12 · person near car', es: '03:12 · persona cerca de coche' },
      { en: '23:47 · headlights', es: '23:47 · faros' },
    ],
  },
  {
    q: { en: 'Which delivery companies came today?', es: '¿Qué empresas de reparto han venido hoy?' },
    a: {
      en: 'Three deliveries with a visible logo: GLS at 09:41, SEUR at 11:05 and Correos at 16:20. A white van at 13:30 had no clear logo, so I do not count it as a delivery.',
      es: 'Tres repartos con el logotipo visible: GLS a las 09:41, SEUR a las 11:05 y Correos a las 16:20. Una furgoneta blanca a las 13:30 no llevaba logo claro, así que no la cuento como reparto.',
    },
    clips: [
      { en: '09:41 · GLS', es: '09:41 · GLS' },
      { en: '11:05 · SEUR', es: '11:05 · SEUR' },
      { en: '16:20 · Correos', es: '16:20 · Correos' },
    ],
  },
  {
    q: { en: 'How often did the white van come this week?', es: '¿Cuántas veces ha venido la furgoneta blanca esta semana?' },
    a: {
      en: 'Visual re-identification links it to 4 visits in 7 days — Monday, Tuesday, Thursday and today — always between 13:00 and 14:00, with an average similarity of 0.84.',
      es: 'La reidentificación visual la relaciona con 4 visitas en 7 días —lunes, martes, jueves y hoy—, siempre entre las 13:00 y las 14:00, con una similitud media de 0,84.',
    },
    clips: [
      { en: 'Mon 13:22', es: 'lun 13:22' },
      { en: 'Tue 13:40', es: 'mar 13:40' },
      { en: 'Thu 13:15', es: 'jue 13:15' },
      { en: 'today 13:30', es: 'hoy 13:30' },
    ],
  },
];

export function SentinelConsole({ active }: { active: boolean }) {
  const { l } = useI18n();
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<'live' | 'ask'>('live');
  const [i, setI] = useState(0);
  const step: Step = reduced ? 'result' : SCRIPT[i]!.step;

  useEffect(() => {
    if (reduced || !active || tab !== 'live') return;
    const id = window.setTimeout(() => setI((n) => (n + 1) % SCRIPT.length), SCRIPT[i]!.ms);
    return () => window.clearTimeout(id);
  }, [i, active, reduced, tab]);

  return (
    <div className="snt" role="region" aria-label={l(TXT.label)}>
      <div className="snt__bar mono">
        <span className="snt__pill">
          <i className="snt__dot snt__dot--ok" /> {l(TXT.cam)}
        </span>
        <span className="snt__pill">
          <i className="snt__dot snt__dot--rec" /> REC
        </span>
        <span className="snt__pill">
          <i className={`snt__dot ${step === 'analyse' ? 'snt__dot--busy' : 'snt__dot--ok'}`} /> IA
        </span>
        <span className="snt__night">🌙 {l(TXT.night)}</span>
        <div className="snt__tabs" role="tablist" aria-label={l(TXT.label)}>
          {(['live', 'ask'] as const).map((k) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>
              {l(k === 'live' ? TXT.live : TXT.ask)}
            </button>
          ))}
        </div>
      </div>

      {tab === 'live' ? <Live step={step} /> : <Investigate />}
    </div>
  );
}

function Live({ step }: { step: Step }) {
  const { l } = useI18n();
  const person = PERSON[step];
  const inEvent = reached(step, 'enter') && !reached(step, 'analyse');
  const personStyle = { transform: `translate(${person.x}px, ${person.y}px)`, transitionDuration: `${person.ms}ms` } as CSSProperties;
  const status = step === 'close' ? l(TXT.calm) : inEvent ? `${l(TXT.session)} · ${l(TXT.person)}` : l(TXT.quiet);

  return (
    <div className="snt__live">
      <div className="snt__feed">
        <svg className="snt__svg" viewBox="0 0 640 360" aria-hidden="true">
          <defs>
            <linearGradient id="snt-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#070b12" />
              <stop offset="1" stopColor="#0b1119" />
            </linearGradient>
            <radialGradient id="snt-lamp" cx="0.5" cy="0" r="1">
              <stop offset="0" stopColor="rgb(242 169 59 / 0.28)" />
              <stop offset="1" stopColor="rgb(242 169 59 / 0)" />
            </radialGradient>
          </defs>
          <rect width="640" height="360" fill="url(#snt-sky)" />
          {/* Building, door and lamp */}
          <rect x="380" y="70" width="260" height="120" fill="#0d141d" stroke="#1a2430" />
          <rect x="560" y="120" width="40" height="70" fill="#0a0f16" stroke="#243142" />
          <rect x="400" y="90" width="44" height="22" fill="#111a24" />
          <rect x="460" y="90" width="44" height="22" fill="#111a24" />
          <line x1="150" y1="40" x2="150" y2="215" stroke="#1f2a37" strokeWidth="4" />
          <path d="M150 42 L70 250 L230 250 Z" fill="url(#snt-lamp)" />
          <circle cx="150" cy="42" r="5" fill="#f2a93b" opacity="0.8" />
          {/* Ground with parking bays */}
          <path d="M0 190 H640 V360 H0 Z" fill="#0a1017" />
          {[40, 170, 300, 430, 560].map((x) => (
            <line key={x} x1={x} y1={200} x2={x - 60} y2={330} stroke="#1c2733" strokeWidth="2" />
          ))}
          {/* Learned vehicles */}
          {[
            { x: 36, id: '01' },
            { x: 196, id: '02' },
            { x: 452, id: '03' },
          ].map((c) => (
            <g key={c.id} transform={`translate(${c.x} 222)`}>
              <rect x="0" y="18" width="104" height="30" rx="8" fill="#16202b" />
              <path d="M18 18 L30 2 H74 L88 18 Z" fill="#131c26" />
              <circle cx="24" cy="50" r="8" fill="#0b1016" />
              <circle cx="80" cy="50" r="8" fill="#0b1016" />
              <rect x="-4" y="-4" width="112" height="64" className="snt__learned" />
              <text x="-2" y="-9" className="snt__tag snt__tag--flow">
                {`${l(TXT.car)} ${c.id} ✓`}
              </text>
            </g>
          ))}

          {/* The person, their YOLO box and (when close to the car) pose keypoints */}
          <g className="snt__person" style={personStyle}>
            <circle cx="0" cy="-58" r="7" fill="#2c3947" />
            <rect x="-9" y="-50" width="18" height="36" rx="5" fill="#2c3947" />
            <rect x="-8" y="-15" width="7" height="22" rx="3" fill="#26323f" />
            <rect x="1" y="-15" width="7" height="22" rx="3" fill="#26323f" />
            {reached(step, 'enter') && !reached(step, 'close') ? (
              <>
                <rect x="-18" y="-70" width="36" height="80" className="snt__det" />
                <text x="-18" y="-75" className="snt__tag snt__tag--signal">
                  {`${l(TXT.person)} 0.91`}
                </text>
              </>
            ) : null}
            {step === 'near' ? (
              <g className="snt__pose">
                <polyline points="0,-58 0,-44 -12,-34 -22,-44" />
                <polyline points="0,-44 12,-34 20,-40" />
                <polyline points="0,-44 0,-18 -5,6" />
                <polyline points="0,-18 5,6" />
                {[
                  [0, -58],
                  [0, -44],
                  [-12, -34],
                  [-22, -44],
                  [12, -34],
                  [20, -40],
                  [0, -18],
                  [-5, 6],
                  [5, 6],
                ].map(([x, y], k) => (
                  <circle key={k} cx={x} cy={y} r="2" />
                ))}
              </g>
            ) : null}
          </g>

          {/* HUD */}
          <g className="snt__hud">
            <circle cx="18" cy="18" r="4" className="snt__rec" />
            <text x="28" y="22">
              CAM-EXT · 03:12 · yolov8x · 1 fps
            </text>
            {inEvent ? (
              <g>
                <rect x="480" y="8" width="150" height="22" rx="3" className="snt__evt" />
                <text x="555" y="23" textAnchor="middle" className="snt__evt-text">
                  ● {l(TXT.session)} · {l(TXT.person).toUpperCase()}
                </text>
              </g>
            ) : null}
            <path d="M8 44 V8 H44 M596 8 H632 V44 M8 316 V352 H44 M596 352 H632 V316" className="snt__corners" />
          </g>
        </svg>
        <p className="snt__status mono" aria-live="polite">
          <span className={inEvent ? 'is-hot' : ''}>{status}</span>
          <span className="snt__sample">{l(TXT.sample)}</span>
        </p>
        <DayStrip />
      </div>

      <div className="snt__side">
        <div className={`snt__ai${reached(step, 'analyse') ? ' is-on' : ''}${step === 'result' ? ' is-done' : ''}`}>
          {step === 'analyse' ? (
            <p className="snt__thinking mono">{l(TXT.analysing)}</p>
          ) : step === 'result' ? (
            <>
              <p className="snt__ai-head mono">
                <span>🚨 {l(TXT.aiTitle)}</span>
                <span className="snt__level">{l(TXT.level)}</span>
              </p>
              <div className="snt__risk mono" aria-label={`${l(TXT.risk)} 80/100`}>
                <span>{l(TXT.risk)}</span>
                <span className="snt__meter">
                  <i style={{ width: '80%' }} />
                </span>
                <b>80</b>
              </div>
              <p className="snt__summary">{l(TXT.summary)}</p>
              <ol className="snt__timeline">
                {TXT.timeline.map((t, k) => (
                  <li key={k}>{l(t)}</li>
                ))}
              </ol>
              <p className="snt__unsure mono">{l(TXT.unsure)}</p>
            </>
          ) : (
            <p className="snt__thinking snt__thinking--idle mono">qwen2.5-vl · ollama · idle</p>
          )}
        </div>

        <div className="snt__topics">
          <p className="snt__topics-head mono">{l(TXT.topics)}</p>
          <ul>
            {TOPICS.filter((m) => reached(step, m.at)).map((m) => (
              <li key={m.key} className={`snt__msg snt__msg--${m.key}`}>
                <span className="snt__msg-topic mono">
                  {m.icon} {l(m.name)}
                </span>
                <span className="snt__msg-text">{l(m.text)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const DAY: { at: string; kind: 'alert' | 'delivery' | 'plain'; label: Localized }[] = [
  { at: '03:12', kind: 'alert', label: { en: 'person near car · HIGH', es: 'persona cerca de coche · ALTO' } },
  { at: '09:41', kind: 'delivery', label: same('GLS') },
  { at: '11:05', kind: 'delivery', label: same('SEUR') },
  { at: '13:30', kind: 'plain', label: { en: 'white van · no logo', es: 'furgoneta blanca · sin logo' } },
  { at: '16:20', kind: 'delivery', label: same('Correos') },
  { at: '21:58', kind: 'plain', label: { en: 'headlights · no AI', es: 'faros · sin IA' } },
];

function same(text: string): Localized {
  return { en: text, es: text };
}

const pct = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return ((h! * 60 + m!) / 1440) * 100;
};

/** The 24-hour timeline of the real panel, reduced: every event is a mark you can hover. */
function DayStrip() {
  const { l } = useI18n();
  return (
    <div className="snt__day">
      <p className="snt__day-head mono">
        <span>{l({ en: 'Timeline · 24 h', es: 'Línea de tiempo · 24 h' })}</span>
        <span className="snt__day-legend">
          <i className="is-alert" /> {l({ en: 'alert', es: 'alerta' })} <i className="is-delivery" /> {l({ en: 'delivery', es: 'reparto' })}
        </span>
      </p>
      <div className="snt__day-bar">
        {DAY.map((e) => (
          <span key={e.at} className={`snt__mark is-${e.kind}`} style={{ left: `${pct(e.at)}%` }} title={`${e.at} · ${l(e.label)}`}>
            <span className="sr-only">{`${e.at} · ${l(e.label)}`}</span>
          </span>
        ))}
        <span className="snt__now" style={{ left: `${pct('03:12')}%` }} aria-hidden="true" />
      </div>
      <p className="snt__day-scale mono" aria-hidden="true">
        {['00', '06', '12', '18', '24'].map((h) => (
          <span key={h}>{h}</span>
        ))}
      </p>
    </div>
  );
}

function Investigate() {
  const { l } = useI18n();
  const reduced = useReducedMotion();
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<'idle' | 'thinking' | 'answer'>('idle');
  const [shown, setShown] = useState(0);
  const timers = useRef<number[]>([]);

  const answer = picked === null ? '' : l(QUESTIONS[picked]!.a);
  const words = answer.split(' ');

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const ask = (k: number) => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setPicked(k);
    if (reduced) {
      setPhase('answer');
      setShown(Number.MAX_SAFE_INTEGER);
      return;
    }
    setPhase('thinking');
    setShown(0);
    timers.current.push(
      window.setTimeout(() => {
        setPhase('answer');
        const total = l(QUESTIONS[k]!.a).split(' ').length;
        for (let n = 1; n <= total; n++) timers.current.push(window.setTimeout(() => setShown(n), n * 35));
      }, 1100),
    );
  };

  return (
    <div className="snt__ask">
      <div className="snt__chips" role="group" aria-label={l(TXT.ask)}>
        {QUESTIONS.map((item, k) => (
          <button key={k} type="button" className={`snt__chip${picked === k ? ' is-on' : ''}`} onClick={() => ask(k)}>
            /investigar {l(item.q)}
          </button>
        ))}
      </div>
      <div className="snt__chat" aria-live="polite">
        {picked === null ? (
          <p className="snt__hint mono">{l(TXT.askPlaceholder)}</p>
        ) : (
          <>
            <p className="snt__q">{l(QUESTIONS[picked]!.q)}</p>
            {phase === 'thinking' ? <p className="snt__thinking mono">{l(TXT.thinking)}</p> : null}
            {phase === 'answer' ? (
              <>
                <p className="snt__a">{words.slice(0, shown).join(' ')}</p>
                {shown >= words.length ? (
                  <div className="snt__clips">
                    <span className="mono">{l(TXT.videos)}:</span>
                    {QUESTIONS[picked]!.clips.map((c, k) => (
                      <span key={k} className="snt__clip mono">
                        ▶ {l(c)}
                      </span>
                    ))}
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
