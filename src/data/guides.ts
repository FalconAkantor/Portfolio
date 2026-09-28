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

  rag: [
    {
      title: { en: 'Gather the documents', es: 'Reunir los documentos' },
      text: {
        en: 'Manuals, RMAs and internal notes are loaded and cut into overlapping chunks, so an answer never depends on a sentence being split in half. Each chunk keeps where it came from.',
        es: 'Los manuales, los RMAs y las notas internas se cargan y se cortan en trozos que se solapan, para que una respuesta nunca dependa de una frase partida por la mitad. Cada trozo recuerda de dónde viene.',
      },
      input: { en: 'manual.pdf · rma_2291.txt · notes/', es: 'manual.pdf · rma_2291.txt · notas/' },
      output: { en: '14,320 chunks with source', es: '14.320 trozos con su origen' },
      code: {
        file: 'ingest.py',
        real: false,
        src: `def chunks(text, size=800, overlap=150):
    for start in range(0, len(text), size - overlap):
        yield text[start:start + size]

docs = [(path, piece) for path in sources() for piece in chunks(read_text(path))]`,
      },
    },
    {
      title: { en: 'Turn text into meaning', es: 'Convertir texto en significado' },
      text: {
        en: 'Each chunk becomes a 768-dimensional vector with all-mpnet-base-v2. Texts that mean the same thing end up close together, even if they use different words.',
        es: 'Cada trozo se convierte en un vector de 768 dimensiones con all-mpnet-base-v2. Los textos que significan lo mismo acaban cerca, aunque usen palabras distintas.',
      },
      input: { en: '“the fan does not spin after the update”', es: '«el ventilador no gira tras la actualización»' },
      output: same('[0.021, -0.113, 0.087, … ×768]'),
      code: {
        file: 'ingest.py',
        real: false,
        src: `from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-mpnet-base-v2", device="cuda")
vectors = model.encode([piece for _, piece in docs],
                       batch_size=64, normalize_embeddings=True)`,
      },
    },
    {
      title: { en: 'Index them', es: 'Indexarlos' },
      text: {
        en: 'The vectors go into a FAISS index on the GPU machine. With normalised vectors, inner product is cosine similarity, and a search over thousands of chunks takes milliseconds.',
        es: 'Los vectores van a un índice FAISS en la máquina con GPU. Con vectores normalizados, el producto interno es la similitud coseno, y buscar entre miles de trozos tarda milisegundos.',
      },
      input: { en: '14,320 vectors', es: '14.320 vectores' },
      output: same('index.faiss'),
      code: {
        file: 'ingest.py',
        real: false,
        src: `import faiss

index = faiss.IndexFlatIP(vectors.shape[1])   # inner product = cosine (normalised)
index.add(vectors)
faiss.write_index(index, "index.faiss")`,
      },
    },
    {
      title: { en: 'Find by meaning', es: 'Buscar por significado' },
      text: {
        en: 'The question is embedded with the same model and the index returns the closest chunks — by meaning, not by keywords. Those chunks are the only context the model will see.',
        es: 'La pregunta se vectoriza con el mismo modelo y el índice devuelve los trozos más cercanos, por significado y no por palabras clave. Esos trozos son el único contexto que verá el modelo.',
      },
      input: { en: '“why does the fan stop after updating?”', es: '«¿por qué se para el ventilador al actualizar?»' },
      output: { en: 'top-5: rma_2291 (0.82), manual p.44 (0.79) …', es: 'top-5: rma_2291 (0,82), manual p.44 (0,79)…' },
      code: {
        file: 'ask.py',
        real: false,
        src: `q = model.encode([question], normalize_embeddings=True)
scores, ids = index.search(q, k=5)
context = [docs[i] for i in ids[0]]`,
      },
    },
    {
      title: { en: 'A local model writes the answer', es: 'Un modelo local redacta la respuesta' },
      text: {
        en: 'A local LLM — DeepSeek, DeepSeek-R1 or Mistral on Ollama, or NVIDIA NIM — writes the answer using only that context. The data never leaves the company’s own GPUs.',
        es: 'Un LLM local —DeepSeek, DeepSeek-R1 o Mistral en Ollama, o NVIDIA NIM— redacta la respuesta usando solo ese contexto. Los datos nunca salen de las GPUs propias de la empresa.',
      },
      input: { en: 'question + 5 chunks', es: 'pregunta + 5 trozos' },
      output: { en: 'answer draft', es: 'borrador de respuesta' },
      code: {
        file: 'ask.py',
        real: false,
        src: `prompt = ("Answer ONLY from the context. If it is not there, say you do not know.\\n\\n"
          + "\\n---\\n".join(piece for _, piece in context)
          + f"\\n\\nQuestion: {question}")
answer = ollama.chat(model="deepseek-r1", messages=[{"role": "user", "content": prompt}])`,
      },
    },
    {
      title: { en: 'Answer with its sources', es: 'Responder con sus fuentes' },
      text: {
        en: 'The answer is returned together with the documents it came from, so anyone can check it. If the context does not contain the answer, the system says so instead of making one up.',
        es: 'La respuesta vuelve junto con los documentos de los que sale, para que cualquiera pueda comprobarla. Si el contexto no contiene la respuesta, el sistema lo dice en lugar de inventársela.',
      },
      input: { en: 'answer draft + chunk sources', es: 'borrador + origen de los trozos' },
      output: { en: '“Known firmware issue — see RMA 2291 and manual p.44.”', es: '«Fallo conocido de firmware: ver RMA 2291 y manual p.44.»' },
      code: {
        file: 'ask.py',
        real: false,
        src: `return {
    "answer": answer["message"]["content"],
    "sources": sorted({path for path, _ in context}),
}`,
      },
    },
  ],

  'gpu-lab': [
    {
      title: { en: 'The hardware', es: 'El hardware' },
      text: {
        en: 'Multi-GPU workstations and servers on Threadripper PRO: the machines the models run on. Everything above depends on knowing exactly what each one has and how it is doing.',
        es: 'Estaciones y servidores multi-GPU con Threadripper PRO: las máquinas donde corren los modelos. Todo lo de encima depende de saber exactamente qué tiene cada una y cómo está.',
      },
      input: { en: 'a server with several NVIDIA GPUs', es: 'un servidor con varias GPUs NVIDIA' },
      output: { en: 'inventory: GPUs · VRAM · driver · CUDA', es: 'inventario: GPUs · VRAM · driver · CUDA' },
      code: {
        file: 'gpu_inventory.py',
        real: false,
        src: `import pynvml

pynvml.nvmlInit()
for i in range(pynvml.nvmlDeviceGetCount()):
    h = pynvml.nvmlDeviceGetHandleByIndex(i)
    mem = pynvml.nvmlDeviceGetMemoryInfo(h)
    print(i, pynvml.nvmlDeviceGetName(h), f"{mem.total / 2**30:.0f} GiB")`,
      },
    },
    {
      title: { en: 'Split it into machines', es: 'Repartirlo en máquinas' },
      text: {
        en: 'Proxmox runs the virtual machines and passes GPUs through to them, so each workload gets real hardware and can be moved, snapshotted or rebuilt without touching the rest.',
        es: 'Proxmox ejecuta las máquinas virtuales y les pasa las GPUs directamente, así cada carga tiene hardware real y se puede mover, clonar o reconstruir sin tocar lo demás.',
      },
      input: { en: 'host + GPU 0 and 1', es: 'host + GPU 0 y 1' },
      output: { en: 'VM “inference” with 2 GPUs passed through', es: 'VM «inferencia» con 2 GPUs asignadas' },
      code: {
        file: 'proxmox.sh',
        real: false,
        src: `# pass two GPUs straight through to the inference VM
qm set 120 --hostpci0 0000:41:00,pcie=1
qm set 120 --hostpci1 0000:42:00,pcie=1
qm start 120`,
      },
    },
    {
      title: { en: 'Reproducible GPU services', es: 'Servicios GPU reproducibles' },
      text: {
        en: 'Models are served from Docker containers with the NVIDIA runtime. The same compose file brings the service back identical on any machine, with the GPUs it needs and nothing else.',
        es: 'Los modelos se sirven desde contenedores Docker con el runtime de NVIDIA. El mismo compose levanta el servicio idéntico en cualquier máquina, con las GPUs que necesita y nada más.',
      },
      input: same('docker-compose.yml'),
      output: { en: 'ollama up · 2 GPUs visible', es: 'ollama arriba · 2 GPUs visibles' },
      code: {
        file: 'docker-compose.yml',
        real: false,
        src: `services:
  ollama:
    image: ollama/ollama
    volumes: ["models:/root/.ollama"]
    deploy:
      resources:
        reservations:
          devices: [{ driver: nvidia, count: 2, capabilities: [gpu] }]`,
      },
    },
    {
      title: { en: 'Serve the models', es: 'Servir los modelos' },
      text: {
        en: 'LLMs, embeddings and vision models run locally and are reached over HTTP by every other system on this page. No per-token bill and no data leaving the building.',
        es: 'Los LLMs, los embeddings y los modelos de visión corren en local y el resto de sistemas de esta página los usan por HTTP. Sin factura por token y sin que los datos salgan del edificio.',
      },
      input: same('POST /api/chat {model, messages}'),
      output: { en: 'answer from a local model', es: 'respuesta de un modelo local' },
      code: {
        file: 'client.py',
        real: false,
        src: `r = requests.post("http://gpu-server:11434/api/chat", json={
    "model": "qwen2.5vl:7b",
    "messages": [{"role": "user", "content": "…"}],
    "stream": False,
})
print(r.json()["message"]["content"])`,
      },
    },
    {
      title: { en: 'Watch everything', es: 'Vigilarlo todo' },
      text: {
        en: 'Hosts, GPUs, containers and the network are watched continuously: temperatures, VRAM, services that should be up, and traffic that should not be there (Suricata, tshark).',
        es: 'Los hosts, las GPUs, los contenedores y la red se vigilan sin parar: temperaturas, VRAM, servicios que deberían estar arriba y tráfico que no debería estar ahí (Suricata, tshark).',
      },
      input: { en: 'every 30 s: GPU temp, VRAM, services', es: 'cada 30 s: temperatura GPU, VRAM, servicios' },
      output: { en: 'GPU1 · 86 °C · above threshold', es: 'GPU1 · 86 °C · por encima del umbral' },
      code: {
        file: 'watch.py',
        real: false,
        src: `for gpu in read_gpus():
    if gpu.temp_c >= TEMP_LIMIT or gpu.vram_used / gpu.vram_total > 0.95:
        alert(f"{host} · GPU{gpu.index} · {gpu.temp_c} °C · VRAM {gpu.vram_pct}%")
for service in EXPECTED_SERVICES:
    if not is_up(service):
        alert(f"{service.name} is down")`,
      },
    },
    {
      title: { en: 'Tell a human', es: 'Avisar a una persona' },
      text: {
        en: 'When something needs attention, a message lands on Telegram and Discord with what, where and since when — and a second message when it recovers, so nobody is left wondering.',
        es: 'Cuando algo necesita atención, llega un mensaje a Telegram y Discord con qué, dónde y desde cuándo, y un segundo mensaje cuando se recupera, para que nadie se quede con la duda.',
      },
      input: { en: 'alert: GPU1 86 °C', es: 'alerta: GPU1 86 °C' },
      output: { en: '🔥 gpu-server · GPU1 86 °C since 14:02', es: '🔥 gpu-server · GPU1 86 °C desde las 14:02' },
      code: {
        file: 'notify.py',
        real: false,
        src: `def alert(text):
    requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage",
                  json={"chat_id": CHAT_ID, "text": text})
    requests.post(DISCORD_WEBHOOK, json={"content": text})`,
      },
    },
  ],
};
