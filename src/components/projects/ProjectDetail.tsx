import type { Project } from '../../data/projects';
import { useI18n } from '../../i18n/context';
import { PipelineFlow } from '../systems/PipelineFlow';
import { TechChip } from '../ui/TechChip';
import { StatusDot } from '../ui/StatusDot';
import { ProjectTrace } from './ProjectTrace';

interface ProjectDetailProps {
  project: Project;
  onPrev: () => void;
  onNext: () => void;
  panelId: string;
  tabId: string;
}

export function ProjectDetail({ project, onPrev, onNext, panelId, tabId }: ProjectDetailProps) {
  const { t, l } = useI18n();

  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId} className="pdetail panel panel--ticks" tabIndex={-1}>
      <header className="pdetail__bar panel__head">
        <span className="panel__title">
          <StatusDot status="ok" pulse />
          <span>
            pid {project.pid}
            <span className="pdetail__path"> · {project.path}</span>
          </span>
        </span>
        <span className="pdetail__status">
          {t.projects.domains[project.domain]} · {t.projects.online}
        </span>
      </header>

      <div className="pdetail__body">
        <div className="pdetail__intro">
          <h3 className="pdetail__name">{l(project.name)}</h3>
          <p className="pdetail__summary">{l(project.summary)}</p>
        </div>

        <dl className="hud" aria-label={t.projects.specs}>
          {project.specs.map((spec) => (
            <div key={spec.key.en} className="hud__cell">
              <dt className="mono">{l(spec.key)}</dt>
              <dd className="mono">{l(spec.value)}</dd>
            </div>
          ))}
        </dl>

        <div className="pdetail__ps">
          <section>
            <h4 className="pdetail__h">{t.projects.problem}</h4>
            <p>{l(project.problem)}</p>
          </section>
          <section>
            <h4 className="pdetail__h">{t.projects.solution}</h4>
            <p>{l(project.solution)}</p>
          </section>
        </div>

        <section>
          <h4 className="pdetail__h">{t.projects.pipeline}</h4>
          <PipelineFlow
            label={`${t.projects.pipeline}: ${l(project.name)}`}
            steps={project.pipeline.map((s, i) => ({ key: `${project.id}-${i}`, label: l(s.label), detail: l(s.detail) }))}
          />
        </section>

        <div className="pdetail__split">
          <section>
            <h4 className="pdetail__h">{t.projects.built}</h4>
            <ul className="built">
              {l(project.built).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
          <ProjectTrace key={project.id} project={project} />
        </div>

        <section>
          <h4 className="pdetail__h">{t.projects.stack}</h4>
          <ul className="chip-list">
            {project.stack.map((id) => (
              <li key={id}>
                <TechChip id={id} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="pdetail__foot">
        <button type="button" className="btn" onClick={onPrev}>
          <span aria-hidden="true">‹</span> {t.projects.previous}
        </button>
        <button type="button" className="btn" onClick={onNext}>
          {t.projects.next} <span aria-hidden="true">›</span>
        </button>
      </footer>
    </div>
  );
}
