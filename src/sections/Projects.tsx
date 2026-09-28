import { Pane } from '../components/ui/Pane';
import { ProjectExplorer } from '../components/projects/ProjectExplorer';
import { useI18n } from '../i18n/context';
import { projects } from '../data/projects';

export function Projects() {
  const { t } = useI18n();
  return (
    <Pane id="projects" title={t.projects.title} lead={t.projects.lead} meta={`ps · ${String(projects.length).padStart(2, '0')} running`}>
      <ProjectExplorer />
    </Pane>
  );
}
