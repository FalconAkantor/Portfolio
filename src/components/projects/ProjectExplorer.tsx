import { useEffect, useId, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { projects, type ProjectId } from '../../data/projects';
import { useI18n } from '../../i18n/context';
import { listen } from '../../lib/events';
import { prefersReducedMotion } from '../../lib/motion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { StatusDot } from '../ui/StatusDot';
import { ProjectDetail } from './ProjectDetail';
import './projects.css';

/**
 * Wide screens: process table + inspector (WAI-ARIA tabs).
 * Phones and tablets: an accordion — the project opens inside the card you tapped,
 * and the page scrolls to it, so it is always obvious what just opened.
 */
export function ProjectExplorer() {
  const compact = useMediaQuery('(max-width: 1279px)');
  const [index, setIndex] = useState(0);
  // Accordion only: which card is open (null = all closed).
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const headRefs = useRef<(HTMLElement | null)[]>([]);
  const pendingScroll = useRef<number | null>(null);

  const openCard = (i: number | null, scroll = true) => {
    setOpenIndex(i);
    if (i !== null) {
      setIndex(i);
      if (scroll) pendingScroll.current = i;
    }
  };

  // After the accordion re-renders (the previous card collapsed), bring the opened card to the top.
  useEffect(() => {
    const i = pendingScroll.current;
    if (i === null) return;
    pendingScroll.current = null;
    const el = headRefs.current[i];
    if (!el) return;
    requestAnimationFrame(() => el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' }));
  }, [openIndex]);

  // Opened from the terminal ("open cctv") or from a #project-<id> link.
  useEffect(() => {
    const openById = (id: ProjectId) => {
      const i = projects.findIndex((p) => p.id === id);
      if (i < 0) return;
      setIndex(i);
      setOpenIndex(i);
      // Let the section scroll finish first, then land on the card itself.
      window.setTimeout(() => {
        if (window.matchMedia('(max-width: 1279px)').matches) headRefs.current[i]?.scrollIntoView({ block: 'start' });
      }, 450);
    };
    const fromHash = () => {
      const match = /^#project-(.+)$/.exec(window.location.hash);
      if (match) openById(match[1] as ProjectId);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    const off = listen('automariza:open-project', ({ id }) => openById(id));
    return () => {
      window.removeEventListener('hashchange', fromHash);
      off();
    };
  }, []);

  return compact ? (
    <Accordion openIndex={openIndex} onToggle={openCard} headRefs={headRefs} />
  ) : (
    <Tabs index={index} onSelect={setIndex} />
  );
}

/* ── Wide: table + inspector ─────────────────────────────────────── */

function Tabs({ index, onSelect }: { index: number; onSelect: (i: number) => void }) {
  const { t, l } = useI18n();
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);

  const select = (next: number, focusTab = false) => {
    const bounded = (next + projects.length) % projects.length;
    onSelect(bounded);
    if (focusTab) tabRefs.current[bounded]?.focus();
  };

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
    detailRef.current?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const project = projects[index]!;

  return (
    <div className="explorer">
      <div className="ptable panel" role="presentation">
        <div className="ptable__head mono" aria-hidden="true">
          <span>{t.projects.columns.pid}</span>
          <span>{t.projects.columns.name}</span>
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
                <span className="ptable__pid">{p.pid}</span>
                <span className="ptable__name">
                  <span className="ptable__title">{l(p.name)}</span>
                  <span className="ptable__tagline">{l(p.tagline)}</span>
                </span>
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
          labelledBy={`${baseId}-tab-${project.id}`}
          role="tabpanel"
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      </div>
    </div>
  );
}

/* ── Compact: accordion ──────────────────────────────────────────── */

interface AccordionProps {
  openIndex: number | null;
  onToggle: (i: number | null, scroll?: boolean) => void;
  headRefs: RefObject<(HTMLElement | null)[]>;
}

function Accordion({ openIndex, onToggle, headRefs }: AccordionProps) {
  const { t, l } = useI18n();
  const baseId = useId();
  const total = projects.length;

  return (
    <ol className="pacc">
      {projects.map((p, i) => {
        const open = i === openIndex;
        const headId = `${baseId}-head-${p.id}`;
        const panelId = `${baseId}-panel-${p.id}`;
        return (
          <li
            key={p.id}
            className={`pacc__item panel${open ? ' is-open' : ''}`}
            ref={(el) => {
              headRefs.current[i] = el;
            }}
          >
            <h3 className="pacc__h">
              <button
                id={headId}
                type="button"
                className="pacc__head"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => onToggle(open ? null : i)}
              >
                <span className="pacc__meta mono">
                  <span className="pacc__pid">{p.pid}</span>
                  <span className="pacc__count">
                    {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                  </span>
                  <span className="pacc__state">
                    <StatusDot status={open ? 'signal' : 'ok'} />
                    {open ? t.projects.close : t.projects.open}
                    <span className="pacc__chev" aria-hidden="true">
                      ▾
                    </span>
                  </span>
                </span>
                <span className="pacc__name">{l(p.name)}</span>
                <span className="pacc__tagline">{l(p.tagline)}</span>
              </button>
            </h3>
            {open ? (
              <div className="pacc__panel">
                <ProjectDetail
                  project={p}
                  panelId={panelId}
                  labelledBy={headId}
                  role="region"
                  compact
                  onPrev={() => onToggle((i - 1 + total) % total)}
                  onNext={() => onToggle((i + 1) % total)}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
