# Seguridad

## Ataques de denegación de servicio (DDoS)

La web está alojada en **GitHub Pages**, que sirve los archivos desde la red de GitHub y su CDN (Fastly). No hay servidor ni base de datos propios que se puedan tumbar o saturar: absorber estos ataques es cosa de GitHub y lo hace a escala mundial.

Los tipos de cambio los pide el navegador de cada usuario directamente a `open.er-api.com`, así que el límite de peticiones de esa API es por usuario y no por la web. Si esa API falla, la app sigue funcionando con los últimos tipos guardados.

## Protecciones en la web

| Protección | Dónde | Contra qué |
|---|---|---|
| Content-Security-Policy | `<meta>` en `index.html` | Inyección de código (XSS): solo se ejecuta JavaScript de esta web y solo se conecta a los orígenes listados. |
| Sin JavaScript en el HTML | `app.js` | Permite una CSP estricta sin `unsafe-inline`. |
| Validación de los tipos de cambio | `cleanRates()` en `app.js` | Una respuesta manipulada de la API: solo se aceptan códigos de 3 letras y números positivos. |
| Validación de lo guardado en el móvil | `validCode()`, `cleanTargets()` | Datos corruptos o modificados en `localStorage`. |
| Escapar el texto del buscador | `escapeHtml()` | Que lo que se escribe en el buscador se interprete como HTML. |
| Límite de longitud en los campos | `maxlength` | Entradas enormes. |
| Petición a la API sin cookies ni referer y con tiempo máximo | `fetchRates()` | Filtrar datos y que la app se quede colgada. |
| `Referrer-Policy: no-referrer` y `rel="noopener noreferrer"` | `index.html` | Que otras webs sepan desde dónde se llega. |
| El service worker solo guarda respuestas correctas de esta web | `sw.js` | Envenenar la caché con contenido ajeno. |
| HTTPS obligatorio | GitHub Pages | Que alguien lea o cambie la web por el camino. |

### Orígenes permitidos por la CSP

- Scripts, estilos, iconos y manifest: solo esta web.
- Estilos de la tipografía: `fonts.googleapis.com`. Archivos de la tipografía: `fonts.gstatic.com`.
- Banderas: `flagcdn.com`.
- Tipos de cambio: `open.er-api.com`.

Si se añade un servicio nuevo, hay que añadir su dominio a la CSP o el navegador lo bloqueará.

### Límites conocidos

- GitHub Pages no permite poner cabeceras HTTP propias, así que `frame-ancestors` (impedir que otra web la meta en un iframe) no se puede activar. No es grave: la app no tiene ni sesión ni datos privados.
- No hay dependencias de npm, así que no hay paquetes de terceros que puedan traer vulnerabilidades.

## Protecciones en GitHub

- **Escaneo de secretos y protección al subir:** GitHub bloquea un `git push` que incluya claves o contraseñas.
- **Alertas de Dependabot:** avisan si alguna dependencia tiene una vulnerabilidad conocida.
- **CodeQL:** analiza el JavaScript en cada cambio y avisa de posibles vulnerabilidades (pestaña Security).
- **Regla en la rama `main`:** nadie puede borrarla ni reescribir su historial.
- **SECURITY.md:** explica cómo avisar de un fallo de seguridad de forma privada.

## Lo más importante: tu cuenta

El mayor riesgo real es que alguien entre en tu cuenta de GitHub y cambie la web. Para evitarlo, activa la verificación en dos pasos (2FA) en GitHub: Settings > Password and authentication > Enable two-factor authentication.
