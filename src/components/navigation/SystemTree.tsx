import type { MouseEvent } from 'react';
import { sections, type SectionId } from '../../data/navigation';
import { useI18n } from '../../i18n/context';
import { scrollToSection } from '../../lib/scroll';
import './navigation.css';

interface SystemTreeProps {
  active: SectionId;
  onNavigate?: () => void;
  /** Accessible name of the <nav> landmark. */
  label: string;
  id?: string;
}

/** The site map drawn as a file tree. Used by the desktop rail and the mobile sheet. */
export function SystemTree({ active, onNavigate, label, id }: SystemTreeProps) {
  const { l } = useI18n();

  const go = (event: MouseEvent<HTMLAnchorElement>, target: SectionId) => {
    event.preventDefault();
    scrollToSection(target);
    onNavigate?.();
  };

  return (
    <nav className="tree mono" aria-label={label} id={id}>
      <p className="tree__root" aria-hidden="true">
        SYSTEM
      </p>
      <ol className="tree__list">
        {sections.map((s, i) => {
          const last = i === sections.length - 1;
          const isActive = s.id === active;
          return (
            <li key={s.id} className={`tree__item${isActive ? ' is-active' : ''}`}>
              <a href={`#${s.id}`} onClick={(e) => go(e, s.id)} aria-current={isActive ? 'location' : undefined}>
                <span className="tree__branch" aria-hidden="true">
                  {last ? '└──' : '├──'}
                </span>
                <span className="tree__node" aria-hidden="true">
                  {s.node}
                </span>
                <span className="tree__label">{l(s.label)}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
