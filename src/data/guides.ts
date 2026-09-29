import type { Localized } from '../i18n/types';
import type { ProjectId } from './projects';

/**
 * Live guides: each project explained step by step — what happens, what goes in,
 * what comes out and the piece of code that does it.
 *
 * Code is always simplified and anonymised. `real: true` marks excerpts taken from the
 * actual source (renamed, trimmed); `real: false` marks sketches that show how a step
 * is implemented without being the literal source.
 */
export interface GuideStep {
  title: Localized;
  text: Localized;
  input: Localized;
  output: Localized;
  code: { file: string; real: boolean; src: string };
}

const same = (text: string): Localized => ({ en: text, es: text });

export const guides: Record<ProjectId, GuideStep[]> = {
  workspace: [
    {
      title: { en: 'Sign in once', es: 'Entras una sola vez' },
      text: {
        en: 'The password is checked against a bcrypt hash and the session stores which tool categories this person may see. The password is kept only in memory, so the workspace can sign in to each tool on their behalf later.',
        es: 'La contraseña se comprueba contra un hash bcrypt y la sesión guarda qué categorías de herramientas puede ver esa persona. La contraseña se guarda solo en memoria, para que el workspace pueda iniciar sesión en cada herramienta por ella más adelante.',
      },
      input: { en: 'username + password', es: 'usuario + contraseña' },
      output: { en: 'session · role · allowed categories', es: 'sesión · rol · categorías permitidas' },
      code: {
        file: 'app.py',
        real: true,
        src: `@app.route('/login', methods=['POST'])
def login():
    username, password = request.form['username'].strip(), request.form['password']
    user = load_users().get(username)
    if not user or not user.get('active', True) or not verify_password(password, user['password']):
        return redirect(url_for('login'))

    session['username'] = username
    session['is_admin'] = user.get('is_admin', False)
    session['user_categories'] = user.get('categories', [])
    # auto-login in the workspace tools (password kept in memory only)
    session['sso_nonce'] = sso_remember_credentials(username, password)
    return redirect(url_for('workspace'))`,
      },
    },
    {
      title: { en: 'Only your tools', es: 'Solo tus herramientas' },
      text: {
        en: 'The desktop is built from the tool library, filtered by role: each person only sees — and can only open — what their categories allow. Favourites, notes and the last window layout are restored per user.',
        es: 'El escritorio se construye a partir de la biblioteca de herramientas filtrada por rol: cada persona solo ve, y solo puede abrir, lo que permiten sus categorías. Los favoritos, las notas y la última disposición de ventanas se recuperan por usuario.',
      },
      input: { en: 'tool library + session', es: 'biblioteca de herramientas + sesión' },
      output: { en: 'this person’s desktop', es: 'el escritorio de esa persona' },
      code: {
        file: 'app.py',
        real: true,
        src: `def filter_visible_content(links, categories, is_admin, user_categories=None):
    if is_admin:
        return links, categories
    allowed = [c['name'] for c in categories
               if c.get('visible', True) and (not user_categories or c['name'] in user_categories)]
    visible = {}
    for section_id, section in links.items():
        if section.get('visible', True) and section.get('category') in allowed:
            tools = [l for l in section.get('links', []) if l.get('visible', True)]
            if tools:
                visible[section_id] = {**section, 'links': tools}
    return visible, allowed`,
      },
    },
    {
      title: { en: 'Open a tool in a window', es: 'Abrir una herramienta en una ventana' },
      text: {
        en: 'Every internal tool lives on its own host and port. Instead of linking to it directly, the workspace turns the address into a path of its own proxy, so the tool opens inside a window, on the same origin, with the same session.',
        es: 'Cada herramienta interna vive en su propio host y puerto. En lugar de enlazarla directamente, el workspace convierte la dirección en una ruta de su propio proxy, así la herramienta se abre dentro de una ventana, en el mismo origen y con la misma sesión.',
      },
      input: same('http://10.0.0.12:5010/report?q=1'),
      output: same('/proxy/http/10.0.0.12/5010/report?q=1'),
      code: {
        file: 'app.py',
        real: true,
        src: `def build_proxy_url(raw_url):
    parsed = urlsplit(raw_url.strip())
    if parsed.scheme not in {'http', 'https'} or not parsed.hostname:
        return raw_url
    host = parsed.hostname.lower()
    port = parsed.port or (443 if parsed.scheme == 'https' else 80)
    if not _is_allowed_proxy_target(parsed.scheme, host, port):
        return raw_url          # outside the private network: never proxied
    query = f'?{parsed.query}' if parsed.query else ''
    return f"/proxy/{parsed.scheme}/{host}/{port}{parsed.path or '/'}{query}"`,
      },
    },
    {
      title: { en: 'Rewrite the app on the fly', es: 'Reescribir la app al vuelo' },
      text: {
        en: 'The tools were never written to live behind a prefix. So every HTML, JS and CSS response is rewritten as it passes: links, forms, fetch calls, redirects and cookies are pointed back through the proxy, and a small runtime shim catches what is built in the browser.',
        es: 'Las herramientas nunca se escribieron para vivir detrás de un prefijo. Por eso cada respuesta HTML, JS y CSS se reescribe al pasar: enlaces, formularios, llamadas fetch, redirecciones y cookies se redirigen de vuelta por el proxy, y un pequeño shim en el navegador atrapa lo que se construye allí.',
      },
      input: same('<a href="/export">  fetch("/api/data")'),
      output: same('<a href="/proxy/http/10.0.0.12/5010/export">'),
      code: {
        file: 'app.py',
        real: true,
        src: `def _rewrite_html_urls(content, scheme, host, port):
    prefix = f'/proxy/{scheme}/{host}/{port}'
    # absolute links to the tool itself
    content = re.sub(rf'{scheme}://{re.escape(host)}:{port}', prefix, content, flags=re.I)
    # root-relative href / src / action
    content = re.sub(r'((?:href|src|action)\\s*=\\s*["\\'])(/(?!proxy/)(?!/))',
                     rf'\\1{prefix}\\2', content, flags=re.I)
    # fetch("/…") and axios.get("/…")
    content = re.sub(r'(fetch\\(\\s*["\\'])(/(?!proxy/)(?!/))', rf'\\1{prefix}\\2', content)
    return content`,
      },
    },
    {
      title: { en: 'Sign in for you', es: 'Iniciar sesión por ti' },
      text: {
        en: 'If what comes back is a login screen, the proxy recognises it — exactly one password field, one user field, no logout link — submits the form with the workspace user and returns the page already signed in. Anything unexpected and it simply steps aside.',
        es: 'Si lo que vuelve es una pantalla de login, el proxy la reconoce —exactamente un campo de contraseña, uno de usuario y ningún enlace de cerrar sesión—, envía el formulario con el usuario del workspace y devuelve la página ya con la sesión iniciada. Ante cualquier cosa inesperada, simplemente se aparta.',
      },
      input: { en: 'the tool’s login page', es: 'la pantalla de login de la herramienta' },
      output: { en: 'the tool, already signed in', es: 'la herramienta, ya con sesión' },
      code: {
        file: 'app.py',
        real: true,
        src: `def _sso_analyze_login_page(html):
    lower = html.lower()
    if 'password' not in lower or 'logout' in lower:
        return None                      # not a login screen
    parser = _SSOFormParser(); parser.feed(html)
    inputs = [i for f in parser.forms for i in f['inputs']]
    if sum(1 for i in inputs if i['type'] == 'password') != 1:
        return None                      # "change password" or similar: leave it
    ...

# in the proxy handler, only for page navigations (never fetch/XHR):
if (redirect := _sso_maybe_login(html, resp, scheme, host, port, url, s, cookies)):
    return redirect`,
      },
    },
    {
      title: { en: 'Ask which tool to use', es: 'Preguntar qué herramienta usar' },
      text: {
        en: 'The assistant is a local LLM on Ollama. Its context is built from the tools this person is allowed to open — and nothing else — with strict rules: never invent a tool, answer briefly, in Spanish, and return the tool as a button.',
        es: 'El asistente es un LLM local en Ollama. Su contexto se construye con las herramientas que esa persona puede abrir, y nada más, con reglas estrictas: no inventar nunca una herramienta, responder breve, en castellano, y devolver la herramienta como botón.',
      },
      input: { en: '“where do I check a supplier’s stock?”', es: '«¿dónde miro el stock de un proveedor?»' },
      output: { en: '→ Distributor search [open]', es: '→ Buscador de distribuidores [abrir]' },
      code: {
        file: 'app.py',
        real: true,
        src: `def build_tools_context(username, is_admin, user_categories):
    links, _ = filter_visible_content(load_links(), load_categories(), is_admin, user_categories)
    return "\\n".join(
        f"- [{s['category']} > {s['name']}] {l['name']}: {l.get('description', '')}"
        for s in links.values() for l in s.get('links', [])
    )

system_prompt = f"""You only help people find the right tool.
1. ONLY recommend tools from this list. If none fits, say so.
2. Never invent tools, URLs or features.
TOOLS AVAILABLE TO THIS USER:
{build_tools_context(user, admin, categories)}"""`,
      },
    },
    {
      title: { en: 'Every tool ships its own guide', es: 'Cada herramienta trae su guía' },
      text: {
        en: 'Each tool has a walkthrough video. Whisper large-v3 turns it into text, a local LLM turns the text into a structured guide, and the workspace publishes it next to the tool — merged with what the tool’s own script documents.',
        es: 'Cada herramienta tiene un vídeo explicativo. Whisper large-v3 lo pasa a texto, un LLM local convierte ese texto en una guía estructurada y el workspace la publica junto a la herramienta, fusionada con lo que documenta el propio script.',
      },
      input: { en: 'walkthrough.mp4', es: 'explicacion.mp4' },
      output: { en: 'guide: steps · tips · warnings', es: 'guía: pasos · trucos · avisos' },
      code: {
        file: 'video_to_guide.py',
        real: false,
        src: `segments, _ = whisper_model.transcribe("walkthrough.mp4", language="es")
transcript = " ".join(s.text for s in segments)

guide = ollama.chat(model=LOCAL_MODEL, messages=[
    {"role": "system", "content": "Turn this transcript into a guide: goal, steps, tips, warnings."},
    {"role": "user", "content": transcript},
])["message"]["content"]

save_guide(tool_slug, guide)   # the workspace merges it with the script's own docs`,
      },
    },
  ],

  cctv: [
    {
      title: { en: 'One connection, three outputs', es: 'Una conexión, tres salidas' },
      text: {
        en: 'A single FFmpeg opens the camera once, over TCP. From that one stream it writes hour-long MKV segments with audio, a rolling 5-second cache for event clips, and raw BGR frames on stdout for the detector — no second connection, nothing recompressed.',
        es: 'Un único FFmpeg abre la cámara una sola vez, por TCP. De ese mismo stream escribe segmentos MKV de una hora con audio, una caché rodante de 5 segundos para los clips de evento y frames BGR en bruto por stdout para el detector: sin segunda conexión y sin recomprimir nada.',
      },
      input: same('rtsp://camera/stream1'),
      output: { en: '1 h recording · 5 s cache · frames 1280×720 @ 1 fps', es: 'grabación 1 h · caché 5 s · frames 1280×720 a 1 fps' },
      code: {
        file: 'cctv.py',
        real: true,
        src: `cmd = ["ffmpeg", "-rtsp_transport", "tcp", "-rtsp_flags", "prefer_tcp", "-i", rtsp_url,
       # 1) continuous recording: copy, no re-encode, 1 h segments
       "-map", "0:v:0", "-map", "0:a?", "-c", "copy",
       "-f", "segment", "-segment_time", "3600", "-segment_format", "matroska", rec_pattern,
       # 2) rolling cache that event clips are cut from
       "-map", "0:v:0", "-map", "0:a?", "-c", "copy",
       "-f", "segment", "-segment_time", "5", "-segment_format", "matroska", cache_pattern,
       # 3) raw frames for YOLO, through a pipe
       "-map", "0:v:0", "-an", "-vf", f"fps=1,scale=1280:720",
       "-pix_fmt", "bgr24", "-f", "rawvideo", "pipe:1"]`,
      },
    },
    {
      title: { en: 'Detect people and vehicles', es: 'Detectar personas y vehículos' },
      text: {
        en: 'Each frame read from the pipe goes through YOLOv8x. Boxes are clipped and normalised to 0–1, so every later rule works whatever the resolution. The model call is behind a lock, because several cameras and AI workers share the GPU.',
        es: 'Cada frame leído del pipe pasa por YOLOv8x. Las cajas se recortan y se normalizan de 0 a 1, para que todas las reglas posteriores funcionen con cualquier resolución. La llamada al modelo va protegida por un lock, porque varias cámaras y workers de IA comparten la GPU.',
      },
      input: { en: 'frame 1280×720 (BGR)', es: 'frame 1280×720 (BGR)' },
      output: same('[{person 0.91 [0.41,0.52,0.47,0.80]}, {car 0.88 …}]'),
      code: {
        file: 'cctv.py',
        real: true,
        src: `def extract_yolo_detections(self, frame):
    h, w = frame.shape[:2]
    with YOLO_INFERENCE_LOCK:              # one GPU, several threads
        results = self.model(frame, verbose=False)
    detections = []
    for box in results[0].boxes:
        bbox = bbox_clip(list(map(int, box.xyxy[0])), w, h)
        detections.append({
            "class_name": ALL_CLASSES.get(int(box.cls[0])),
            "confidence": float(box.conf[0]),
            "bbox_norm": bbox_to_norm(bbox, w, h),
        })
    return detections`,
      },
    },
    {
      title: { en: 'Remember the car park', es: 'Recordar el parking' },
      text: {
        en: 'Every parked vehicle is learned with a visual fingerprint: an 8×8 perceptual hash and an HSV colour histogram. A new detection is matched by position and similarity; if it is new, it has left or it moved, a photo is sent — and when all known cars shift at once, it is the camera that moved.',
        es: 'Cada vehículo aparcado se aprende con una huella visual: un hash perceptual de 8×8 y un histograma de color HSV. Cada nueva detección se empareja por posición y parecido; si es nuevo, se ha ido o ha cambiado de sitio, se manda una foto. Y si todos los coches conocidos se desplazan a la vez, lo que se ha movido es la cámara.',
      },
      input: { en: 'car crop from the frame', es: 'recorte del coche en el frame' },
      output: { en: 'car 02 · similarity 0.91 · same place', es: 'coche 02 · parecido 0,91 · mismo sitio' },
      code: {
        file: 'cctv.py',
        real: true,
        src: `def vehicle_features(self, frame, bbox):
    crop = crop_vehicle(frame, bbox)
    return {"hash": average_hash(crop),      # 8×8 grey → 64 bits
            "hist": color_histogram(crop)}   # HSV 16×8, normalised

def visual_similarity(det, known):
    hist_score = hist_similarity(det["hist"], known["hist"])
    hash_score = 1.0 - hamming_distance_hex(det["hash"], known["hash"]) / 64.0
    return hist_score * 0.70 + hash_score * 0.30`,
      },
    },
    {
      title: { en: 'Open an event session', es: 'Abrir una sesión de evento' },
      text: {
        en: 'A person does not produce one alert per frame: it opens a session that stays alive while they are seen and closes after 5 calm seconds. Then the clip is cut from the cache — including the seconds before — split into parts under Telegram’s limit and sent once.',
        es: 'Una persona no genera un aviso por frame: abre una sesión que sigue viva mientras se la ve y se cierra tras 5 segundos de calma. Entonces se corta el clip desde la caché —incluidos los segundos previos—, se parte en trozos por debajo del límite de Telegram y se envía una sola vez.',
      },
      input: { en: 'person seen at 03:12:07, 03:12:08 …', es: 'persona vista a las 03:12:07, 03:12:08…' },
      output: { en: 'event_person.mp4 · 00:21 · part 1/1', es: 'evento_persona.mp4 · 00:21 · parte 1/1' },
      code: {
        file: 'cctv.py',
        real: true,
        src: `def touch_event_session(self, camera, event_type, ts):
    key = f"{camera}:{event_type}"
    with self.event_session_lock:
        state = self.event_sessions.get(key)
        if not state:                                  # first sighting: open
            self.event_sessions[key] = {"start_ts": ts, "last_seen_ts": ts}
        else:                                          # still there: extend
            state["last_seen_ts"] = ts

# a worker closes sessions with no sighting for EVENT_SESSION_GRACE_SECONDS (5 s)
# and builds the clip from the 5-second cache, pre-roll included`,
      },
    },
    {
      title: { en: 'A local model watches the clip', es: 'Un modelo local ve el clip' },
      text: {
        en: 'In a separate queue, so the camera never waits, the worker picks the frames where the action is, adds YOLO11 pose and the moving vehicle as hints, and asks Qwen2.5-VL for strict JSON. The first rule of the prompt is not to hallucinate; at night, any human presence is suspicious.',
        es: 'En una cola aparte, para que la cámara nunca espere, el worker elige los fotogramas donde está la acción, añade como pistas la pose de YOLO11 y el vehículo en movimiento, y pide a Qwen2.5-VL un JSON estricto. La primera regla del prompt es no alucinar; de noche, cualquier presencia humana es sospechosa.',
      },
      input: { en: '12 key frames + pose + vehicle crop', es: '12 fotogramas clave + pose + recorte del vehículo' },
      output: same('{"sospechoso": true, "nivel_alerta": "alto", "resumen": "…"}'),
      code: {
        file: 'cctv.py',
        real: true,
        src: `prompt = f"""You are a CCTV security analyst.
MOST IMPORTANT RULE — DO NOT HALLUCINATE:
- Only state what you can see with reasonable clarity.
- If unsure, say "not determinable" instead of inventing a detail.
- Pose / tracking hints are SUPPORT only: confirm nothing you cannot see.
{NIGHT_RULE if is_night else ''}
Return ONLY valid JSON: sospechoso, nivel_alerta, resumen, cronologia,
vehiculos, personas, riesgos_seguridad, incertidumbres, recomendacion"""

analysis = parse_ollama_json_response(ollama_chat(model, prompt, key_frames))`,
      },
    },
    {
      title: { en: 'Score, warn — and answer questions', es: 'Puntuar, avisar y responder' },
      text: {
        en: 'The analysis becomes a 0–100 risk score. Only a suspicious event is tagged #alerta and triggers an emergency push; everything is stored in SQLite and posted to its Telegram topic. Later, “/investigar anything odd last night?” is answered from that database.',
        es: 'El análisis se convierte en una puntuación de riesgo de 0 a 100. Solo un evento sospechoso lleva #alerta y dispara un push de emergencia; todo se guarda en SQLite y se publica en su topic de Telegram. Después, «/investigar ¿pasó algo raro anoche?» se responde a partir de esa base de datos.',
      },
      input: same('{"nivel_alerta": "alto", "riesgos_seguridad": {"persona_cerca_coche": true}}'),
      output: { en: 'risk 80 · #alerta · topic alerts + push', es: 'riesgo 80 · #alerta · topic alertas + push' },
      code: {
        file: 'cctv.py',
        real: true,
        src: `def compute_risk_score_from_analysis(analysis):
    base = {"bajo": 15, "medio": 50, "alto": 80, "critico": 95}.get(analysis["nivel_alerta"], 20)
    weights = {"agresion_o_pelea": 95, "manipulacion_camara": 95, "intento_abrir_coche": 92,
               "intrusion_posible": 90, "persona_cerca_puerta": 78, "persona_cerca_coche": 72}
    for risk, weight in weights.items():
        if analysis["riesgos_seguridad"].get(risk):
            base = max(base, weight)
    if analysis["riesgos_seguridad"].get("solo_luz_sombra_reflejo") and base < 60:
        base = min(base, 20)                     # headlights and shadows stay quiet
    return base`,
      },
    },
  ],

  'inventory-ai': [
    {
      title: { en: 'Plan the rounds by zone', es: 'Planificar las rondas por zona' },
      text: {
        en: 'Nearby pharmacies are grouped automatically with k-means over their coordinates, and each zone gets its own WhatsApp round, scheduled on days that still have room under the daily sending cap — so the number is never flagged as spam.',
        es: 'Las farmacias cercanas se agrupan solas con k-means sobre sus coordenadas, y cada zona tiene su propia ronda de WhatsApp, planificada en los días que aún tienen hueco bajo el tope diario de envíos, para que el número nunca se marque como spam.',
      },
      input: { en: '1,200 pharmacies with lat/lon', es: '1.200 farmacias con lat/lon' },
      output: { en: 'zones · a round per zone per day', es: 'zonas · una ronda por zona y día' },
      code: {
        file: 'zone_service.py',
        real: false,
        src: `def kmeans(points, k, iterations=30):          # pure Python, no numpy
    centres = random.sample(points, k)
    for _ in range(iterations):
        groups = [[] for _ in centres]
        for p in points:
            groups[nearest(p, centres)].append(p)
        centres = [mean(g) if g else c for g, c in zip(groups, centres)]
    return groups

for zone in zones:                              # one round per zone, within the cap
    schedule_round(zone, day=first_day_with_room(DAILY_LIMIT, len(zone)))`,
      },
    },
    {
      title: { en: 'Ask by WhatsApp', es: 'Pedirlo por WhatsApp' },
      text: {
        en: 'A WhatsApp gateway (Baileys) sends each pharmacy a message with a personal upload link. No app, no login: the link knows which pharmacy it belongs to. Reminders go out on their own if nothing arrives.',
        es: 'Una pasarela de WhatsApp (Baileys) manda a cada farmacia un mensaje con un enlace de subida personal. Sin app y sin login: el enlace sabe a qué farmacia pertenece. Si no llega nada, los recordatorios salen solos.',
      },
      input: { en: 'pharmacy + template', es: 'farmacia + plantilla' },
      output: { en: '“Hi! Time to check the display: <link>”', es: '«¡Hola! Toca revisar el expositor: <enlace>»' },
      code: {
        file: 'whatsapp-gateway/send.js',
        real: false,
        src: `const link = \`\${PUBLIC_URL}/subir/\${pharmacy.uploadToken}\`;   // personal, no login
await sock.sendMessage(\`\${pharmacy.phone}@s.whatsapp.net\`, {
  text: renderTemplate(template, { name: pharmacy.name, link }),
});
await sleep(randomBetween(20_000, 45_000));   // human pace, under the daily cap`,
      },
    },
    {
      title: { en: 'Photos arrive', es: 'Llegan las fotos' },
      text: {
        en: 'The pharmacy takes one photo per display from the phone’s browser. Files are validated (type, size, safe names) and stored with a thumbnail; the inventory is created for that pharmacy and queued for analysis.',
        es: 'La farmacia hace una foto por expositor desde el navegador del móvil. Los archivos se validan (tipo, tamaño, nombres seguros) y se guardan con una miniatura; se crea el inventario de esa farmacia y se pone en cola para analizarlo.',
      },
      input: { en: '3 photos of the displays', es: '3 fotos de los expositores' },
      output: { en: 'inventory #1482 · queued', es: 'inventario #1482 · en cola' },
      code: {
        file: 'routes/upload.py',
        real: false,
        src: `@bp.post("/subir/<token>")
def upload(token):
    pharmacy = Pharmacy.by_upload_token(token) or abort(404)
    photos = [save_safely(f) for f in request.files.getlist("photos") if is_image(f)]
    inventory = Inventory.create(pharmacy=pharmacy, photos=photos)
    analysis_queue.put(inventory.id)
    return render_template("thanks.html")`,
      },
    },
    {
      title: { en: 'Read all the photos together', es: 'Leer todas las fotos a la vez' },
      text: {
        en: 'All the photos go to a local multimodal model (Qwen on Ollama) in a single request, so it sees the whole display at once instead of adding up separate counts. The JSON it returns is validated and repaired — the AI is never trusted blindly.',
        es: 'Todas las fotos van a un modelo multimodal local (Qwen en Ollama) en una sola petición, para que vea el expositor completo en lugar de sumar recuentos por separado. El JSON que devuelve se valida y se repara: nunca se confía ciegamente en la IA.',
      },
      input: { en: '3 photos + catalogue of codes and colours', es: '3 fotos + catálogo de códigos y colores' },
      output: same('[{"code": "A-104", "color": "red", "units": 3, "confidence": "high"}, …]'),
      code: {
        file: 'ai_service.py',
        real: false,
        src: `response = ollama.chat(model=VISION_MODEL, format="json", messages=[{
    "role": "user",
    "content": "Analyse ALL photos together. The same unit may appear in several photos: "
               "count it once. Unknown product → code UNKNOWN. Never invent data.",
    "images": [b64(p) for p in inventory.photos],
}])
items = validate_or_repair(response["message"]["content"])   # never trusted blindly`,
      },
    },
    {
      title: { en: 'Count each unit once', es: 'Contar cada unidad una vez' },
      text: {
        en: 'Units that appear in more than one photo are merged by code and colour; position only helps to deduplicate and never defines the expected stock. Low-confidence detections are flagged for review instead of being guessed.',
        es: 'Las unidades que aparecen en más de una foto se fusionan por código y color; la posición solo ayuda a deduplicar y nunca define el stock esperado. Las detecciones de baja confianza se marcan para revisión en lugar de adivinarlas.',
      },
      input: { en: 'A-104 red ×2 (photo 1) · ×2 (photo 2, same shelf)', es: 'A-104 rojo ×2 (foto 1) · ×2 (foto 2, misma balda)' },
      output: { en: 'A-104 red ×2 · 1 item to review', es: 'A-104 rojo ×2 · 1 artículo a revisar' },
      code: {
        file: 'inventory_service.py',
        real: false,
        src: `merged = {}
for item in items:
    key = (item["code"], item["color"])          # position is a hint, not a key
    merged[key] = max(merged.get(key, 0), item["units"]) if item["same_shelf"] \\
                  else merged.get(key, 0) + item["units"]

needs_review = [i for i in items if i["confidence"] == "low" or i["code"] == "UNKNOWN"]`,
      },
    },
    {
      title: { en: 'Compare with expected stock', es: 'Comparar con el stock esperado' },
      text: {
        en: 'The expected stock always comes from the database, never from the AI. The comparison yields what is missing, what is over and what was not recognised; someone can correct any quantity, and every change is audited.',
        es: 'El stock esperado sale siempre de la base de datos, nunca de la IA. La comparación da lo que falta, lo que sobra y lo que no se ha reconocido; cualquiera puede corregir una cantidad y cada cambio queda auditado.',
      },
      input: { en: 'expected 5 · detected 2', es: 'esperado 5 · detectado 2' },
      output: { en: 'A-104 red · 3 missing', es: 'A-104 rojo · faltan 3' },
      code: {
        file: 'inventory_service.py',
        real: false,
        src: `for variant, expected in pharmacy.expected_stock():     # always from the database
    detected = merged.get(variant, 0)
    if detected < expected:
        missing.append((variant, expected - detected))
    elif detected > expected:
        surplus.append((variant, detected - expected))

audit.log(user, "confirm_inventory", inventory.id)`,
      },
    },
    {
      title: { en: 'Restocking list at 08:00', es: 'Lista de reposición a las 08:00' },
      text: {
        en: 'Every morning the confirmed shortfalls go out as one Excel file in the Telegram topic for daily lists. Each missing unit appears exactly once: exported inventories are marked, never deleted, so nothing is sent twice.',
        es: 'Cada mañana los faltantes confirmados salen en un único Excel en el topic de Telegram de listas diarias. Cada unidad que falta aparece una sola vez: los inventarios exportados se marcan, nunca se borran, así que nada se envía dos veces.',
      },
      input: { en: 'confirmed shortfalls, not yet exported', es: 'faltantes confirmados aún no exportados' },
      output: { en: 'reposicion_2026-09-28.xlsx → Telegram', es: 'reposicion_2026-09-28.xlsx → Telegram' },
      code: {
        file: 'jobs.py',
        real: false,
        src: `@scheduler.scheduled_job("cron", hour=8)
def daily_restock():
    pending = Inventory.confirmed().filter(exported_at=None)
    if not pending:
        return
    xlsx = build_restock_excel(pending)             # one line per missing unit
    telegram.send_document(topic="daily_excel", file=xlsx)
    pending.update(exported_at=now())                # marked, never deleted`,
      },
    },
  ],

  docs: [
    {
      title: { en: 'Read any file', es: 'Leer cualquier archivo' },
      text: {
        en: 'Each format has its own reader: pypdf for PDFs, the full Word structure (tables, headers, text boxes), up to 10 sheets of an Excel, PowerPoint with its notes. If a PDF gives back almost no text, it is a scan — and it goes to OCR.',
        es: 'Cada formato tiene su lector: pypdf para los PDF, toda la estructura de Word (tablas, cabeceras, cuadros de texto), hasta 10 hojas de un Excel, PowerPoint con sus notas. Si un PDF devuelve casi nada de texto, es un escaneo, y pasa a OCR.',
      },
      input: same('tarifa_proveedor_2026.pdf'),
      output: { en: 'pypdf: 38 characters → OCR: 6,812 characters', es: 'pypdf: 38 caracteres → OCR: 6.812 caracteres' },
      code: {
        file: 'library.py',
        real: true,
        src: `def extract_text_from_file(abs_path, max_chars=8000):
    ext = os.path.splitext(abs_path)[1].lower()
    if ext == '.pdf':
        text = _pdf_text_via_pypdf(abs_path, max_chars)          # fast path
        if len(text.strip()) < 200:                              # almost nothing: a scan
            ocr_text = _pdf_text_via_ocr(abs_path, max_chars)    # Tesseract + Poppler
            if len(ocr_text.strip()) > len(text.strip()):
                return ocr_text
        return text
    if ext == '.docx':           return _docx_extract_full(abs_path, max_chars)
    if ext in ('.xlsx', '.xlsm'): return _xlsx_extract_full(abs_path, max_chars)
    if ext == '.pptx':           return _pptx_extract(abs_path, max_chars)
    if ext in ('.png', '.jpg', '.tiff'): return _ocr_image_file(abs_path, max_chars)
    return EXTRACT_UNSUPPORTED_FORMAT        # goes straight to the skip list`,
      },
    },
    {
      title: { en: 'Describe and tag it', es: 'Describirlo y etiquetarlo' },
      text: {
        en: 'A local model on Ollama catalogues the document: a description of at most 40 words and 3 to 6 tags, as strict JSON and with the rule of not inventing anything that is not in the text. If JSON mode fails, it retries without it and cleans the answer.',
        es: 'Un modelo local en Ollama cataloga el documento: una descripción de 40 palabras como mucho y de 3 a 6 etiquetas, en JSON estricto y con la regla de no inventar nada que no esté en el texto. Si el modo JSON falla, reintenta sin él y limpia la respuesta.',
      },
      input: { en: 'file name + first 6,000 characters', es: 'nombre del archivo + primeros 6.000 caracteres' },
      output: same('{"descripcion": "Tarifa del proveedor para 2026…", "tags": ["tarifa", "proveedor", "2026"]}'),
      code: {
        file: 'library.py',
        real: true,
        src: `system = (
    'You catalogue internal company documents.\\n'
    'Return ONLY a valid JSON object: {"descripcion": "...", "tags": ["tag1", "tag2"]}\\n'
    '- Description in Spanish, 40 words at most.\\n'
    '- 3 to 6 relevant tags, lowercase, no spaces.\\n'
    '- Do not invent anything that is not in the document.'
)
body = {"model": OLLAMA_MODEL, "format": "json", "stream": False,
        "options": {"temperature": 0.2, "num_predict": 1200},
        "messages": [{"role": "system", "content": system},
                     {"role": "user", "content": f"File: {filename}\\n\\n{text[:6000]}"}]}`,
      },
    },
    {
      title: { en: 'Cut it into meaning', es: 'Trocearlo en significado' },
      text: {
        en: 'The text is cut into 1,500-character chunks that overlap by 200, breaking at a paragraph, a line or a full stop whenever possible. Each chunk gets a vector (nomic-embed-text), so search and questions work by meaning.',
        es: 'El texto se corta en fragmentos de 1.500 caracteres que se solapan 200, partiendo por un párrafo, una línea o un punto siempre que se puede. Cada fragmento recibe un vector (nomic-embed-text), así la búsqueda y las preguntas funcionan por significado.',
      },
      input: { en: '6,812 characters of text', es: '6.812 caracteres de texto' },
      output: { en: '5 chunks · 5 vectors', es: '5 fragmentos · 5 vectores' },
      code: {
        file: 'library.py',
        real: true,
        src: `def chunk_text(text, chunk_size=1500, overlap=200):
    chunks, start = [], 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        if end < len(text):                        # try to break at a natural boundary
            for sep in ['\\n\\n', '\\n', '. ', ' ']:
                idx = text.rfind(sep, start, end)
                if idx > start + chunk_size // 2:
                    end = idx + len(sep)
                    break
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = end - overlap
    return [c for c in chunks if c]`,
      },
    },
    {
      title: { en: 'Catch the duplicates', es: 'Pillar los duplicados' },
      text: {
        en: 'Two checks. Identical files share the same SHA-256 fingerprint. Near-identical and similar ones are found by comparing their vectors: above 0.97 almost the same, above 0.92 similar. A pair someone marked as “not a duplicate” is never reported again.',
        es: 'Dos comprobaciones. Los archivos idénticos comparten la misma huella SHA-256. Los casi idénticos y los parecidos se encuentran comparando sus vectores: por encima de 0,97, casi iguales; por encima de 0,92, parecidos. Un par que alguien marcó como «no es duplicado» no vuelve a aparecer.',
      },
      input: { en: 'new file vs. the whole library', es: 'archivo nuevo contra toda la biblioteca' },
      output: { en: 'similar to tarifa_proveedor_2025.pdf · 0.94', es: 'parecido a tarifa_proveedor_2025.pdf · 0,94' },
      code: {
        file: 'library.py',
        real: true,
        src: `def find_duplicates_global(username, semantic_threshold=0.92):
    # 1) identical: same SHA-256
    by_hash = {}
    for path, info in load_hashes().items():
        if can_read(username, path):
            by_hash.setdefault(info['hash'], []).append(path)
    identical = [pair for group in by_hash.values() if len(group) > 1
                 for pair in combinations(group, 2) if not is_pair_dismissed(*pair)]
    # 2) near-identical (> 0.97) and similar (> threshold) by embedding
    for a, b in combinations(readable_embeddings(username), 2):
        score = cosine_similarity(a.vector, b.vector)
        if score > semantic_threshold and not is_pair_dismissed(a.path, b.path):
            (near if score > 0.97 else similar).append((a.path, b.path, score))`,
      },
    },
    {
      title: { en: 'Find by meaning — and by name', es: 'Buscar por significado y por nombre' },
      text: {
        en: 'A question is embedded and compared with every document the person may read: the whole document, its best chunk, plus a boost when the keywords appear in the file name, the description or the tags — so meaning and the way people name things both count.',
        es: 'La pregunta se vectoriza y se compara con cada documento que esa persona puede leer: el documento entero, su mejor fragmento y un refuerzo cuando las palabras clave aparecen en el nombre del archivo, en la descripción o en las etiquetas; así cuentan tanto el significado como la forma en que la gente nombra las cosas.',
      },
      input: { en: '“how do we register a new supplier?”', es: '«¿cómo se da de alta un proveedor nuevo?»' },
      output: { en: 'alta_proveedor.docx 91 % · checklist_compras.pdf 78 %', es: 'alta_proveedor.docx 91 % · checklist_compras.pdf 78 %' },
      code: {
        file: 'library.py',
        real: true,
        src: `def _keyword_boost(question, doc_name, desc, tags):
    keywords = [w for w in normalise(question).split() if len(w) >= 3 and w not in STOPWORDS]
    boost = 0.0
    for kw in keywords:
        if kw in doc_name.lower():  boost += 0.15   # someone named the file like that
        if kw in desc.lower():      boost += 0.12   # curated by the AI or a person
        if kw in ' '.join(tags):    boost += 0.10   # explicit tag
    return min(boost, 0.5)

score = max(doc_similarity, best_chunk_similarity) + _keyword_boost(question, name, desc, tags)`,
      },
    },
    {
      title: { en: 'Heavy work at quiet hours', es: 'El trabajo pesado, en horas tranquilas' },
      text: {
        en: 'Descriptions and vectors for pending documents are produced by a background scheduler every 30 minutes, only inside the time window you set — which may cross midnight — and with semaphores so the AI server is never flooded.',
        es: 'Las descripciones y los vectores de los documentos pendientes los produce un planificador en segundo plano cada 30 minutos, solo dentro de la franja horaria que elijas —que puede cruzar la medianoche— y con semáforos para no saturar nunca el servidor de IA.',
      },
      input: { en: 'pending documents · 23:00', es: 'documentos pendientes · 23:00' },
      output: { en: 'window 22:00–07:00 active → 12 processed', es: 'franja 22:00–07:00 activa → 12 procesados' },
      code: {
        file: 'library.py',
        real: true,
        src: `def is_in_active_window():
    cfg = load_scheduler_config()
    if not cfg.get('time_window_enabled'):
        return True
    now = datetime.now().hour
    start, end = cfg['window_start_hour'] % 24, cfg['window_end_hour'] % 24
    if start == end:
        return True                      # 24 h
    if start < end:
        return start <= now < end        # e.g. 09:00 → 18:00
    return now >= start or now < end     # crosses midnight: 22:00 → 07:00

_OLLAMA_SEMAPHORE = threading.Semaphore(2)   # at most 2 AI calls at a time`,
      },
    },
  ],

  'whatsapp-desk': [
    {
      title: { en: 'A channel for every customer', es: 'Un canal para cada cliente' },
      text: {
        en: 'The first message from a new customer silently creates their private Discord channel — hidden from everyone except the staff role — so the team can step in whenever they want. The link survives restarts and follows the customer even if WhatsApp changes their id.',
        es: 'El primer mensaje de un cliente nuevo crea en silencio su canal privado de Discord —oculto para todos salvo el rol del equipo—, para que el equipo pueda entrar cuando quiera. La relación sobrevive a los reinicios y sigue al cliente aunque WhatsApp le cambie el identificador.',
      },
      input: { en: 'first WhatsApp message from +34 600…', es: 'primer mensaje de WhatsApp de +34 600…' },
      output: same('#wa-600123456 · staff only'),
      code: {
        file: 'bot.js',
        real: true,
        src: `const perms = [
  { id: guild.roles.everyone, deny: [Flags.ViewChannel, Flags.SendMessages] },
  { id: STAFF_ROLE_ID, allow: [Flags.ViewChannel, Flags.SendMessages, Flags.ReadMessageHistory] },
];
const channel = await guild.channels.create({
  name: \`wa-\${phone}\`,
  type: ChannelType.GuildText,
  parent: category.id,
  permissionOverwrites: perms,
  topic: \`Customer channel for \${phone}\`,
});
await map.link(jid, channel.id, /* active */ false, phone);   // survives restarts`,
      },
    },
    {
      title: { en: 'The AI answers from the catalogue', es: 'La IA responde desde el catálogo' },
      text: {
        en: 'The bot works out the use case and the budget, picks candidates from the catalogue — refreshed every 24 hours by a scraper — and asks the model for at most three recommendations, with strict rules: no invented prices, no invented or shortened URLs, no impossible combinations.',
        es: 'El bot deduce el uso y el presupuesto, elige candidatos del catálogo —que un scraper actualiza cada 24 horas— y pide al modelo como mucho tres recomendaciones, con reglas estrictas: nada de precios inventados, nada de URLs inventadas ni acortadas y ninguna combinación imposible.',
      },
      input: { en: '“a computer for 3D design, around €2,000”', es: '«un equipo para diseño 3D, unos 2.000 €»' },
      output: { en: '2–3 recommendations with the catalogue’s own links', es: '2–3 recomendaciones con los enlaces del propio catálogo' },
      code: {
        file: 'bot.js',
        real: true,
        src: `const prompt = \`
ROLE: expert sales assistant. Analyse the candidate products and recommend the best ones.
\${clientName ? \`The customer's name is \${clientName}.\` : ''}
RULES:
- Do not invent URLs or prices. A URL must be exactly the "url_exacta" field.
- Never suggest impossible combinations.
- Recommend AT MOST 3 products.
CANDIDATES:
\${JSON.stringify(recommender.candidates(session, userMessage))}\`;

const answer = await gemini.generateWithValidation(prompt);   // temperature 0.15`,
      },
    },
    {
      title: { en: '“asistente”: a person, please', es: '«asistente»: una persona, por favor' },
      text: {
        en: 'When the customer writes “asistente”, the bridge opens: the channel is activated and the whole team is alerted with an @everyone and the customer’s first message. From then on, the AI steps aside.',
        es: 'Cuando el cliente escribe «asistente», el puente se abre: el canal se activa y se avisa a todo el equipo con un @everyone y el primer mensaje del cliente. A partir de ahí, la IA se aparta.',
      },
      input: same('asistente'),
      output: { en: '@everyone · New WhatsApp enquiry · Marta', es: '@everyone · Nueva consulta desde WhatsApp · Marta' },
      code: {
        file: 'bot.js',
        real: true,
        src: `if (userMessage.toLowerCase() === 'asistente') {
  await message.reply('🧑‍💻 Passing you to a person. One moment…');
  await discordBridge.startHandoff(userId, userMessage);
}

async startHandoff(jid, initialText = '') {
  const ch = await this.ensureChannelFor(jid);
  await this.map.setActive(jid, true);
  await ch.send({ content: '@everyone', allowedMentions: { parse: ['everyone'] } });
  await ch.send(\`📥 New WhatsApp enquiry\\nCustomer: \${phone}\\n\` +
    'Reply here and they get it on WhatsApp. Write !cerrar to hand back to the AI.');
}`,
      },
    },
    {
      title: { en: 'Many people, one WhatsApp', es: 'Muchas personas, un WhatsApp' },
      text: {
        en: 'Anything a teammate writes in the channel is sent from the company’s WhatsApp, signed with their name; attachments are downloaded from Discord and re-sent as WhatsApp media. Several people can answer the same customer, and everyone sees the whole conversation.',
        es: 'Todo lo que un compañero escribe en el canal sale por el WhatsApp de la empresa, firmado con su nombre; los adjuntos se descargan de Discord y se reenvían como archivos de WhatsApp. Varias personas pueden atender al mismo cliente y todos ven la conversación completa.',
      },
      input: { en: 'Discord: ana → “Will you use it for rendering?”', es: 'Discord: ana → «¿Lo usarás para render?»' },
      output: { en: 'WhatsApp: 👨‍💻 Agent (ana): Will you use it…', es: 'WhatsApp: 👨‍💻 Agente (ana): ¿Lo usarás…' },
      code: {
        file: 'bot.js',
        real: true,
        src: `discord.on('messageCreate', async (msg) => {
  if (msg.author.bot) return;
  const link = await map.getByChannel(msg.channelId);
  if (!link?.active) return;
  if (msg.content.trim()) {
    await wa.sendMessage(link.jid, \`👨‍💻 *Agent (\${msg.author.username}):*\\n\${msg.content}\`);
  }
  for (const att of msg.attachments.values()) {              // files too
    const data = Buffer.from(await (await fetch(att.url)).arrayBuffer()).toString('base64');
    await wa.sendMessage(link.jid, new MessageMedia(att.contentType, data, att.name));
  }
});`,
      },
    },
    {
      title: { en: 'What the customer sends lands in Discord', es: 'Lo que envía el cliente llega a Discord' },
      text: {
        en: 'While the bridge is open, every customer message is posted in their channel — text as it is, and photos, documents or audio downloaded from WhatsApp and attached to Discord with the right file type.',
        es: 'Mientras el puente está abierto, cada mensaje del cliente se publica en su canal: el texto tal cual y las fotos, documentos o audios descargados de WhatsApp y adjuntados en Discord con su tipo de archivo correcto.',
      },
      input: { en: 'WhatsApp: photo + “this is my setup”', es: 'WhatsApp: foto + «este es mi puesto»' },
      output: { en: 'Discord: 📲 Customer Marta + 📎 foto_puesto.jpg', es: 'Discord: 📲 Cliente Marta + 📎 foto_puesto.jpg' },
      code: {
        file: 'bot.js',
        real: true,
        src: `async forwardFromWhatsApp(jid, text, message) {
  const link = await this.map.getByJid(jid);
  if (!link?.active) return;
  const ch = await this.guild.channels.fetch(link.channelId);
  if (text?.trim()) await ch.send(\`📲 **Customer \${phone}:**\\n\${text}\`);
  if (message.hasMedia) {
    const media = await message.downloadMedia();          // base64 + mimetype
    const name = media.filename || \`wa-\${Date.now()}.\${mime.extension(media.mimetype)}\`;
    await ch.send({ content: '📎 File from the customer',
                    files: [new AttachmentBuilder(Buffer.from(media.data, 'base64'), { name })] });
  }
}`,
      },
    },
    {
      title: { en: '“!cerrar”: back to the AI', es: '«!cerrar»: de vuelta a la IA' },
      text: {
        en: 'Any teammate closes the bridge with “!cerrar”: both sides are told and the AI takes over again. If someone writes in a closed channel later, the bridge reopens by itself — so nobody has to remember a command to help a customer.',
        es: 'Cualquier compañero cierra el puente con «!cerrar»: se avisa a los dos lados y la IA vuelve a encargarse. Si alguien escribe más tarde en un canal cerrado, el puente se reabre solo, así nadie tiene que acordarse de un comando para atender a un cliente.',
      },
      input: same('!cerrar'),
      output: { en: '✅ Chat closed by luis · AI active again', es: '✅ Chat cerrado por luis · IA activa de nuevo' },
      code: {
        file: 'bot.js',
        real: true,
        src: `async endHandoffByChannel(channelId, { closedBy }) {
  const link = await this.map.getByChannel(channelId);
  await this.map.setActive(link.jid, false);
  this.activeChannelIds.delete(channelId);
  await channel.send(\`✅ Chat closed by *\${closedBy}*. The AI is active again for this customer.\`);
  await wa.sendMessage(link.jid, '✅ The chat with an agent is closed. I am back — ask me anything.');
}

// writing in a closed channel reopens the bridge automatically
if (!activeChannelIds.has(msg.channelId) && link && content !== '!cerrar') {
  await map.setActive(link.jid, true);
  await msg.channel.send('🔄 Bridge reopened. Messages go to the customer until !cerrar.');
}`,
      },
    },
  ],
};
