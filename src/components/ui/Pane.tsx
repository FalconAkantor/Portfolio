import type { ReactNode } from 'react';
import { sections, type SectionId } from '../../data/navigation';
import './ui.css';

interface PaneProps {
  id: SectionId;
  title: ReactNode;
  lead?: ReactNode;
  /** Right-aligned module metadata in the pane bar. */
  meta?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** A section of the page, framed as a module of the system: path bar, title, lead, body. */
export function Pane({ id, title, lead, meta, children, className }: PaneProps) {
  const index = sections.findIndex((s) => s.id === id);
  const node = sections[index]?.node ?? id;
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={headingId} className={`pane${className ? ` ${className}` : ''}`}>
      <div className="pane__bar mono" aria-hidden="true">
        <span className="pane__path">
          <span className="pane__tilde">~/system/</span>
          {node}
        </span>
        <span className="pane__rule" />
        <span className="pane__meta">
          {meta ?? `mod ${String(index).padStart(2, '0')}`}
        </span>
      </div>
      <header className="pane__head">
        <h2 id={headingId} className="pane__title">
          {title}
        </h2>
        {lead ? <p className="pane__lead">{lead}</p> : null}
      </header>
      {children}
    </section>
  );
}
