import type { ProjectVisual as VisualKind } from '../../../data/projects';
import { useI18n } from '../../../i18n/context';
import { useInView } from '../../../hooks/useInView';
import { WorkspaceDemo } from './WorkspaceDemo';
import { SentinelConsole } from '../../vision/SentinelConsole';
import { ShelfFeed } from '../../vision/ShelfFeed';
import { DocsDemo } from '../../docs/DocsDemo';
import { BridgeDemo } from '../../bridge/BridgeDemo';
import '../../vision/vision.css';

/** The signature visual of each project, shown at the top of the inspector. */
export function ProjectVisual({ kind }: { kind: VisualKind }) {
  const { t } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const note = t.projects.visualNotes[kind];

  return (
    <figure ref={ref} className={`pvisual pvisual--${kind}${inView ? '' : ' is-paused'}`}>
      {kind === 'workspace' ? <WorkspaceDemo /> : null}
      {kind === 'cctv' ? <SentinelConsole active={inView} /> : null}
      {kind === 'shelf' ? (
        <div className="feed__frame pvisual__feed">
          <ShelfFeed />
        </div>
      ) : null}
      {kind === 'docs' ? <DocsDemo active={inView} /> : null}
      {kind === 'bridge' ? <BridgeDemo active={inView} /> : null}
      <figcaption className="pvisual__note mono">{note}</figcaption>
    </figure>
  );
}
