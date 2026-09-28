import { site } from '../../config/site';
import './ui.css';

/** AUTOMA·R·IZA — the brand with its reasoning R lit. Screen readers get the plain name. */
export function Wordmark({ className = '' }: { className?: string }) {
  const { name, accentIndex } = site.brand;
  return (
    <span className={`wordmark ${className}`} aria-label={name} role="img">
      <span aria-hidden="true">{name.slice(0, accentIndex)}</span>
      <span className="wordmark__r" aria-hidden="true">
        {name[accentIndex]}
      </span>
      <span aria-hidden="true">{name.slice(accentIndex + 1)}</span>
    </span>
  );
}
