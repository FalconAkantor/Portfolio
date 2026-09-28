import { tech, type TechId } from '../../data/stack';
import './ui.css';

interface TechChipProps {
  id: TechId;
  active?: boolean;
  onSelect?: (id: TechId) => void;
}

/** Technology label. Interactive (a toggle button) only when onSelect is given. */
export function TechChip({ id, active = false, onSelect }: TechChipProps) {
  const label = tech[id].label;
  if (!onSelect) return <span className="chip mono">{label}</span>;
  return (
    <button
      type="button"
      className={`chip chip--button mono${active ? ' is-active' : ''}`}
      aria-pressed={active}
      onClick={() => onSelect(id)}
    >
      {label}
    </button>
  );
}
