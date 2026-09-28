import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';
import './systems.css';

export interface FlowStep {
  key: string;
  label: ReactNode;
  detail?: ReactNode;
}

interface PipelineFlowProps {
  steps: FlowStep[];
  /** Show step numbers (only when the steps are a real sequence). */
  numbered?: boolean;
  /** "auto": horizontal when there is room, vertical on small screens. */
  orientation?: 'auto' | 'vertical';
  label: string;
  className?: string;
}

const STEP_SECONDS = 0.7;

/**
 * A sequence of stages with a signal that travels through them.
 * The travelling highlight is pure CSS and pauses while off-screen.
 */
export function PipelineFlow({ steps, numbered = false, orientation = 'auto', label, className = '' }: PipelineFlowProps) {
  const [ref, inView] = useInView<HTMLOListElement>({ threshold: 0.25 });
  const style = { '--steps': steps.length, '--cycle': `${steps.length * STEP_SECONDS}s` } as CSSProperties;

  return (
    <ol
      ref={ref}
      className={`flow flow--${orientation}${inView ? '' : ' is-paused'} ${className}`}
      style={style}
      aria-label={label}
    >
      {steps.map((step, i) => (
        <li key={step.key} className="flow__step" style={{ '--i': i, '--delay': `${i * STEP_SECONDS}s` } as CSSProperties}>
          <span className="flow__node" aria-hidden="true" />
          <span className="flow__body">
            <span className="flow__label mono">
              {numbered ? <span className="flow__num">{String(i + 1).padStart(2, '0')}</span> : null}
              {step.label}
            </span>
            {step.detail ? <span className="flow__detail">{step.detail}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
