import type { ProjectVisual } from '../../data/projects';

/** Small line icon per project, used in the process table (24px grid, inherits colour). */
const paths: Record<ProjectVisual, string> = {
  workspace: 'M3 5h18v14H3zM3 9h18M6 7h.01M9 7h.01M7 12h5v4H7zM14 12h3',
  cctv: 'M3 7l12 4-2.2 4.2L1.5 11.4zM13 15l1.2 4.5M10.5 19.5h7M17 9.5l3.5-1.2',
  shelf: 'M4 3v18M20 3v18M4 9h16M4 15h16M7 5.5V9M10.5 5.5V9M8 11.5V15M14 11.5V15M16.5 17.5V21',
  rag: 'M5 3h9l5 5v13H5zM14 3v5h5M8.5 12h7M8.5 16h4',
  rack: 'M4 3h16v5H4zM4 10h16v5H4zM4 17h16v4H4zM7 5.5h.01M7 12.5h.01M10.5 5.5h6M10.5 12.5h6',
};

export function ProjectGlyph({ kind }: { kind: ProjectVisual }) {
  return (
    <svg className="pglyph" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[kind]} />
    </svg>
  );
}
