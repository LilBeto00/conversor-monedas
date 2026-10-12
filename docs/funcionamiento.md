# Cómo funciona por dentro

Es una web estática: HTML, CSS y JavaScript sin frameworks ni compilación. No necesita servidor propio.

## Archivos

| Archivo | Para qué sirve |
|---|---|
| `index.html` | Estructura de la página. |
| `style.css` | Colores y diseño (tema oscuro, pensado para móvil). |
| `app.js` | Toda la lógica: pide los tipos de cambio, convierte y pinta los resultados. |
| `manifest.webmanifest` | Nombre, icono y colores para que el móvil la instale como app. |
| `sw.js` | Service worker: guarda la app para que abra sin conexión. |
| `icons/` | Iconos de la app (192, 512, maskable y el de iPhone). |

## De dónde salen los tipos de cambio

- Fuente: `https://open.er-api.com/v6/latest/USD` (ExchangeRate-API, plan gratuito, sin clave).
- Se actualizan **una vez al día**. La app vuelve a consultar cada 10 minutos y al volver a abrirla.
- Todos los tipos vienen con base en dólares; para convertir de A a B se hace `cantidad / tipo[A] * tipo[B]`.
- Hay que mostrar el texto "Rates By Exchange Rate API" con enlace (condición del plan gratuito).
- Si algún día se quieren tipos al minuto, hará falta un servicio de pago con clave, y la clave no puede ir en el código público.

## Qué se guarda en el móvil

En `localStorage` del navegador, con prefijo `conv:`:

- `from`: moneda de origen.
- `targets`: monedas que se muestran.
- `amount`: última cantidad.
- `cache`: últimos tipos descargados, para usar sin conexión.

Nada sale del móvil salvo la petición de tipos de cambio.

## Detalles

- Los nombres de las monedas salen en español con `Intl.DisplayNames`.
- Las banderas se calculan a partir de las dos primeras letras del código (JPY → 🇯🇵). En Windows se ven como letras porque Windows no tiene emojis de banderas; en el móvil se ven bien.
- Al cambiar algo en `sw.js` o en los archivos guardados, sube el número de `CACHE` (por ejemplo `conversor-v2`) para que los móviles descarguen la versión nueva.
