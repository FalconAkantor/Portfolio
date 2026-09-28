/**
 * AUTOMARIZA shell — a small, pure command interpreter.
 * It knows nothing about React or the DOM: it turns an input string into
 * output lines plus "effects" that the UI layer applies (navigate, open a project…).
 */
import { site } from '../../config/site';
import { sections, isSectionId, type SectionId } from '../../data/navigation';
import { findProject, projects, type ProjectId } from '../../data/projects';
import { stackCategories, tech } from '../../data/stack';
import { contactChannels } from '../contact';
import { formatDate, formatDuration, formatClock, formatUtcOffset } from '../format';
import type { UIStrings } from '../../i18n/ui';
import { isLang, type Lang } from '../../i18n/types';

export type Tone = 'default' | 'dim' | 'accent' | 'flow' | 'ok' | 'error';

export interface TermLine {
  tone: Tone;
  text: string;
  /** Optional second column (descriptions in help, names in listings). */
  hint?: string;
  /** When set, the line is rendered as a button that runs this command. */
  command?: string;
}

export type TermEffect =
  | { type: 'clear' }
  | { type: 'open-project'; id: ProjectId }
  | { type: 'navigate'; section: SectionId }
  | { type: 'lang'; lang: Lang }
  | { type: 'reboot' };

export interface TermContext {
  lang: Lang;
  /** Resolve a localized value in the active language. */
  l: <T>(value: Record<Lang, T>) => T;
  t: UIStrings;
  history: readonly string[];
  sessionStart: number;
  now: Date;
}

export interface TermResult {
  lines: TermLine[];
  effects: TermEffect[];
}

interface Command {
  name: keyof UIStrings['terminal']['commands'];
  aliases?: string[];
  run: (args: string[], ctx: TermContext) => TermResult;
}

const line = (text: string, tone: Tone = 'default', hint?: string): TermLine =>
  hint === undefined ? { tone, text } : { tone, text, hint };
const result = (lines: TermLine[], effects: TermEffect[] = []): TermResult => ({ lines, effects });
const listOf = (items: string[], tone: Tone = 'default') => items.map((text) => line(text, tone));
/** Clickable follow-up, e.g. "goto ai". */
const link = (command: string, hint: string): TermLine => ({ tone: 'flow', text: command, hint, command });
const section = (id: SectionId, ctx: TermContext) => link(`goto ${id}`, ctx.t.terminal.seeMore);
const inspect = (id: ProjectId, ctx: TermContext) => link(`open ${id}`, ctx.t.terminal.inspect);

const commands: Command[] = [
  {
    name: 'help',
    aliases: ['?', 'man'],
    run: (_args, { t }) =>
      result([
        line(t.terminal.help, 'accent'),
        ...commands.map((c) => line(c.name, 'flow', t.terminal.commands[c.name])),
      ]),
  },
  {
    name: 'about',
    run: (_a, ctx) => result([...listOf(ctx.t.terminal.about), section('about', ctx)]),
  },
  {
    name: 'brand',
    aliases: ['automariza', 'r'],
    run: (_a, ctx) =>
      result([
        line(`AUTOMA[R]IZA — ${ctx.l(site.brand.meaning)}.`, 'accent'),
        line(ctx.l(site.brand.story), 'default'),
        section('about', ctx),
      ]),
  },
  {
    name: 'projects',
    aliases: ['ps'],
    run: (_a, { t, lang }) =>
      result([
        line(t.terminal.projectsFound, 'accent'),
        ...projects.map((p, i) => ({
          ...line(`${String(i + 1).padStart(2, '0')} / ${p.name[lang].toUpperCase()}`, 'default', `${p.pid} · ${t.projects.domains[p.domain]}`),
          command: `open ${p.id}`,
        })),
        line(t.terminal.openHint, 'dim'),
      ]),
  },
  {
    name: 'open',
    aliases: ['cat', 'inspect'],
    run: (args, { t, lang }) => {
      const query = args.join(' ');
      if (!query) return result([line(t.terminal.usageOpen, 'error')]);
      const project = findProject(query);
      if (!project) return result([line(t.terminal.noProject(query), 'error')]);
      return result(
        [line(t.terminal.opening(project.name[lang]), 'ok'), line(project.summary[lang], 'dim')],
        [{ type: 'open-project', id: project.id }],
      );
    },
  },
  {
    name: 'stack',
    run: (args, ctx) => {
      const { t, lang } = ctx;
      const wanted = args[0]?.toLowerCase();
      const categories = wanted
        ? stackCategories.filter((c) => c.id === wanted || c.name.en.toLowerCase().startsWith(wanted))
        : stackCategories;
      if (categories.length === 0) {
        return result([line(t.terminal.stackUnknown(stackCategories.map((c) => c.id).join(', ')), 'error')]);
      }
      return result([
        ...categories.map((c) => line(c.name[lang], 'accent', c.items.map((id) => tech[id].label).join(' · '))),
        section('stack', ctx),
      ]);
    },
  },
  { name: 'ai', aliases: ['llm', 'rag'], run: (_a, ctx) => result([...listOf(ctx.t.terminal.ai), inspect('rag', ctx), inspect('workspace', ctx)]) },
  {
    name: 'automation',
    aliases: ['auto'],
    run: (_a, ctx) => result([...listOf(ctx.t.terminal.automation), section('automation', ctx)]),
  },
  {
    name: 'infrastructure',
    aliases: ['infra', 'gpu', 'nvidia-smi'],
    run: (_a, ctx) => result([...listOf(ctx.t.terminal.infrastructure), inspect('gpu-lab', ctx)]),
  },
  {
    name: 'vision',
    aliases: ['cv', 'yolo'],
    run: (_a, ctx) => result([...listOf(ctx.t.terminal.vision), inspect('cctv', ctx), inspect('inventory-ai', ctx)]),
  },
  {
    name: 'contact',
    aliases: ['mail'],
    run: (_a, ctx) => {
      const { t } = ctx;
      const channels = contactChannels();
      const lines = channels.length
        ? [line(t.terminal.contactIntro, 'accent'), ...channels.map((c) => line(c.label, 'default', c.display))]
        : [line(t.terminal.contactNone, 'dim')];
      return result([...lines, line(t.terminal.contactForm, 'dim'), section('contact', ctx)]);
    },
  },
  {
    name: 'goto',
    aliases: ['cd'],
    run: (args, { t }) => {
      const target = (args[0] ?? '').replace(/^[~/.]+|\/$/g, '').replace(/^system\//, '').toLowerCase();
      const aliasMap: Record<string, SectionId> = { home: 'boot', manifesto: 'about', operator: 'about', '': 'boot' };
      const section = isSectionId(target) ? target : aliasMap[target];
      if (!section || args.length === 0) {
        return result([line(t.terminal.usageGoto(sections.map((s) => s.id).join(', ')), args.length ? 'error' : 'dim')]);
      }
      return result([line(t.terminal.going(section), 'ok')], [{ type: 'navigate', section }]);
    },
  },
  {
    name: 'ls',
    aliases: ['tree', 'dir'],
    run: (_a, { lang }) =>
      result([
        line('SYSTEM', 'accent'),
        ...sections.map((s, i) => ({
          ...line(`${i === sections.length - 1 ? '└──' : '├──'} ${s.node}`, 'default', s.label[lang]),
          command: `goto ${s.id}`,
        })),
      ]),
  },
  { name: 'whoami', run: () => result([line(`visitor@${site.systemName.toLowerCase()}`, 'default', 'uid=1000(visitor) groups=guests')]) },
  {
    name: 'date',
    run: (_a, { now }) => result([line(`${formatDate(now)} ${formatClock(now)} ${formatUtcOffset(now)}`)]),
  },
  {
    name: 'uptime',
    run: (_a, { now, sessionStart, t }) => result([line(`${t.status.uptime} ${formatDuration(now.getTime() - sessionStart)}`, 'ok')]),
  },
  {
    name: 'history',
    run: (_a, { history, t }) =>
      result(history.length ? history.map((h, i) => line(`${String(i + 1).padStart(3, ' ')}  ${h}`, 'dim')) : [line(t.terminal.historyEmpty, 'dim')]),
  },
  {
    name: 'lang',
    run: (args, { t }) => {
      const wanted = args[0]?.toLowerCase();
      if (!isLang(wanted)) return result([line(t.terminal.langUsage, 'error')]);
      return result([line(t.terminal.langSwitch(wanted), 'ok')], [{ type: 'lang', lang: wanted }]);
    },
  },
  { name: 'reboot', aliases: ['restart'], run: (_a, { t }) => result([line(t.terminal.rebooting, 'accent')], [{ type: 'reboot' }]) },
  { name: 'clear', aliases: ['cls'], run: () => result([], [{ type: 'clear' }]) },
];

const lookup = new Map<string, Command>();
for (const c of commands) {
  lookup.set(c.name, c);
  for (const alias of c.aliases ?? []) lookup.set(alias, c);
}

export function tokenize(input: string): string[] {
  return input.trim().split(/\s+/).filter(Boolean);
}

export function runCommand(input: string, ctx: TermContext): TermResult {
  const [rawName, ...args] = tokenize(input);
  if (!rawName) return result([]);
  const name = rawName.toLowerCase();

  if (name === 'sudo') return result([line(ctx.t.terminal.sudo, 'error')]);
  if (name === 'echo') return result([line(args.join(' '))]);

  const command = lookup.get(name);
  if (!command) return result([line(ctx.t.terminal.notFound(rawName), 'error')]);
  return command.run(args, ctx);
}

export const commandNames: string[] = commands.map((c) => c.name);

/** Tab completion: command names first, then project ids / section ids for arguments. */
export function complete(input: string): string[] {
  const endsWithSpace = /\s$/.test(input);
  const tokens = tokenize(input);
  if (tokens.length === 0) return commandNames;
  if (tokens.length === 1 && !endsWithSpace) {
    const prefix = tokens[0]!.toLowerCase();
    return commandNames.filter((c) => c.startsWith(prefix));
  }
  const cmd = tokens[0]!.toLowerCase();
  const argPrefix = endsWithSpace ? '' : (tokens[tokens.length - 1] ?? '').toLowerCase();
  const pool: string[] =
    cmd === 'open' || cmd === 'cat' || cmd === 'inspect'
      ? projects.map((p) => p.id)
      : cmd === 'goto' || cmd === 'cd'
        ? sections.map((s) => s.id)
        : cmd === 'stack'
          ? stackCategories.map((c) => c.id)
          : cmd === 'lang'
            ? ['en', 'es']
            : [];
  return pool.filter((p) => p.startsWith(argPrefix)).map((p) => `${cmd} ${p}`);
}
