import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { networkEdges, networkLayouts, networkNodes, type NetworkNode, type NetworkNodeId } from '../../data/network';
import { edgePath, nodeWidthFor, type LayoutName } from '../../lib/graph';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { useI18n } from '../../i18n/context';
import { TechChip } from '../ui/TechChip';
import './systems.css';

const nodeById = new Map(networkNodes.map((n) => [n.id, n]));

function isConnected(edge: (typeof networkEdges)[number], id: NetworkNodeId) {
  return edge.from === id || edge.to === id;
}

/**
 * The integration map: inputs → AI → storage → automation → outputs, watched by monitoring.
 * Two real layouts (wide for desktop, tall for phones) switched in CSS, so there is
 * no layout shift and nothing to measure in JavaScript.
 */
export function IntegrationGraph() {
  const { t, l } = useI18n();
  const [selected, setSelected] = useState<NetworkNodeId>('ai');
  const [wrapRef, inView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const reducedMotion = useReducedMotion();
  const svgRefs = useRef<(SVGSVGElement | null)[]>([]);

  // Pause SMIL packet animations while the graph is off-screen.
  useEffect(() => {
    for (const svg of svgRefs.current) {
      if (!svg || typeof svg.pauseAnimations !== 'function') continue;
      if (inView) svg.unpauseAnimations();
      else svg.pauseAnimations();
    }
  }, [inView]);

  const current = nodeById.get(selected)!;

  const renderLayout = (layout: LayoutName, index: number) => {
    const { width, height, nodeWidth: w, nodeHeight: h } = networkLayouts[layout];
    const prefix = `net-${layout}`;
    return (
      <svg
        key={layout}
        ref={(el) => {
          svgRefs.current[index] = el;
        }}
        className={`net net--${layout}`}
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={t.network.title}
      >
        <g className="net__edges" aria-hidden="true">
          {networkEdges.map((edge) => {
            const id = `${prefix}-${edge.from}-${edge.to}`;
            const hot = isConnected(edge, selected);
            return (
              <path
                key={id}
                id={id}
                d={edgePath(edge, nodeById.get(edge.from)!, nodeById.get(edge.to)!, layout)}
                className={`net__edge net__edge--${edge.kind}${hot ? ' is-hot' : ''}`}
              />
            );
          })}
        </g>

        {!reducedMotion ? (
          <g className="net__packets" aria-hidden="true">
            {networkEdges
              .filter((e) => e.kind === 'data')
              .map((edge, i) => {
                const id = `${prefix}-${edge.from}-${edge.to}`;
                const hot = isConnected(edge, selected);
                return (
                  <circle key={id} r={hot ? 3 : 2.2} className={`net__packet${hot ? ' is-hot' : ''}`}>
                    <animateMotion dur={`${2.6 + (i % 4) * 0.35}s`} begin={`-${((i * 0.41) % 2.6).toFixed(2)}s`} repeatCount="indefinite">
                      <mpath href={`#${id}`} />
                    </animateMotion>
                  </circle>
                );
              })}
          </g>
        ) : null}

        <g className="net__nodes">
          {networkNodes.map((node) => (
            <GraphNode
              key={node.id}
              node={node}
              layout={layout}
              w={nodeWidthFor(node, layout, w)}
              h={h}
              active={node.id === selected}
              linked={networkEdges.some((e) => isConnected(e, selected) && isConnected(e, node.id))}
              label={l(node.label)}
              onSelect={setSelected}
            />
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div ref={wrapRef} className={`netwrap${inView ? '' : ' is-paused'}`}>
      <p className="sr-only">{t.network.summary}</p>
      <div className="netwrap__canvas panel">
        <div className="panel__head">
          <span className="panel__title">integration.map</span>
          <span className="netwrap__legend">
            <span className="legend legend--data">{t.network.legendData}</span>
            <span className="legend legend--watch">{t.network.legendWatch}</span>
          </span>
        </div>
        <div className="netwrap__svg">
          {renderLayout('wide', 0)}
          {renderLayout('tall', 1)}
        </div>
      </div>

      <aside className="netinfo panel panel--ticks" aria-live="polite">
        <div className="panel__head">
          <span className="panel__title">node://{current.id}</span>
          <span className="netinfo__role">{t.network.roles[current.role]}</span>
        </div>
        <div className="netinfo__body">
          <p className="netinfo__name">{l(current.label)}</p>
          <p className="netinfo__desc">{l(current.description)}</p>
          <ul className="chip-list">
            {current.tech.map((id) => (
              <li key={id}>
                <TechChip id={id} />
              </li>
            ))}
          </ul>
          <p className="netinfo__hint mono">{t.network.hint}</p>
        </div>
      </aside>
    </div>
  );
}

interface GraphNodeProps {
  node: NetworkNode;
  layout: LayoutName;
  w: number;
  h: number;
  active: boolean;
  linked: boolean;
  label: string;
  onSelect: (id: NetworkNodeId) => void;
}

function GraphNode({ node, layout, w, h, active, linked, label, onSelect }: GraphNodeProps) {
  const { x, y } = node[layout];
  const onKey = (e: KeyboardEvent<SVGGElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(node.id);
    }
  };
  return (
    <g
      className={`net__node net__node--${node.role}${active ? ' is-active' : ''}${linked && !active ? ' is-linked' : ''}`}
      transform={`translate(${x - w / 2} ${y - h / 2})`}
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={label}
      onClick={() => onSelect(node.id)}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') onSelect(node.id);
      }}
      onFocus={() => onSelect(node.id)}
      onKeyDown={onKey}
    >
      <rect width={w} height={h} rx={3} />
      <circle className="net__led" cx={11} cy={h / 2} r={2.5} />
      <text x={w / 2 + 6} y={h / 2} dominantBaseline="central" textAnchor="middle">
        {label}
      </text>
    </g>
  );
}
