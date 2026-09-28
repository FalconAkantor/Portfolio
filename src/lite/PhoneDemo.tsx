import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/context';
import type { Localized } from '../i18n/types';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * The simple version's hero demo: a phone playing an example conversation of the
 * stock-by-photo system (Inventario IA). Illustrative — not a real chat.
 */

const SCRIPT = [700, 1400, 1500, 1500, 2700, 1300, 4800];
const LAST = SCRIPT.length - 1;

const TXT = {
  name: { en: 'Restocking assistant', es: 'Asistente de reposición' },
  online: { en: 'online', es: 'en línea' },
  ask: {
    en: 'Hi 👋 It’s time to check the display. Send me a photo whenever you can.',
    es: 'Hola 👋 Toca revisar el expositor. Mándame una foto cuando puedas.',
  },
  counting: { en: 'Photo received. Counting products…', es: 'Foto recibida. Contando productos…' },
  counted: { en: '✅ 8 products counted · 3 units missing', es: '✅ 8 productos contados · faltan 3 unidades' },
  lines: [
    { en: 'Sun cream 50 · 2 missing', es: 'Crema solar 50 · faltan 2' },
    { en: 'Lip balm · 1 missing', es: 'Protector labial · falta 1' },
  ],
  nextDay: { en: 'Next morning · 08:00', es: 'A la mañana siguiente · 08:00' },
  list: {
    en: '📋 Today’s restocking list is ready: 2 products, 3 units. Nobody had to count anything.',
    es: '📋 Ya tienes la lista de reposición de hoy: 2 productos, 3 unidades. Nadie ha tenido que contar nada.',
  },
  example: { en: 'Example · illustrative conversation', es: 'Ejemplo · conversación ilustrativa' },
  label: { en: 'Example conversation: stock checked from a photo', es: 'Conversación de ejemplo: stock revisado con una foto' },
} satisfies Record<string, Localized | Localized[]>;

export function PhoneDemo() {
  const { l } = useI18n();
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [step, setStep] = useState(0);
  const s = reduced ? LAST : step;

  useEffect(() => {
    if (reduced || !inView) return;
    const id = window.setTimeout(() => setStep((n) => (n + 1) % SCRIPT.length), SCRIPT[step]);
    return () => window.clearTimeout(id);
  }, [step, inView, reduced]);

  return (
    <figure ref={ref} className="phone" aria-label={l(TXT.label)}>
      <div className="phone__frame">
        <div className="phone__notch" aria-hidden="true" />
        <div className="phone__head">
          <span className="phone__avatar" aria-hidden="true">
            R
          </span>
          <span className="phone__who">
            <b>{l(TXT.name)}</b>
            <small>{l(TXT.online)}</small>
          </span>
        </div>
        <ol className="phone__chat">
          {s >= 1 ? (
            <li className="bubble bubble--in">
              {l(TXT.ask)}
              <time>10:02</time>
            </li>
          ) : null}
          {s >= 2 ? (
            <li className="bubble bubble--out bubble--photo">
              <ShelfPhoto />
              <time>10:04 ✓✓</time>
            </li>
          ) : null}
          {s === 3 ? (
            <li className="bubble bubble--in bubble--typing" aria-label={l(TXT.counting)}>
              <i />
              <i />
              <i />
            </li>
          ) : null}
          {s >= 4 ? (
            <li className="bubble bubble--in">
              <span className="bubble__dim">{l(TXT.counting)}</span>
              <b>{l(TXT.counted)}</b>
              <span className="bubble__list">
                {TXT.lines.map((line, k) => (
                  <span key={k}>• {l(line)}</span>
                ))}
              </span>
              <time>10:04</time>
            </li>
          ) : null}
          {s >= 5 ? <li className="phone__day">{l(TXT.nextDay)}</li> : null}
          {s >= 6 ? (
            <li className="bubble bubble--in bubble--hl">
              {l(TXT.list)}
              <time>08:00</time>
            </li>
          ) : null}
        </ol>
      </div>
      <figcaption className="phone__note">{l(TXT.example)}</figcaption>
    </figure>
  );
}

/** A tiny abstract display photo: two shelves, a few boxes, the gaps outlined. */
function ShelfPhoto() {
  const boxes = [
    [8, 10, 1],
    [30, 10, 1],
    [52, 10, 0],
    [74, 10, 1],
    [96, 10, 1],
    [8, 44, 1],
    [30, 44, 0],
    [52, 44, 1],
    [74, 44, 1],
    [96, 44, 0],
  ] as const;
  return (
    <svg className="bubble__photo" viewBox="0 0 124 78" aria-hidden="true">
      <rect width="124" height="78" rx="6" fill="#1b2a33" />
      <rect x="4" y="34" width="116" height="3" fill="#2f4250" />
      <rect x="4" y="68" width="116" height="3" fill="#2f4250" />
      {boxes.map(([x, y, full], k) =>
        full ? (
          <rect key={k} x={x} y={y} width="18" height="24" rx="2" fill={k % 3 ? '#6aa7b3' : '#c9a15a'} opacity="0.85" />
        ) : (
          <rect key={k} x={x} y={y} width="18" height="24" rx="2" fill="none" stroke="#ef5b4c" strokeDasharray="3 2" />
        ),
      )}
    </svg>
  );
}
