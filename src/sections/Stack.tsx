import { useMemo, useState } from 'react';
import { Pane } from '../components/ui/Pane';
import { TechLogo } from '../components/ui/TechLogo';
import { stackCategories, tech, type TechId } from '../data/stack';
import { projects, type ProjectId } from '../data/projects';
import { useI18n } from '../i18n/context';
import { emit } from '../lib/events';
import { scrollToSection } from '../lib/scroll';
import './stack.css';

/**
 * The toolbox as a two-way map: point at a project and its technologies light up;
 * pick a technology and the projects that use it light up.
 */
export function Stack() {
  const { t, l } = useI18n();
  const [selected, setSelected] = useState<TechId | null>(null);
  const [focus, setFocus] = useState<ProjectId | null>(null);

  const uniqueCount = useMemo(() => new Set(stackCategories.flatMap((c) => c.items)).size, []);
  const focused = focus ? projects.find((p) => p.id === focus) : undefined;
  const usedBy = selected ? projects.filter((p) => p.stack.includes(selected)) : [];

  const toggle = (id: TechId) => {
    setFocus(null);
    setSelected((cur) => (cur === id ? null : id));
  };
  const open = (id: ProjectId) => {
    emit('automariza:open-project', { id });
    scrollToSection('projects');
  };

  const chipState = (id: TechId) => {
    if (selected) return selected === id ? ' is-active' : '';
    if (focused) return focused.stack.includes(id) ? ' is-linked' : ' is-dim';
    return '';
  };
  const projectState = (id: ProjectId, stack: TechId[]) => {
    if (selected) return stack.includes(selected) ? ' is-lit' : ' is-dim';
    if (focus) return focus === id ? ' is-lit' : ' is-dim';
    return '';
  };

  return (
    <Pane id="stack" title={t.stack.title} lead={t.stack.lead} meta={t.stack.count(uniqueCount)}>
      <div className="constel" onMouseLeave={() => setFocus(null)}>
        <p className="constel__label mono">{selected ? `${tech[selected].label} → ${t.stack.usedIn}` : t.stack.mapHint}</p>
        <ul className="constel__list">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={`constel__node${projectState(p.id, p.stack)}`}
                aria-pressed={focus === p.id}
                onMouseEnter={() => !selected && setFocus(p.id)}
                onFocus={() => !selected && setFocus(p.id)}
                onClick={() => {
                  if (selected) open(p.id);
                  else setFocus((cur) => (cur === p.id ? null : p.id));
                }}
              >
                <span className="constel__pid mono">{p.pid}</span>
                <span className="constel__name">{l(p.name)}</span>
                <span className="constel__count mono">{t.stack.techCount(p.stack.length)}</span>
              </button>
            </li>
          ))}
        </ul>
        {focused && !selected ? (
          <button type="button" className="constel__open mono" onClick={() => open(focused.id)}>
            {t.stack.openProject(l(focused.name))} ›
          </button>
        ) : null}
      </div>

      <div className="stack">
        {stackCategories.map((category) => (
          <section key={category.id} className="stack__cat" aria-labelledby={`stack-${category.id}`}>
            <header className="stack__head">
              <h3 id={`stack-${category.id}`} className="stack__name">
                {l(category.name)}
              </h3>
              <span className="stack__n mono" aria-hidden="true">
                {String(category.items.length).padStart(2, '0')}
              </span>
            </header>
            <p className="stack__purpose">{l(category.purpose)}</p>
            <ul className="tools">
              {category.items.map((id) => (
                <li key={id}>
                  <button type="button" className={`tool${chipState(id)}`} aria-pressed={selected === id} onClick={() => toggle(id)}>
                    <TechLogo id={id} />
                    <span className="tool__label">{tech[id].label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className={`xref panel${selected ? ' is-open' : ''}`} aria-live="polite">
        {selected ? (
          <>
            <div className="panel__head">
              <span className="panel__title">
                grep -r &quot;{tech[selected].label}&quot; /srv
              </span>
              <button type="button" className="xref__clear mono" onClick={() => setSelected(null)}>
                {t.stack.clear}
              </button>
            </div>
            <div className="xref__body">
              {usedBy.length ? (
                <>
                  <p className="xref__label mono">{t.stack.usedIn}</p>
                  <ul className="xref__list">
                    {usedBy.map((p) => (
                      <li key={p.id}>
                        <button type="button" className="xref__project" onClick={() => open(p.id)}>
                          <span className="mono">{p.pid}</span> {l(p.name)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="xref__none">{t.stack.general}</p>
              )}
            </div>
          </>
        ) : (
          <p className="xref__idle mono">{t.stack.idle}</p>
        )}
      </div>
    </Pane>
  );
}
