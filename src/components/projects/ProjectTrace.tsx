import { useEffect, useState } from 'react';
import type { Project } from '../../data/projects';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { formatClock, formatDate } from '../../lib/format';
import { useI18n } from '../../i18n/context';

/**
 * Illustrative log stream for a project. Printed line by line the first time it is
 * visible. Mount it with key={project.id} so each project starts a fresh stream.
 */
export function ProjectTrace({ project }: { project: Project }) {
  const { t } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>({ once: true, threshold: 0.3 });
  const reducedMotion = useReducedMotion();
  const [printed, setPrinted] = useState(0);
  const [stamp, setStamp] = useState<Date | null>(null);

  useEffect(() => {
    if (!inView) return;
    const total = project.trace.length;
    const timers: number[] = [window.setTimeout(() => setStamp(new Date()), 0)];
    if (reducedMotion) {
      timers.push(window.setTimeout(() => setPrinted(total), 0));
    } else {
      for (let i = 1; i <= total; i++) timers.push(window.setTimeout(() => setPrinted(i), 120 + i * 260));
    }
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, reducedMotion, project]);

  const date = stamp ? formatDate(stamp) : '';

  return (
    <div ref={ref} className="trace panel">
      <div className="panel__head">
        <span className="panel__title">
          {t.projects.trace} · {project.path}/log
        </span>
      </div>
      <ol className="trace__lines mono" aria-label={t.projects.trace}>
        {project.trace.map((entry, i) => {
          const time = stamp ? formatClock(new Date(stamp.getTime() + i * 1000)) : '--:--:--';
          return (
            <li key={i} className={`trace__line${i < printed ? ' is-shown' : ''} lvl-${entry.level ?? 'info'}`}>
              <span className="trace__time">{time}</span>
              <span className="trace__src">{entry.src}</span>
              <span className="trace__msg">{entry.msg.replace('{date}', date)}</span>
            </li>
          );
        })}
      </ol>
      <p className="trace__note">{t.projects.traceNote}</p>
    </div>
  );
}
