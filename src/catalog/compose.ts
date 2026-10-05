import type { CatalogIndex, ProjectData, ProjectPageData } from './types';

/** Everything a project page shows besides its own data: suite, siblings and neighbours. */
export function composeProjectPage(index: CatalogIndex, project: ProjectData): ProjectPageData {
  const all = index.projects;
  const at = all.findIndex((p) => p.slug === project.ficha.slug);
  const self = all[at];
  const suiteSlug = self?.kind === 'suite' ? self.slug : (self?.parent ?? null);
  const suite = suiteSlug ? (all.find((p) => p.slug === suiteSlug) ?? null) : null;
  const suiteTools = index.suites.find((s) => s.slug === suiteSlug)?.tools ?? [];
  const siblings = suiteTools
    .filter((slug) => slug !== project.ficha.slug)
    .map((slug) => all.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  return {
    project,
    suite,
    siblings,
    prev: at > 0 ? (all[at - 1] ?? null) : null,
    next: at >= 0 ? (all[at + 1] ?? null) : null,
  };
}
