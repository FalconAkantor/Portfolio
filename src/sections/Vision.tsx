import type { JSX } from 'react';
import { Pane } from '../components/ui/Pane';
import { CctvFeed } from '../components/vision/CctvFeed';
import { ShelfFeed } from '../components/vision/ShelfFeed';
import { TechChip } from '../components/ui/TechChip';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/context';
import { emit } from '../lib/events';
import { scrollToSection } from '../lib/scroll';
import { projects, type ProjectId } from '../data/projects';
import './vision.css';

const FEEDS: { project: ProjectId; titleKey: 'feedCctv' | 'feedShelf'; Feed: () => JSX.Element }[] = [
  { project: 'cctv', titleKey: 'feedCctv', Feed: CctvFeed },
  { project: 'stock-audit', titleKey: 'feedShelf', Feed: ShelfFeed },
];

export function Vision() {
  const { t, l } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  const inspect = (id: ProjectId) => {
    emit('nacho:open-project', { id });
    scrollToSection('projects');
  };

  return (
    <Pane id="vision" title={t.vision.title} lead={t.vision.lead}>
      <div ref={ref} className={`feeds${inView ? '' : ' is-paused'}`}>
        {FEEDS.map(({ project: id, titleKey, Feed }) => {
          const project = projects.find((p) => p.id === id)!;
          return (
            <figure key={id} className="feed panel">
              <div className="panel__head">
                <span className="panel__title">{t.vision[titleKey]}</span>
                <span>{project.pid}</span>
              </div>
              <div className="feed__frame">
                <Feed />
              </div>
              <figcaption className="feed__caption">
                <ul className="chip-list">
                  {project.stack.slice(0, 6).map((tid) => (
                    <li key={tid}>
                      <TechChip id={tid} />
                    </li>
                  ))}
                </ul>
                <button type="button" className="feed__link mono" onClick={() => inspect(id)}>
                  open {project.id} <span className="feed__link-name">· {l(project.name)}</span>
                </button>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className="feeds__note mono">{t.vision.renderNote}</p>
    </Pane>
  );
}
