import { useEffect, useMemo, useRef, useState } from 'react';
import { ragQueries, ragStages } from '../../data/ai';
import { useI18n } from '../../i18n/context';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { hashString, seeded } from '../../lib/random';

const STAGE_MS = 650;
const VECTOR_BARS = 48;

/**
 * Visual walkthrough of a RAG query. Nothing is computed or sent anywhere:
 * the stages, the vector and the passage ids are generated for illustration.
 */
export function RagSimulator() {
  const { t, l } = useI18n();
  const reducedMotion = useReducedMotion();
  const [queryId, setQueryId] = useState(ragQueries[0]!.id);
  // -1: idle · 0..n-1: running stage · n: done
  const [stage, setStage] = useState(-1);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const run = () => {
    clear();
    if (reducedMotion) {
      setStage(ragStages.length);
      return;
    }
    setStage(0);
    ragStages.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStage(i + 1), (i + 1) * STAGE_MS));
    });
  };

  const choose = (id: string) => {
    clear();
    setQueryId(id);
    setStage(-1);
  };

  const query = ragQueries.find((q) => q.id === queryId)!;
  const { vector, passages } = useMemo(() => {
    const rand = seeded(hashString(queryId));
    return {
      vector: Array.from({ length: VECTOR_BARS }, () => rand() * 2 - 1),
      passages: Array.from({ length: 4 }, () => `chunk#${Math.floor(rand() * 0xffff).toString(16).padStart(4, '0')}`),
    };
  }, [queryId]);

  const running = stage >= 0 && stage < ragStages.length;
  const done = stage >= ragStages.length;

  return (
    <div className="rag panel panel--ticks">
      <div className="panel__head">
        <span className="panel__title">rag.pipeline</span>
        <span className={done ? 'rag__state is-done' : 'rag__state'}>
          {done ? t.ai.done : running ? t.ai.running : t.ai.waiting}
        </span>
      </div>

      <div className="rag__body">
        <fieldset className="rag__queries">
          <legend className="rag__legend mono">{t.ai.pickQuestion}</legend>
          {ragQueries.map((q) => (
            <label key={q.id} className={`rag__query${q.id === queryId ? ' is-active' : ''}`}>
              <input type="radio" name="rag-query" value={q.id} checked={q.id === queryId} onChange={() => choose(q.id)} />
              <span>{l(q.question)}</span>
            </label>
          ))}
        </fieldset>

        <button type="button" className="btn btn--primary rag__run" onClick={run} disabled={running}>
          {running ? t.ai.running : done ? t.ai.runAgain : t.ai.run}
        </button>

        <ol className="rag__stages mono" aria-live="polite">
          {ragStages.map((s, i) => {
            const state = stage > i ? 'done' : stage === i ? 'active' : 'idle';
            return (
              <li key={s.id} className={`rag__stage is-${state}`}>
                <span className="rag__mark" aria-hidden="true">
                  {state === 'done' ? '■' : state === 'active' ? '▣' : '□'}
                </span>
                <span className="rag__label">{l(s.label)}</span>
                <span className="rag__out">{state === 'done' ? l(s.output) : state === 'active' ? '…' : ''}</span>
                {s.id === 'embed' && state !== 'idle' ? (
                  <span className="rag__vector" aria-hidden="true">
                    {vector.map((v, j) => (
                      <span key={j} style={{ height: `${Math.abs(v) * 100}%`, opacity: v > 0 ? 0.9 : 0.45 }} />
                    ))}
                  </span>
                ) : null}
                {s.id === 'search' && state === 'done' ? (
                  <span className="rag__passages" aria-hidden="true">
                    {passages.map((p) => (
                      <span key={p}>{p}</span>
                    ))}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>

        {done ? (
          <p className="rag__answer">
            <span className="mono">answer ›</span> “{l(query.question)}” — {l(ragStages[ragStages.length - 1]!.output)}:{' '}
            <span className="mono">{passages.slice(0, 3).join(', ')}</span>
          </p>
        ) : null}
        <p className="rag__note">{t.ai.ragNote}</p>
      </div>
    </div>
  );
}
