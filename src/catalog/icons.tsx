/** Line icons for the catalogue (24×24, stroke = currentColor; sized by .cglyph). */
export function Glyph({ d, className = '' }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`cglyph ${className}`} aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

export const ICON = {
  ai: 'M12 3l1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4z M18 15l.9 2.1L21 18l-2.1.9L18 21l-.9-2.1L15 18l2.1-.9z M5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z',
  archive: 'M3 4h18v5H3z M5 9v11h14V9 M10 13h4',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  bell: 'M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z M10 20.5a2 2 0 0 0 4 0',
  camera: 'M4 8h3.2l1.8-3h6l1.8 3H20v11H4z M12 10.5a3.25 3.25 0 1 0 0 6.5a3.25 3.25 0 1 0 0-6.5z',
  chart: 'M4 20V10 M10 20V4 M16 20v-7 M21 20H3',
  chat: 'M4 5h16v11H9.5L4 20z M8 9.5h8 M8 12.5h5',
  check: 'M4.5 12.5l4.5 4.5L19.5 6.5',
  clock: 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 7v5l3.5 2',
  doc: 'M6 2h9l5 5v15H6z M15 2v5h5 M9 13h8 M9 17h6',
  download: 'M12 4v11.5 M7.5 11L12 15.5l4.5-4.5 M4 15v5h16v-5',
  edit: 'M4 20h4L19.5 8.5l-4-4L4 16z M13.5 6.5l4 4',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z',
  filter: 'M3.5 5h17l-6.5 7.5v6l-4 1.5v-7.5z',
  grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
  link: 'M7 7h4v4H7z M13 13h4v4h-4z M11 9h3a3 3 0 0 1 3 3v1 M9 11v3a3 3 0 0 0 3 3h1',
  lock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3 M12 14.5v2',
  mail: 'M3.5 5.5h17v13h-17z M3.5 6l8.5 7 8.5-7',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5.5 11.5a6.5 6.5 0 0 0 13 0 M12 18v3',
  move: 'M4 8.5h14.5L15 5 M20 15.5H5.5L9 19',
  play: 'M7.5 4.5l12 7.5-12 7.5z',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 1 0 0-13z M15.3 15.3L20 20',
  send: 'M3.5 11.5L20.5 4l-6.5 16.5-3-6.5z M11 14l3.5-3.5',
  shield: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z M9 12l2 2 4-4',
  sliders: 'M4 7h9 M17 7h3 M15 5v4 M4 17h3 M11 17h9 M9 15v4',
  undo: 'M9 14.5L4 9.5l5-5 M4 9.5h10.5a5.5 5.5 0 0 1 0 11H11',
  upload: 'M12 15.5V4 M7.5 8.5L12 4l4.5 4.5 M4 15v5h16v-5',
  user: 'M12 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8z M4.5 20.5c.5-3.9 3.6-6.5 7.5-6.5s7 2.6 7.5 6.5',
  core: 'M8 8h8v8H8z M10 4v4 M14 4v4 M10 16v4 M14 16v4 M4 10h4 M4 14h4 M16 10h4 M16 14h4',
} as const;

export type IconName = keyof typeof ICON;

/**
 * An icon for a «how it works» step, guessed from its (Spanish) title: the steps are short verbs
 * such as «Buscar», «Avisar» or «Analizar con IA». The first rule that matches wins.
 */
const RULES: [RegExp, IconName][] = [
  [/\bia\b|inteligen|aprend|clasific|entend|comprend|interpret|recomend|estructur|resum|explic/, 'ai'],
  [/dict|transcrib|\bvoz\b|audio/, 'mic'],
  [/foto|escane|camara|papel|captar|captur/, 'camera'],
  [/correo|\bmail/, 'mail'],
  [/avis|alert|escalad|notific|rotulo/, 'bell'],
  [/envi|publi|comunic|difus|anuncio|inform/, 'send'],
  [/deshac|revert|restaur|rearm|recuper/, 'undo'],
  [/vigil|sonde|\bping\b|monitor|segui/, 'eye'],
  [/pregunt|mensaje|chat|respuesta|consult/, 'chat'],
  [/busc|busqueda|encontr/, 'search'],
  [/filtr|exclu|segment|periodo|rango/, 'filter'],
  [/calcul|analiz|analisis|compar|medir|kpi|ranking|estadist|precio|margen|valor|productividad|cifra/, 'chart'],
  [/revis|valid|verific|confirm|firma|cerrar|finaliz|justific/, 'check'],
  [/export|descarg|llevar|\bpdf\b/, 'download'],
  [/recib|entrada|subir|import|carga|arrastr|soltar|recoger|lectura/, 'upload'],
  [/registr|guardar|expedient|inventari|histori|trazab|serie|linea base/, 'archive'],
  [/program|horari|ciclo|rotar|arranq|fase|fecha|retras|automatic/, 'clock'],
  [/elegir|elig|configur|defin|modo|regla|plantilla|tipo|prioridad|indicar|ventana/, 'sliders'],
  [/acce|login|autoriz|entrar|\brol\b|alta|identific/, 'user'],
  [/unir|cruz|cruce|conect|integr|enrut/, 'link'],
  [/edit|corrig|correg|marc|anot|rellen|escrib|crear|anad|actualiz|gestion/, 'edit'],
  [/mov|trasp|trasl|reempl|repart|asign|liberar|deleg|sustitu|material/, 'move'],
  [/catalog|panel|escritorio|organiz|agrup|\bver\b|explor|plano|lista|detalle|3d|2d|vista|cartera|tarifa/, 'grid'],
  [/proteg|emergen|crisis|segur|bolsa|autodestru/, 'shield'],
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function stepIcon(title: string): string {
  const t = norm(title);
  return ICON[RULES.find(([re]) => re.test(t))?.[1] ?? 'play'];
}
