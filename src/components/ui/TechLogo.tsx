import { techLogos } from '../../data/techLogos';
import { tech, type TechId } from '../../data/stack';

/**
 * Small brand mark for a technology (Simple Icons paths, 24×24), tinted a little
 * toward the brand colour. Technologies without a public mark get a monogram.
 */
export function TechLogo({ id }: { id: TechId }) {
  const logo = techLogos[id];
  if (!logo) {
    const letters = tech[id].label.replace(/[^A-Za-z0-9]/g, '').slice(0, 2);
    return (
      <span className="logo logo--mono mono" aria-hidden="true">
        {letters}
      </span>
    );
  }
  return (
    <svg className="logo" viewBox="0 0 24 24" aria-hidden="true" style={{ ['--brand' as string]: `#${logo.hex}` }}>
      <path d={logo.path} />
    </svg>
  );
}
