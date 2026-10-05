"""
One explainer video per project of «Todos mis proyectos», drawn and narrated.

For every project sheet (src/data/catalog/projects/<slug>.json) this writes a HyperFrames project
in build/<slug>/: the narration spoken by Microsoft's «Álvaro» (es-ES-AlvaroNeural, edge-tts),
a music bed under it, and an index.html whose scenes draw themselves in time with the voice:

    intro      the area's icon drawn inside a circle, name and tagline
    problem    the mess, as doodles that get tangled up, and the problem read aloud
    solution   the tool drawn as a window wired to what it connects to
    how        the steps drawn one by one as a pipeline, each explained
    value      a chart that grows, what it brings, and its key figures
    outro      how to get in touch

Each sentence lights up on screen as it is spoken (edge-tts reports sentence boundaries).

    python3 scripts/bed.py                       # once: the music bed → cache/bed.wav
    python3 scripts/make.py tareas-nota-voz      # one project (or several slugs, or --all)
    cd build/tareas-nota-voz && npx hyperframes render -o ../../renders/tareas-nota-voz.mp4

Narration is cached per sentence text in cache/voice/, so re-running only re-voices what changed.
"""

import argparse
import asyncio
import hashlib
import html
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
REPO = ROOT.parent.parent
DATA = REPO / 'src' / 'data' / 'catalog'
CACHE = ROOT / 'cache'
BUILD = ROOT / 'build'
TEMPLATE = ROOT / 'template'
SR = 48_000
VOICE = 'es-ES-AlvaroNeural'
RATE = '-2%'
W, H = 1920, 1080

ORDINALS = ['Primero', 'Después', 'Luego', 'A continuación', 'Y por último']
OUTRO = '¿Algo así en tu empresa? Escríbeme por WhatsApp y lo vemos.'


# ── shared vocabulary from the site (areas, icons) ───────────────────
def site_areas():
    s = (REPO / 'src/catalog/areas.ts').read_text(encoding='utf-8')
    pat = r"key: '(\w+)',\s*suite: '([\w-]+)',\s*name: \{ es: '([^']+)', en: '([^']+)' \},\s*color: '(#\w+)',\s*icon: '([^']+)'"
    return {m[2]: {'key': m[1], 'name': m[3], 'color': m[5], 'icon': m[6]} for m in re.finditer(pat, s)}


def site_icons():
    s = (REPO / 'src/catalog/icons.tsx').read_text(encoding='utf-8')
    block = s[s.index('export const ICON = {') : s.index('} as const;')]
    icons = dict(re.findall(r"^\s+(\w+): '([^']+)',", block, re.M))
    rules = [(re.compile(p), name) for p, name in re.findall(r"^\s+\[/(.+?)/, '(\w+)'\],", s, re.M)]
    return icons, rules


AREAS = site_areas()
ICON, RULES = site_icons()
ICON['db'] = 'M5 6c0-1.7 3.1-3 7-3s7 1.3 7 3-3.1 3-7 3-7-1.3-7-3z M5 6v12c0 1.7 3.1 3 7 3s7-1.3 7-3V6 M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3'
ICON['web'] = 'M3 5h18v14H3z M3 9h18 M6.5 7h.01 M9 7h.01'
ICON['alert'] = 'M12 3l10 18H2z M12 10v5 M12 18h.01'
ICON['wa'] = 'M4 20l1.3-4A8 8 0 1 1 8 18.7z M9 9.5c.3 2.6 2.5 4.8 5.5 5.5l1.2-1.2-1.8-.9-.8.8c-1-.5-1.8-1.3-2.3-2.3l.8-.8-.9-1.8z'


def norm(s):
    import unicodedata

    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn')


def step_icon(title):
    t = norm(title)
    for rx, name in RULES:
        if rx.search(t):
            return ICON[name]
    return ICON['play']


PROBLEM_WORDS = [
    (r'excel|hoja|tabla|csv', 'grid'),
    (r'correo|email|e-mail|bandeja', 'mail'),
    (r'whatsapp|mensaje|telegram|discord|chat|llamada', 'chat'),
    (r'papel|pdf|documento|albaran|factura|ficha|carpeta|procedimiento', 'doc'),
    (r'hora|tiempo|dia|tarde|semana|lento|esperar', 'clock'),
    (r'error|fallo|caida|cae|muere|rot|silencio|nadie se entera|olvid', 'alert'),
    (r'busc|encontr|perdid|pierde', 'search'),
    (r'precio|coste|margen|euro|€|pag|cobr', 'chart'),
    (r'stock|almacen|inventario|serie|pieza|componente', 'archive'),
    (r'persona|mano|usuario|equipo|cliente|nadie', 'user'),
]

LINK_WORDS = [
    (r'erp|sql', 'db', 'ERP'),
    (r'correo|office|graph|mail', 'mail', 'Correo'),
    (r'telegram|discord|whatsapp', 'chat', 'Mensajería'),
    (r'ollama|whisper|gemini|\bia\b', 'ai', 'IA'),
    (r'portal|web|tienda', 'web', 'Portal'),
    (r'excel|csv|unidad|carpeta|sftp|http', 'grid', 'Archivos'),
    (r'supervisor|home assistant|gpu|windows', 'eye', 'Sistemas'),
]


def pick(text, table, n, default):
    t = norm(text)
    out = []
    for rx, name, *rest in table:
        if re.search(rx, t) and name not in [o[0] for o in out]:
            out.append((name, *rest))
        if len(out) == n:
            break
    for d in default:
        if len(out) == n:
            break
        if d[0] not in [o[0] for o in out]:
            out.append(d)
    return out


# ── speech ───────────────────────────────────────────────────────────
def speakable(s):
    s = s.replace('→', ', ').replace(' · ', ', ').replace('«', '').replace('»', '').replace('"', '')
    s = s.replace('≈ ', 'unos ').replace('~', 'unos ').replace(' / ', ' o ').replace('×', ' por ')
    s = s.replace('I+D', 'I más D').replace('2D/3D', '2D y 3D').replace('↔', 'y')
    s = re.sub(r'\s+', ' ', s).strip()
    return s if re.search(r'[.!?…]$', s) else s + '.'


def sentences(s):
    """Split display text into sentences (keeps their punctuation)."""
    parts = re.split(r'(?<=[.!?…])\s+(?=[¿¡«A-ZÁÉÍÓÚÑ0-9])', s.strip())
    return [p for p in parts if p]


def tts(text, mp3):
    """Synthesise one utterance; returns sentence boundaries [(start_s, end_s)]."""
    import certifi

    ca = os.environ.get('SSL_CERT_FILE') or os.environ.get('REQUESTS_CA_BUNDLE')
    if ca and Path(ca).exists():
        certifi.where = lambda: ca
    import edge_tts

    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or None

    async def run():
        marks = []
        with open(mp3, 'wb') as f:
            com = edge_tts.Communicate(text, VOICE, rate=RATE, proxy=proxy, boundary='SentenceBoundary')
            async for chunk in com.stream():
                if chunk['type'] == 'audio':
                    f.write(chunk['data'])
                elif chunk['type'] == 'SentenceBoundary':
                    marks.append((chunk['offset'] / 1e7, (chunk['offset'] + chunk['duration']) / 1e7))
        return marks

    for attempt in range(5):
        try:
            return asyncio.run(run())
        except Exception as e:  # free service: retry on hiccups
            if attempt == 4:
                raise
            print(f'    retry voice ({e.__class__.__name__})')
            import time

            time.sleep(4 * (attempt + 1))


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *args], check=True)


def voice(text):
    """Cached narration for a text: (samples, sentence marks)."""
    key = hashlib.sha1(f'{VOICE}|{RATE}|{text}'.encode()).hexdigest()[:16]
    d = CACHE / 'voice'
    d.mkdir(parents=True, exist_ok=True)
    wav, meta = d / f'{key}.wav', d / f'{key}.json'
    if not wav.exists():
        mp3 = d / f'{key}.mp3'
        marks = tts(text, mp3)
        # light polish: trim, clean rumble, gentle compression
        ffmpeg('-i', str(mp3), '-af', 'highpass=f=70,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2', '-ac', '1', '-ar', str(SR), str(wav))
        mp3.unlink()
        meta.write_text(json.dumps(marks))
    sr, x = wavfile.read(wav)
    return x.astype(np.float64) / 32768.0, json.loads(meta.read_text())


# ── the film ─────────────────────────────────────────────────────────
def esc(s):
    return html.escape(s, quote=True)


def fit(text, sizes):
    n = len(text)
    for limit, size in sizes:
        if n <= limit:
            return size
    return sizes[-1][1]


def plan(slug):
    page = json.loads((DATA / 'projects' / f'{slug}.json').read_text(encoding='utf-8'))
    index = json.loads((DATA / 'index.json').read_text(encoding='utf-8'))
    f = page['ficha']
    suite = f['slug'] if f['kind'] == 'suite' else next((s['slug'] for s in index['suites'] if slug in s['tools']), f.get('parent'))
    area = AREAS.get(suite, {'key': 'x', 'name': '', 'color': '#5cc8d6', 'icon': ICON['grid']})
    kind = {'suite': 'Área completa', 'sistema': 'Sistema', 'herramienta': 'Herramienta'}[f['kind']]

    beats = []  # (scene, spoken text, display sentences)
    beats.append(('intro', speakable(f"{f['name']['es']}. {f['tagline']['es']}"), []))
    if f.get('problem'):
        t = f['problem']['es']
        beats.append(('problem', speakable('El problema: ' + t), sentences(t)))
    if f.get('solution'):
        t = f['solution']['es']
        beats.append(('solution', speakable('La solución: ' + t), sentences(t)))
    steps = f.get('howItWorks') or []
    for i, s in enumerate(steps):
        ordinal = ORDINALS[min(i, len(ORDINALS) - 2)] if i < len(steps) - 1 else ORDINALS[-1]
        if len(steps) == 1:
            ordinal = 'Funciona así'
        t = s['text']['es']
        beats.append((f'step{i}', speakable(f"{ordinal}: {s['title']['es'].lower()}. {t}"), sentences(t)))
    if f.get('businessValue'):
        t = f['businessValue']['es']
        beats.append(('value', speakable('Lo que aporta: ' + t), sentences(t)))
    beats.append(('outro', OUTRO, []))
    return f, area, kind, steps, beats


def timing(beats):
    """Voice every beat and lay it on the timeline. Returns beats with start/voice/end/marks."""
    out, t = [], 0.6
    for scene, spoken, shown in beats:
        x, marks = voice(spoken)
        lead = 0.5 if scene in ('intro', 'problem', 'solution', 'value', 'outro', 'step0') else 0.25
        start = t
        v0 = start + lead
        dur = len(x) / SR
        tail = 1.2 if scene == 'outro' else 0.55
        end = v0 + dur + tail
        # Sentence windows for what is shown: the spoken text may carry a prefix sentence
        # («El problema: …» is one sentence; a step adds «Primero: dictar.»), so align from the end.
        win = []
        if shown:
            ms = [(v0 + a, v0 + b) for a, b in marks]
            if len(ms) >= len(shown):
                ms = ms[len(ms) - len(shown) :]
                win = ms
            else:  # proportional fallback by length
                total = sum(len(s) for s in shown)
                acc = v0 + 0.8
                span = dur - 0.8
                for s in shown:
                    d = span * len(s) / total
                    win.append((acc, acc + d))
                    acc += d
        out.append({'scene': scene, 'start': start, 'voice': v0, 'end': end, 'samples': x, 'shown': shown, 'win': win})
        t = end
    return out, t + 0.4


def soundtrack(timeline, total, dst):
    n = int(total * SR) + SR
    vo = np.zeros(n)
    for b in timeline:
        i = int(b['voice'] * SR)
        x = b['samples']
        vo[i : i + len(x)] += x[: n - i]
    peak = np.max(np.abs(vo)) or 1
    vo = vo / peak * 0.85
    sr, bed = wavfile.read(CACHE / 'bed.wav')
    bed = bed.astype(np.float64) / 32768.0
    reps = int(np.ceil(n / len(bed)))
    bed = np.tile(bed, (reps, 1))[:n]
    t = np.arange(n) / SR
    fade = np.clip(t / 1.5, 0, 1) * np.clip((total - t) / 2.5, 0, 1)
    gain = 0.16 * fade
    mix = bed * gain[:, None] + vo[:, None] * 0.95
    tmp = dst.with_suffix('.pre.wav')
    wavfile.write(tmp, SR, (np.clip(mix, -1, 1) * 32767).astype(np.int16))
    ffmpeg('-i', str(tmp), '-af', 'loudnorm=I=-16:TP=-1.5:LRA=9', '-ar', str(SR), '-t', f'{total:.2f}', str(dst))
    tmp.unlink()


def vtt(timeline, dst):
    def ts(x):
        return f'{int(x // 3600):02d}:{int(x % 3600 // 60):02d}:{x % 60:06.3f}'

    cues = ['WEBVTT', '']
    for b in timeline:
        if b['win']:
            for (a, z), s in zip(b['win'], b['shown']):
                cues += [f'{ts(a)} --> {ts(z)}', s, '']
    dst.write_text('\n'.join(cues), encoding='utf-8')


# ── HTML ─────────────────────────────────────────────────────────────
def glyph(d, cls='d', extra=''):
    return f'<path class="{cls}" pathLength="1" d="{d}" {extra}/>'


def icon_svg(d, size, cls='d', stroke=None, sw=1.5):
    s = f' style="stroke:{stroke}"' if stroke else ''
    return f'<svg viewBox="0 0 24 24" width="{size}" height="{size}" class="ico"{s}><g stroke-width="{sw}">{glyph(d, cls)}</g></svg>'


def sentence_spans(prefix, shown):
    return ' '.join(f'<span class="s" id="{prefix}-{i}">{esc(s)}</span>' for i, s in enumerate(shown))


def build(slug):
    f, area, kind, steps, beats = plan(slug)
    timeline, total = timing(beats)
    by = {b['scene']: b for b in timeline}
    out = BUILD / slug
    if out.exists():
        shutil.rmtree(out)
    shutil.copytree(TEMPLATE, out)
    soundtrack(timeline, total, out / 'assets' / 'soundtrack.wav')
    vtt(timeline, out / 'captions.vtt')

    c = area['color']
    name = f['name']['es']
    js = []  # timeline lines

    def at(x):
        return f'{x:.3f}'

    def draw(sel, t, d=1.0, stagger=0.0, ease='power1.inOut'):
        js.append(f"tl.to({json.dumps(sel)}, {{strokeDashoffset: 0, duration: {d}, ease: '{ease}', stagger: {stagger}}}, {at(t)});")

    def show(sel, t, d=0.5, y=24, stagger=0.0):
        js.append(f"tl.fromTo({json.dumps(sel)}, {{opacity: 0, y: {y}}}, {{opacity: 1, y: 0, duration: {d}, ease: 'power3.out', stagger: {stagger}}}, {at(t)});")

    def scene_fade(sel, b):
        js.append(f"tl.fromTo({json.dumps(sel)}, {{opacity: 0}}, {{opacity: 1, duration: 0.45, ease: 'power2.out'}}, {at(b['start'])});")

    def highlight(prefix, b):
        for i, (a, z) in enumerate(b['win']):
            js.append(f"tl.to('#{prefix}-{i}', {{color: '#f4f7fa', duration: 0.25}}, {at(a)});")
            js.append(f"tl.to('#{prefix}-{i}', {{color: '#9aa6b2', duration: 0.4}}, {at(z)});")

    sections = []

    # intro
    b = by['intro']
    t0 = b['start']
    sections.append(f'''
    <section id="s-intro" class="scene clip" data-start="{at(b['start'])}" data-duration="{at(b['end'] - b['start'])}" data-track-index="1">
      <div class="intro">
        <svg class="intro__art" viewBox="0 0 400 400" width="400" height="400">
          <circle class="d ring" pathLength="1" cx="200" cy="200" r="170" />
          <circle class="d ring2" pathLength="1" cx="200" cy="200" r="186" />
          <g transform="translate(92 92) scale(9)" stroke-width="0.75" style="stroke:{c}">{glyph(area['icon'])}</g>
        </svg>
        <p class="kicker mono" style="color:{c}">{esc(area['name'].upper())} · {esc(kind.upper())}</p>
        <h1 class="title" style="font-size:{fit(name, [(28, 104), (44, 88), (64, 74), (999, 62)])}px">{esc(name)}</h1>
        <p class="tagline">{esc(f['tagline']['es'])}</p>
      </div>
    </section>''')
    scene_fade('#s-intro', b)
    draw('#s-intro .ring', t0 + 0.1, 1.3)
    draw('#s-intro .ring2', t0 + 0.5, 1.6)
    draw('#s-intro g .d', t0 + 0.4, 1.8)
    show('#s-intro .kicker', t0 + 0.9)
    show('#s-intro .title', t0 + 1.1, 0.7, 40)
    show('#s-intro .tagline', t0 + 1.6, 0.7)

    # problem
    if 'problem' in by:
        b = by['problem']
        t0 = b['start']
        doodles = pick(f['problem']['es'], PROBLEM_WORDS, 3, [('doc',), ('clock',), ('alert',)])
        cards = [(70, 120, -7), (430, 60, 5), (250, 360, -3)]
        art = []
        for i, ((ic, *_), (x, y, r)) in enumerate(zip(doodles, cards)):
            art.append(f'''<g transform="translate({x} {y}) rotate({r} 130 110)">
              <rect class="d card" pathLength="1" x="0" y="0" width="260" height="210" rx="18" />
              <path class="d line" pathLength="1" d="M28 170h120 M28 188h80" />
              <g transform="translate(70 30) scale(5)" stroke-width="1.2">{glyph(ICON[ic])}</g>
            </g>''')
        tangle = 'M200 260 C 320 120, 420 380, 520 200 S 700 120, 640 420 S 380 560, 300 470 S 160 380, 260 300'
        sections.append(f'''
    <section id="s-problem" class="scene clip" data-start="{at(b['start'])}" data-duration="{at(b['end'] - b['start'])}" data-track-index="1">
      <svg class="art art--left rough" viewBox="0 0 760 640" width="760" height="640">
        {''.join(art)}
        <path class="d tangle" pathLength="1" d="{tangle}" />
        <g transform="translate(580 470)"><circle class="d bad" pathLength="1" cx="60" cy="60" r="56" /><g transform="translate(24 22) scale(3)" stroke-width="1.6" style="stroke:var(--bad)">{glyph(ICON['alert'])}</g></g>
      </svg>
      <div class="copy">
        <p class="label mono" style="color:var(--bad-text)">El problema</p>
        <p class="text" style="font-size:{fit(f['problem']['es'], [(180, 46), (280, 42), (380, 38), (480, 34), (9999, 31)])}px">{sentence_spans('p', b['shown'])}</p>
      </div>
    </section>''')
        scene_fade('#s-problem', b)
        draw('#s-problem .card', t0 + 0.3, 0.8, 0.5)
        draw('#s-problem g g .d', t0 + 0.7, 1.0, 0.5)
        draw('#s-problem .line', t0 + 1.0, 0.5, 0.5)
        draw('#s-problem .tangle', t0 + 2.2, 2.2)
        draw('#s-problem .bad', t0 + 3.4, 0.7)
        draw('#s-problem .bad + g .d', t0 + 3.7, 0.7)
        show('#s-problem .label', t0 + 0.2)
        show('#s-problem .text', t0 + 0.35, 0.6, 16)
        highlight('p', b)

    # solution
    if 'solution' in by:
        b = by['solution']
        t0 = b['start']
        links = pick(' '.join(x['es'] for x in f.get('integrations') or []) + ' ' + ' '.join(f.get('stack') or []), LINK_WORDS, 4, [('db', 'ERP'), ('mail', 'Correo'), ('chat', 'Mensajería'), ('web', 'Portal')])
        spots = [(70, 70), (650, 70), (70, 520), (650, 520)]
        nodes, wires = [], []
        for (ic, label), (x, y) in zip(links, spots):
            nodes.append(f'''<g class="node" transform="translate({x} {y})">
              <circle class="d nring" pathLength="1" cx="0" cy="0" r="52" />
              <g transform="translate(-30 -30) scale(2.5)" stroke-width="1.5">{glyph(ICON[ic])}</g>
              <text x="0" y="86" text-anchor="middle" class="nlabel">{esc(label)}</text>
            </g>''')
            cx, cy = 360, 295
            wires.append(f'<path class="d wire" pathLength="1" d="M{x} {y} L{cx + (x - cx) * 0.42:.0f} {cy + (y - cy) * 0.42:.0f}" />')
        ai = f.get('ai', {}).get('used')
        sections.append(f'''
    <section id="s-solution" class="scene clip" data-start="{at(b['start'])}" data-duration="{at(b['end'] - b['start'])}" data-track-index="1">
      <svg class="art art--left rough" viewBox="0 0 760 640" width="760" height="640" style="--c:{c}">
        {''.join(wires)}
        <g transform="translate(170 170)">
          <rect class="d win" pathLength="1" x="0" y="0" width="380" height="250" rx="18" />
          <path class="d win" pathLength="1" d="M0 46h380" />
          <path class="d dots" pathLength="1" d="M24 23h.01 M44 23h.01 M64 23h.01" />
          <g transform="translate(40 80) scale(5)" stroke-width="1.1" style="stroke:{c}">{glyph(area['icon'])}</g>
          <path class="d ui" pathLength="1" d="M190 96h150 M190 132h110 M190 168h130 M190 204h80" />
          {f'<g transform="translate(320 -40) scale(3)" stroke-width="1.4" style="stroke:var(--signal)">{glyph(ICON["ai"])}</g>' if ai else ''}
        </g>
        {''.join(nodes)}
      </svg>
      <div class="copy">
        <p class="label mono" style="color:{c}">La solución</p>
        <p class="text" style="font-size:{fit(f['solution']['es'], [(180, 46), (280, 42), (380, 38), (480, 34), (9999, 31)])}px">{sentence_spans('so', b['shown'])}</p>
        <p class="appname mono" style="color:{c}">{esc(name)}</p>
      </div>
    </section>''')
        scene_fade('#s-solution', b)
        draw('#s-solution .win', t0 + 0.3, 1.0, 0.3)
        draw('#s-solution .dots', t0 + 1.0, 0.3)
        draw('#s-solution g g .d', t0 + 1.0, 1.2, 0.2)
        draw('#s-solution .ui', t0 + 1.6, 0.9)
        draw('#s-solution .wire', t0 + 2.2, 0.6, 0.25)
        draw('#s-solution .nring', t0 + 2.5, 0.6, 0.25)
        draw('#s-solution .node g .d', t0 + 2.7, 0.7, 0.25)
        show('#s-solution .nlabel', t0 + 3.0, 0.4, 8, 0.25)
        show('#s-solution .label', t0 + 0.2)
        show('#s-solution .text', t0 + 0.35, 0.6, 16)
        show('#s-solution .appname', t0 + 1.4)
        highlight('so', b)

    # how it works
    if steps:
        first, last = by['step0'], by[f'step{len(steps) - 1}']
        n = len(steps)
        gap = 1680 / n
        xs = [120 + gap * (i + 0.5) for i in range(n)]
        pipe = []
        for i, s in enumerate(steps):
            x = xs[i]
            pipe.append(f'''<g class="pn pn{i}">
              <circle class="d pr" pathLength="1" cx="{x:.0f}" cy="120" r="70" />
              <g transform="translate({x - 42:.0f} 78) scale(3.5)" stroke-width="1.3">{glyph(step_icon(s['title']['es']))}</g>
              <text x="{x:.0f}" y="236" text-anchor="middle" class="pt">{esc(s['title']['es'])}</text>
              <text x="{x:.0f}" y="30" text-anchor="middle" class="pnum mono">{i + 1:02d}</text>
            </g>''')
            if i < n - 1:
                x2 = xs[i + 1]
                pipe.append(f'<path class="d arrow arrow{i}" pathLength="1" d="M{x + 84:.0f} 120 H{x2 - 84:.0f} M{x2 - 100:.0f} 106 L{x2 - 84:.0f} 120 L{x2 - 100:.0f} 134" />')
        cards = []
        for i, s in enumerate(steps):
            b = by[f'step{i}']
            cards.append(f'''<div class="stepcard stepcard{i}">
              <p class="label mono" style="color:{c}">Paso {i + 1:02d} de {n:02d}</p>
              <h2 class="steptitle">{esc(s['title']['es'])}</h2>
              <p class="text" style="font-size:{fit(s['text']['es'], [(90, 44), (150, 40), (220, 36), (9999, 32)])}px">{sentence_spans(f'st{i}', b['shown'])}</p>
            </div>''')
        sections.append(f'''
    <section id="s-how" class="scene clip" data-start="{at(first['start'])}" data-duration="{at(last['end'] - first['start'])}" data-track-index="1" style="--c:{c}">
      <p class="scenelabel mono">Cómo funciona</p>
      <svg class="pipe rough" viewBox="0 0 1920 270" width="1920" height="270">{''.join(pipe)}</svg>
      <div class="stepcards">{''.join(cards)}</div>
    </section>''')
        scene_fade('#s-how', first)
        show('#s-how .scenelabel', first['start'] + 0.1)
        for i in range(n):
            b = by[f'step{i}']
            t0 = b['start']
            if i > 0:
                draw(f'#s-how .arrow{i - 1}', t0, 0.6)
                js.append(f"tl.to('#s-how .stepcard{i - 1}', {{opacity: 0, y: -16, duration: 0.3}}, {at(t0)});")
                js.append(f"tl.to('#s-how .pn{i - 1}', {{opacity: 0.55, duration: 0.4}}, {at(t0)});")
            draw(f'#s-how .pn{i} .pr', t0 + 0.2, 0.7)
            draw(f'#s-how .pn{i} g .d', t0 + 0.4, 0.9)
            show(f'#s-how .pn{i} text', t0 + 0.6, 0.4, 8)
            js.append(f"tl.fromTo('#s-how .stepcard{i}', {{opacity: 0, y: 24}}, {{opacity: 1, y: 0, duration: 0.5, ease: 'power3.out'}}, {at(t0 + 0.3)});")
            highlight(f'st{i}', b)
        js.append(f"tl.to('#s-how .pn', {{opacity: 1, duration: 0.4}}, {at(last['end'] - 1.0)});")

    # value
    if 'value' in by:
        b = by['value']
        t0 = b['start']
        mets = [m for m in (f.get('metrics') or []) if len(m['value']) <= 14][:3]
        chips = ''.join(f'<div class="chip"><b style="color:{c}">{esc(m["value"])}</b><span>{esc(m["label"]["es"])}</span></div>' for m in mets)
        bars = ''.join(f'<rect class="bar" x="{120 + i * 130}" y="{520 - h}" width="84" height="{h}" rx="8" />' for i, h in enumerate([120, 190, 270, 380]))
        sections.append(f'''
    <section id="s-value" class="scene clip" data-start="{at(b['start'])}" data-duration="{at(b['end'] - b['start'])}" data-track-index="1" style="--c:{c}">
      <svg class="art art--left rough" viewBox="0 0 760 640" width="760" height="640">
        <path class="d axis" pathLength="1" d="M80 40 V560 H700" />
        <g class="bars" style="fill:{c}">{bars}</g>
        <path class="d up" pathLength="1" d="M110 470 C 260 420, 380 330, 640 120 M590 118 L640 120 L630 170" />
      </svg>
      <div class="copy">
        <p class="label mono" style="color:{c}">Qué aporta</p>
        <p class="text" style="font-size:{fit(f['businessValue']['es'], [(180, 46), (280, 42), (380, 38), (9999, 34)])}px">{sentence_spans('v', b['shown'])}</p>
        <div class="chips">{chips}</div>
      </div>
    </section>''')
        scene_fade('#s-value', b)
        draw('#s-value .axis', t0 + 0.2, 0.8)
        js.append(f"tl.fromTo('#s-value .bar', {{scaleY: 0, transformOrigin: '50% 100%'}}, {{scaleY: 1, duration: 0.7, ease: 'power3.out', stagger: 0.18}}, {at(t0 + 0.8)});")
        draw('#s-value .up', t0 + 1.6, 1.2)
        show('#s-value .label', t0 + 0.2)
        show('#s-value .text', t0 + 0.35, 0.6, 16)
        show('#s-value .chip', t0 + 1.4, 0.5, 16, 0.2)
        highlight('v', b)

    # outro
    b = by['outro']
    t0 = b['start']
    sections.append(f'''
    <section id="s-outro" class="scene clip" data-start="{at(b['start'])}" data-duration="{at(total - b['start'])}" data-track-index="1">
      <div class="outro">
        <h2 class="outro__q">¿Algo así en tu empresa?</h2>
        <p class="outro__wa"><svg viewBox="0 0 24 24" width="54" height="54" class="ico" style="stroke:var(--wa)"><g stroke-width="1.5">{glyph(ICON['wa'], 'd wa')}</g></svg>Escríbeme por WhatsApp · +34 624 42 15 03</p>
        <p class="outro__mail mono">nacho.automariza@gmail.com</p>
        <p class="outro__brand mono">AUTOMARIZA · <span>Todos mis proyectos</span></p>
      </div>
    </section>''')
    scene_fade('#s-outro', b)
    show('#s-outro .outro__q', t0 + 0.1, 0.6, 30)
    draw('#s-outro .wa', t0 + 0.5, 1.0)
    show('#s-outro .outro__wa', t0 + 0.4, 0.6)
    show('#s-outro .outro__mail', t0 + 0.8, 0.6)
    show('#s-outro .outro__brand', t0 + 1.1, 0.6)

    doc = f'''<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width={W}, height={H}">
    <title>{esc(name)} — explicación</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <link rel="stylesheet" href="assets/explainer.css">
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="{W}" data-height="{H}" data-duration="{at(total)}" style="--c:{c}">
      <div class="bg"></div>
      <header class="bar">
        <p class="brand mono">AUTOMARIZA <span>· Todos mis proyectos</span></p>
        <p class="pill mono" style="color:{c}"><svg viewBox="0 0 24 24" width="30" height="30"><path d="{area['icon']}" /></svg>{esc(area['name'])}</p>
      </header>
      {''.join(sections)}
      <div class="progress"><i id="progress"></i></div>
      <svg width="0" height="0" style="position:absolute"><filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" /><feDisplacementMap in="SourceGraphic" scale="3.2" /></filter></svg>
      <audio id="sound" src="assets/soundtrack.wav" data-start="0" data-duration="{at(total)}" data-track-index="10" data-volume="1"></audio>
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      tl.fromTo('#progress', {{ scaleX: 0 }}, {{ scaleX: 1, duration: {at(total)}, ease: 'none' }}, 0);
      {chr(10).join('      ' + l for l in js).strip()}
      window.__timelines = window.__timelines || {{}};
      window.__timelines['main'] = tl;
    </script>
  </body>
</html>
'''
    (out / 'index.html').write_text(doc, encoding='utf-8')
    (out / 'meta.json').write_text(json.dumps({'slug': slug, 'name': name, 'duration': round(total, 2)}, ensure_ascii=False))
    print(f'  {slug}: {total:.1f} s, {len(timeline)} beats')
    return total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('slugs', nargs='*')
    ap.add_argument('--all', action='store_true')
    args = ap.parse_args()
    slugs = [p['slug'] for p in json.loads((DATA / 'index.json').read_text())['projects']] if args.all else args.slugs
    if not slugs:
        sys.exit('name one or more project slugs, or --all')
    if not (CACHE / 'bed.wav').exists():
        sys.exit('run scripts/bed.py first')
    for s in slugs:
        build(s)


if __name__ == '__main__':
    main()
