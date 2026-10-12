# Conversor de monedas

PWA estática (HTML/CSS/JS sin frameworks) publicada en GitHub Pages desde `main`: https://lilbeto00.github.io/conversor-monedas/

- Textos de la interfaz y documentación en español.
- Tipos de cambio de open.er-api.com (gratis, sin clave); mantener el enlace "Rates By Exchange Rate API".
- Nunca poner claves de API en el código: el repositorio es público.
- Al cambiar archivos que guarda `sw.js`, subir la versión de `CACHE`.
- Documentación en `docs/`; apuntar cada cambio visible en `CHANGELOG.md`.
- Probar en local con `python -m http.server 5173`.
- Seguridad: no usar JavaScript inline ni `unsafe-inline`; cualquier dominio nuevo hay que añadirlo a la CSP de `index.html`; todo dato externo que vaya a `innerHTML` se valida o se escapa (ver `docs/seguridad.md`).
