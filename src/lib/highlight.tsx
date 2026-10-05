import type { ReactNode } from 'react';

// ── Tiny syntax highlighter (Python / JS / YAML / shell), no dependencies ──
const TOKEN =
  /(#.*$|\/\/.*$)|((?:[frbu]|f)?"(?:[^"\\]|\\.)*"|(?:[frbu]|f)?'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(def|return|if|elif|else|for|in|not|and|or|is|None|True|False|import|from|with|as|while|await|async|const|let|new|class|try|except|yield|lambda)\b|(\b\d[\d_.]*\b)|(@[\w.]+)/g;

export function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of line.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(line.slice(last, at));
    const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'k' : m[4] ? 'n' : 'd';
    out.push(
      <span key={k++} className={`tk-${cls}`}>
        {m[0]}
      </span>,
    );
    last = at + m[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}
