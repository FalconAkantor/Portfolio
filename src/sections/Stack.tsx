import { useMemo, useState } from 'react';
import { Pane } from '../components/ui/Pane';
import { TechChip } from '../components/ui/TechChip';
import { stackCategories, tech, type TechId } from '../data/stack';
import { projects, type ProjectId } from '../data/projects';
import { useI18n } from '../i18n/context';
import { emit } from '../lib/events';
import { scrollToSection } from '../lib/scroll';
import './stack.css';

export function Stack() {
  const { t, l } = useI18n();
  const [selected, setSelected] = useState<TechId | null>(null);

  const uniqueCount = useMemo(() => new Set(stackCategories.flatMap((c) => c.items)).size, []);
  const usedBy = selected ? projects.filter((p) => p.stack.includes(selected)) : [];

  const toggle = (id: TechId) => setSelected((cur) => (cur === id ? null : id));
  const open = (id: ProjectId) => {
    emit('nacho:open-project', { id });
    scrollToSection('projects');
  };

  return (
    <Pane id="stack" title={t.stack.title} lead={t.stack.lead} meta={t.stack.count(uniqueCount)}>
      <div className="stack">
        {stackCategories.map((category) => (
          <section key={category.id} className="stack__cat" aria-labelledby={`stack-${category.id}`}>
            <h3 id={`stack-${category.id}`} className="stack__name">
              {l(category.name)}
            </h3>
            <p className="stack__purpose">{l(category.purpose)}</p>
            <ul className="chip-list">
              {category.items.map((id) => (
                <li key={id}>
                  <TechChip id={id} active={selected === id} onSelect={toggle} />
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
