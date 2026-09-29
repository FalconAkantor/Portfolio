import { useEffect, useState } from 'react';
import { useI18n } from '../../i18n/context';
import type { Localized } from '../../i18n/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import './bridge.css';

/**
 * Interactive replica of the WhatsApp sales desk: the customer's WhatsApp on the left,
 * the team's Discord channel on the right, and the conversation crossing between them.
 * People, products and prices are sample data.
 */

type Side = 'wa' | 'dc';
type Who = 'customer' | 'ai' | 'agent' | 'system';
interface Msg {
  side: Side;
  who: Who;
  author?: string;
  text: Localized;
  file?: string;
}

const same = (text: string): Localized => ({ en: text, es: text });

/** Each beat adds one or two messages (one per side). */
const BEATS: { ms: number; msgs: Msg[] }[] = [
  {
    ms: 2000,
    msgs: [
      { side: 'wa', who: 'customer', text: { en: 'Hi! I need a computer for 3D design, around €2,000', es: '¡Hola! Busco un equipo para diseño 3D, unos 2.000 €' } },
      {
        side: 'dc',
        who: 'system',
        text: {
          en: '🤖 Marta started talking to the AI. Write here at any time to step in.',
          es: '🤖 Marta ha empezado a hablar con la IA. Escribe aquí cuando quieras para intervenir.',
        },
      },
    ],
  },
  {
    ms: 2600,
    msgs: [
      {
        side: 'wa',
        who: 'ai',
        text: {
          en: 'For 3D design with that budget, Marta, these fit best:\n1) Workstation A · €1,890\n2) Workstation B · €2,090\n(links from the catalogue)',
          es: 'Para diseño 3D con ese presupuesto, Marta, estos son los que mejor encajan:\n1) Estación A · 1.890 €\n2) Estación B · 2.090 €\n(enlaces del catálogo)',
        },
      },
    ],
  },
  { ms: 1500, msgs: [{ side: 'wa', who: 'customer', text: same('asistente') }] },
  {
    ms: 2400,
    msgs: [
      { side: 'wa', who: 'ai', text: { en: '🧑‍💻 Passing you to a person. One moment…', es: '🧑‍💻 Te paso con un agente humano. Un momento…' } },
      {
        side: 'dc',
        who: 'system',
        text: {
          en: '@everyone 📥 New WhatsApp enquiry · Customer: Marta. Reply here and she gets it on WhatsApp.',
          es: '@everyone 📥 Nueva consulta desde WhatsApp · Cliente: Marta. Responde aquí y le llegará por WhatsApp.',
        },
      },
    ],
  },
  {
    ms: 2600,
    msgs: [
      { side: 'dc', who: 'agent', author: 'ana', text: { en: 'Hi Marta, I’m Ana. Will you also use it for rendering?', es: 'Hola Marta, soy Ana. ¿Lo usarás también para render?' } },
      { side: 'wa', who: 'agent', author: 'ana', text: { en: 'Hi Marta, I’m Ana. Will you also use it for rendering?', es: 'Hola Marta, soy Ana. ¿Lo usarás también para render?' } },
    ],
  },
  {
    ms: 2600,
    msgs: [
      { side: 'wa', who: 'customer', text: { en: 'Yes, this is my current setup', es: 'Sí, este es mi puesto actual' }, file: 'foto_puesto.jpg' },
      { side: 'dc', who: 'customer', author: 'Marta', text: { en: 'Yes, this is my current setup', es: 'Sí, este es mi puesto actual' }, file: 'foto_puesto.jpg' },
    ],
  },
  {
    ms: 2800,
    msgs: [
      { side: 'dc', who: 'agent', author: 'luis', text: { en: 'I’ll send you the quote 👍', es: 'Te preparo yo el presupuesto 👍' }, file: 'presupuesto.pdf' },
      { side: 'wa', who: 'agent', author: 'luis', text: { en: 'I’ll send you the quote 👍', es: 'Te preparo yo el presupuesto 👍' }, file: 'presupuesto.pdf' },
    ],
  },
  { ms: 1500, msgs: [{ side: 'dc', who: 'agent', author: 'luis', text: same('!cerrar') }] },
  {
    ms: 4800,
    msgs: [
      { side: 'dc', who: 'system', text: { en: '✅ Chat closed by luis. The AI is active again for this customer.', es: '✅ Chat cerrado por luis. La IA vuelve a estar activa para este cliente.' } },
      { side: 'wa', who: 'ai', text: { en: '✅ The chat with an agent is closed. I’m back — ask me anything.', es: '✅ El chat con un agente se ha cerrado. Vuelvo a atenderte yo.' } },
    ],
  },
];

const TXT = {
  label: { en: 'Interactive replica of the WhatsApp sales desk', es: 'Réplica interactiva del mostrador comercial de WhatsApp' },
  customer: { en: 'Customer · WhatsApp', es: 'Cliente · WhatsApp' },
  team: { en: 'Team · Discord', es: 'Equipo · Discord' },
  aiOn: { en: 'AI answering', es: 'IA respondiendo' },
  humanOn: { en: 'team on the chat', es: 'equipo en el chat' },
  agent: { en: 'Agent', es: 'Agente' },
  sample: { en: 'sample conversation', es: 'conversación de ejemplo' },
} satisfies Record<string, Localized>;

export function BridgeDemo({ active }: { active: boolean }) {
  const { l } = useI18n();
  const reduced = useReducedMotion();
  const [beat, setBeat] = useState(0);
  const shown = reduced ? BEATS.length - 1 : beat;

  useEffect(() => {
    if (reduced || !active) return;
    const id = window.setTimeout(() => setBeat((b) => (b + 1) % BEATS.length), BEATS[beat]!.ms);
    return () => window.clearTimeout(id);
  }, [beat, active, reduced]);

  const msgs = BEATS.slice(0, shown + 1).flatMap((b, bi) => b.msgs.map((m, mi) => ({ ...m, key: `${bi}-${mi}` })));
  const human = shown >= 3 && shown < BEATS.length - 1;

  const render = (side: Side) =>
    msgs
      .filter((m) => m.side === side)
      .slice(-5)
      .map((m) => (
        <li key={m.key} className={`brg__msg brg__msg--${m.who}`}>
          {side === 'dc' && m.who !== 'system' ? <span className="brg__author mono">{m.author}</span> : null}
          {side === 'wa' && m.who === 'agent' ? (
            <span className="brg__sig">
              👨‍💻 {l(TXT.agent)} ({m.author}):
            </span>
          ) : null}
          <span className="brg__text">{l(m.text)}</span>
          {m.file ? <span className="brg__file mono">{m.file.endsWith('.pdf') ? '📄' : '🖼'} {m.file}</span> : null}
        </li>
      ));

  return (
    <div className="brg" role="region" aria-label={l(TXT.label)}>
      <section className="brg__wa" aria-label={l(TXT.customer)}>
        <header className="brg__head">
          <span className="brg__avatar" aria-hidden="true">
            M
          </span>
          <span>
            <b>Marta</b>
            <small className={human ? 'is-human' : ''}>{human ? l(TXT.humanOn) : l(TXT.aiOn)}</small>
          </span>
        </header>
        <ol className="brg__list" aria-live="polite">
          {render('wa')}
        </ol>
      </section>

      <div className="brg__link" aria-hidden="true">
        <span className={human ? 'is-on' : ''} />
      </div>

      <section className="brg__dc" aria-label={l(TXT.team)}>
        <header className="brg__head brg__head--dc mono">
          <span># wa-600123456-marta</span>
          <small>{l(TXT.team)}</small>
        </header>
        <ol className="brg__list">{render('dc')}</ol>
      </section>
      <p className="brg__sample mono">{l(TXT.sample)}</p>
    </div>
  );
}
