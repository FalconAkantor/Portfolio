import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { complete, runCommand, type TermEffect, type TermLine } from '../../lib/terminal/engine';
import { useI18n } from '../../i18n/context';
import { emit } from '../../lib/events';
import { scrollToSection } from '../../lib/scroll';
import { boot } from '../../lib/boot';
import { pathFor } from '../../i18n/routing';
import { STORAGE_KEYS, writeStorage } from '../../lib/storage';
import { SESSION_START } from '../../hooks/useSessionClock';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useInView } from '../../hooks/useInView';
import { site } from '../../config/site';
import './terminal.css';

interface Entry extends TermLine {
  key: number;
  /** Echo of a typed command. */
  input?: boolean;
}

interface TerminalProps {
  /** hero: embedded in the first screen and demos itself once; drawer: summoned from anywhere. */
  variant: 'hero' | 'drawer';
  autoFocus?: boolean;
  /** Called after an effect that moves the visitor elsewhere (so a drawer can close). */
  onNavigate?: () => void;
}

const PROMPT_USER = `visitor@${site.systemName.toLowerCase()}`;
const QUICK = ['help', 'projects', 'stack', 'ai', 'contact'] as const;
const DEMO_COMMAND = 'projects';

let keySeed = 0;
const nextKey = () => ++keySeed;

export function Terminal({ variant, autoFocus = false, onNavigate }: TerminalProps) {
  const { t, lang, l } = useI18n();
  const inputId = useId();
  const [entries, setEntries] = useState<Entry[]>(() => [{ key: 0, tone: 'dim', text: t.terminal.welcome }]);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [frameRef, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const reducedMotion = useReducedMotion();
  const bootPhase = useSyncExternalStore(boot.subscribe, () => boot.getSnapshot().phase, () => 'off' as const);
  const demoDone = useRef(false);

  const applyEffects = useCallback(
    (effects: TermEffect[]) => {
      for (const effect of effects) {
        switch (effect.type) {
          case 'clear':
            setEntries([]);
            break;
          case 'open-project':
            emit('automariza:open-project', { id: effect.id });
            scrollToSection('projects', false);
            onNavigate?.();
            break;
          case 'navigate':
            scrollToSection(effect.section, false);
            onNavigate?.();
            break;
          case 'lang':
            writeStorage(STORAGE_KEYS.lang, effect.lang);
            if (effect.lang !== lang) window.location.assign(pathFor(effect.lang, 'tech') + window.location.hash);
            break;
          case 'reboot':
            onNavigate?.();
            boot.start({ instant: reducedMotion });
            break;
        }
      }
    },
    [lang, onNavigate, reducedMotion],
  );

  const execute = useCallback(
    (raw: string) => {
      const input = raw.trim();
      const echo: Entry = { key: nextKey(), tone: 'default', text: input, input: true };
      if (!input) {
        setEntries((prev) => [...prev, echo]);
        return;
      }
      const nextHistory = [...history, input].slice(-50);
      const { lines, effects } = runCommand(input, {
        lang,
        l,
        t,
        history: nextHistory,
        sessionStart: SESSION_START,
        now: new Date(),
      });
      setHistory(nextHistory);
      setCursor(null);
      setEntries((prev) => [...prev, echo, ...lines.map((l) => ({ ...l, key: nextKey() }))].slice(-200));
      // Effects that clear the screen must run after the echo has been queued.
      applyEffects(effects);
    },
    [applyEffects, history, lang, l, t],
  );

  // The demo calls the latest execute() without restarting when it changes.
  const executeRef = useRef(execute);
  useEffect(() => {
    executeRef.current = execute;
  }, [execute]);

  // Self-demo: the hero terminal types one command the first time it is visible after boot.
  // Once started it always runs to completion; timers are only cleared on unmount.
  const demoTimers = useRef<number[]>([]);
  useEffect(() => {
    if (variant !== 'hero' || demoDone.current || !inView || bootPhase !== 'off') return;
    demoDone.current = true;
    const run = () => executeRef.current(DEMO_COMMAND);
    if (reducedMotion) {
      demoTimers.current.push(window.setTimeout(run, 0));
      return;
    }
    const at = (ms: number, fn: () => void) => demoTimers.current.push(window.setTimeout(fn, ms));
    at(0, () => setTyping(true));
    [...DEMO_COMMAND].forEach((_, i) => at(500 + i * 85, () => setValue(DEMO_COMMAND.slice(0, i + 1))));
    at(500 + DEMO_COMMAND.length * 85 + 350, () => {
      setValue('');
      setTyping(false);
      run();
    });
  }, [variant, inView, bootPhase, reducedMotion]);

  useEffect(() => {
    const timers = demoTimers.current;
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, []);

  // Keep the newest output in view (inside the terminal only — never scroll the page).
  useEffect(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus({ preventScroll: true });
  }, [autoFocus]);

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      execute(value);
      setValue('');
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (history.length === 0) return;
      event.preventDefault();
      const up = event.key === 'ArrowUp';
      const base = cursor ?? history.length;
      const next = Math.min(history.length, Math.max(0, base + (up ? -1 : 1)));
      setCursor(next === history.length ? null : next);
      setValue(next === history.length ? '' : (history[next] ?? ''));
    } else if (event.key === 'Tab') {
      const matches = complete(value);
      if (matches.length === 0 || !value.trim()) return;
      event.preventDefault();
      if (matches.length === 1) {
        setValue(`${matches[0]} `);
      } else {
        setEntries((prev) => [...prev, { key: nextKey(), tone: 'dim', text: matches.join('   ') }]);
      }
    } else if (event.key === 'l' && event.ctrlKey) {
      event.preventDefault();
      setEntries([]);
    }
  };

  return (
    <div
      ref={frameRef}
      className={`term term--${variant}`}
      role="region"
      aria-label={t.terminal.label}
    >
      <div className="term__bar mono" aria-hidden="true">
        <span className="term__lights">
          <span />
          <span />
          <span />
        </span>
        <span className="term__title">{PROMPT_USER}: ~</span>
        <span className="term__shell">nsh</span>
      </div>

      {/* Clicking anywhere on the screen focuses the prompt, like a real terminal. */}
      <div
        className="term__screen mono"
        ref={screenRef}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button') || window.getSelection()?.toString()) return;
          inputRef.current?.focus({ preventScroll: true });
        }}
      >
        <div role="log" aria-live="polite" aria-relevant="additions" className="term__log">
          {entries.map((entry) => (
            <TermRow key={entry.key} entry={entry} onRun={execute} />
          ))}
        </div>

        <div className="term__prompt">
          <label htmlFor={inputId} className="sr-only">
            {t.terminal.inputLabel}
          </label>
          <span className="term__ps1" aria-hidden="true">
            <span className="term__user">{PROMPT_USER}</span>
            <span className="term__sep">:~$</span>
          </span>
          <input
            id={inputId}
            ref={inputRef}
            className="term__input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            readOnly={typing}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
            aria-describedby={`${inputId}-hint`}
          />
        </div>
      </div>

      <div className="term__quick">
        <span id={`${inputId}-hint`} className="term__hint">
          {t.hero.terminalHint}
        </span>
        <div className="term__chips" role="group" aria-label={t.terminal.quick}>
          {QUICK.map((cmd) => (
            <button key={cmd} type="button" className="term__chip mono" onClick={() => execute(cmd)}>
              {cmd}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function TermRow({ entry, onRun }: { entry: Entry; onRun: (cmd: string) => void }) {
  if (entry.input) {
    return (
      <p className="term__line term__line--input">
        <span className="term__sep" aria-hidden="true">
          $
        </span>{' '}
        {entry.text}
      </p>
    );
  }
  const body = (
    <>
      <span className="term__text">{entry.text}</span>
      {entry.hint ? <span className="term__hint-col">{entry.hint}</span> : null}
    </>
  );
  if (entry.command) {
    const command = entry.command;
    return (
      <p className={`term__line tone-${entry.tone}`}>
        <button type="button" className="term__run" onClick={() => onRun(command)}>
          {body}
        </button>
      </p>
    );
  }
  return <p className={`term__line tone-${entry.tone}${entry.hint ? ' has-hint' : ''}`}>{body}</p>;
}
