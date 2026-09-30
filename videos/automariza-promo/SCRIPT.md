---
voice: masculina, cercana, primera persona (Nacho)
language: es-ES
provider: gemini-2.5-flash-preview-tts (voz "Algieba") · o grabación propia
style: "Habla en español de España, con voz masculina cálida, cercana y segura, como quien cuenta a un cliente lo que hace. Ritmo natural, sin tono de anuncio exagerado."
---

# Guion de la voz en off

Cada línea empieza en su segundo (`at`) y debe terminar antes de `until`, donde corta la escena.
`scripts/voice.py` genera o recorta cada línea, la coloca en su sitio, baja la música bajo la voz
y deja la mezcla final en `assets/audio/soundtrack.wav`.

| # | at | until | Escena | Texto |
|---|---|---|---|---|
| 1 | 1.0 | 3.9 | hook | Construyo sistemas que piensan. |
| 2 | 4.1 | 5.8 | hook | Soy Nacho, de Automariza. |
| 3 | 6.4 | 11.4 | problem | Cada día se van horas en lo mismo: pedidos, PDFs, Excel, WhatsApps sin contestar. |
| 4 | 11.7 | 13.8 | problem | Todo eso puede funcionar solo. |
| 5 | 14.6 | 19.7 | sys-cctv | Una cámara que se vigila sola: detecta, lo revisa con IA y solo te avisa si importa. |
| 6 | 20.5 | 25.7 | sys-inventory | Una foto del expositor, y la IA cuenta el stock y te prepara la lista de lo que falta. |
| 7 | 26.5 | 31.7 | sys-docs | Tus documentos, ordenados solos. Preguntas, y te responde con la fuente. |
| 8 | 32.5 | 37.7 | sys-desk | Un WhatsApp que atiende a cualquier hora, con todo tu equipo detrás, desde el mismo número. |
| 9 | 38.5 | 43.7 | sys-workspace | Y todas tus herramientas en un solo sitio, con un solo inicio de sesión. |
| 10 | 44.5 | 49.7 | proof | No son maquetas: puedes verlo todo funcionando, por dentro, en mi web. |
| 11 | 50.3 | 53.8 | how | Me cuentas el problema, y yo lo dejo funcionando. |
| 12 | 54.6 | 59.0 | cta | ¿Algo así en tu empresa? Escríbeme por WhatsApp y lo vemos. |

## Grabarlo con tu voz

Lee las 12 líneas en orden, dejando **un segundo de silencio entre cada una**, en un sitio sin eco
(un cuarto con cortinas o ropa va mejor que una cocina). Sirve la grabadora del móvil. Luego:

```bash
python3 scripts/voice.py --recording ruta/a/tu-grabacion.m4a
```
