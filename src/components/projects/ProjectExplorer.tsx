import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { projects, type ProjectId } from '../../data/projects';
import { useI18n } from '../../i18n/context';
import { listen } from '../../lib/events';
import { StatusDot } from '../ui/StatusDot';
import { ProjectDetail } from './ProjectDetail';
import './projects.css';

/** Process table + inspector. Implements the WAI-ARIA tabs pattern (arrow keys, Home/End). */
export function ProjectExplorer() {
  const { t, l } = useI18n();
  const baseId = useId();
  const [index, setIndex] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);

  const select = (next: number, focusTab = false) => {
    const bounded = (next + projects.length) % projects.length;
    setIndex(bounded);
    if (focusTab) tabRefs.current[bounded]?.focus();
  };

  // Opened from the terminal ("open cctv") or from a #project-<id> link.
  useEffect(() => {
    const openById = (id: ProjectId) => {
      const i = projects.findIndex((p) => p.id === id);
      if (i >= 0) setIndex(i);
    };
    const fromHash = () => {
      const match = /^#project-(.+)$/.exec(window.location.hash);
      if (match) openById(match[1] as ProjectId);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    const off = listen('nacho:open-project', ({ id }) => openById(id));
    return () => {
      window.removeEventListener('hashchange', fromHash);
      off();
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: index + 1,
      ArrowRight: index + 1,
      ArrowUp: index - 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: projects.length - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next, true);
  };

  const step = (delta: number) => {
    select(index + delta);
    detailRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  };

  const project = projects[index]!;

  return (
    <div className="explorer">
      <div className="ptable panel" role="presentation">
        <div className="ptable__head mono" aria-hidden="true">
          <span>{t.projects.columns.pid}</span>
          <span>{t.projects.columns.name}</span>
          <span className="ptable__col-domain">{t.projects.columns.domain}</span>
          <span className="ptable__col-status">{t.projects.columns.status}</span>
        </div>
        <div role="tablist" aria-label={t.projects.title} aria-orientation="vertical" className="ptable__rows">
          {projects.map((p, i) => {
            const selected = i === index;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`${baseId}-tab-${p.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className={`ptable__row mono${selected ? ' is-selected' : ''}`}
                onClick={() => select(i)}
                onKeyDown={onKeyDown}
              >
                <span className="ptable__pid">
                  {p.featured ? (
                    <span className="ptable__star" aria-hidden="true">
                      ★
                    </span>
                  ) : null}
                  {p.pid}
                  {p.featured ? <span className="sr-only"> · {t.projects.featured}</span> : null}
                </span>
                <span className="ptable__name">{l(p.name)}</span>
                <span className="ptable__col-domain">{t.projects.domains[p.domain]}</span>
                <span className="ptable__col-status">
                  <StatusDot status={selected ? 'signal' : 'ok'} />
                  <span>{t.projects.online}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div ref={detailRef} className="explorer__detail">
        <ProjectDetail
          project={project}
          panelId={`${baseId}-panel`}
          tabId={`${baseId}-tab-${project.id}`}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      </div>
    </div>
  );
}
