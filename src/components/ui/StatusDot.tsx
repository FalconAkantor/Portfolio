import './ui.css';

type Status = 'ok' | 'signal' | 'flow' | 'rec' | 'idle';

/** Small LED. Decorative: the adjacent text always carries the meaning. */
export function StatusDot({ status = 'ok', pulse = false }: { status?: Status; pulse?: boolean }) {
  return <span className={`led led--${status}${pulse ? ' led--pulse' : ''}`} aria-hidden="true" />;
}
