import type { ProjectVisual as VisualKind } from '../../../data/projects';
import { useI18n } from '../../../i18n/context';
import { useInView } from '../../../hooks/useInView';
import { WorkspaceDemo } from './WorkspaceDemo';
import { CctvFeed } from '../../vision/CctvFeed';
import { ShelfFeed } from '../../vision/ShelfFeed';
import { RagSimulator } from '../../ai/RagSimulator';
import { Rack } from '../../infra/Rack';
import { SignalGrid } from '../../infra/SignalGrid';
import '../../vision/vision.css';
import '../../infra/infra.css';

/** The signature visual of each project, shown at the top of the inspector. */
export function ProjectVisual({ kind }: { kind: VisualKind }) {
  const { t } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const note = t.projects.visualNotes[kind];

  return (
    <figure ref={ref} className={`pvisual pvisual--${kind}${inView ? '' : ' is-paused'}`}>
      {kind === 'workspace' ? <WorkspaceDemo /> : null}
      {kind === 'cctv' || kind === 'shelf' ? (
        <div className="feed__frame pvisual__feed">{kind === 'cctv' ? <CctvFeed /> : <ShelfFeed />}</div>
      ) : null}
      {kind === 'rag' ? <RagSimulator /> : null}
      {kind === 'rack' ? (
        <div className="pvisual__rack">
          <Rack />
          <div className="panel">
            <SignalGrid />
          </div>
        </div>
      ) : null}
      {kind === 'rag' ? null : <figcaption className="pvisual__note mono">{note}</figcaption>}
    </figure>
  );
}
