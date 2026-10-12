# Conversor de monedas

Web instalable en el móvil (PWA) para convertir yenes, euros, dólares y cualquier otra de 166 monedas.

**Úsala aquí:** https://lilbeto00.github.io/conversor-monedas/

## Qué hace

- Escribes una cantidad y ves al momento su valor en euros, dólares y las monedas que añadas.
- Puedes cambiar la moneda de origen, añadir o quitar monedas y pulsar ⇅ para convertir al revés.
- Recuerda tus monedas y la última cantidad.
- Funciona sin conexión con los últimos tipos de cambio guardados.

## Instalarla en el móvil

- **Android (Chrome):** abre el enlace, menú ⋮ > **Instalar aplicación** (o "Añadir a pantalla de inicio").
- **iPhone (Safari):** abre el enlace, botón Compartir > **Añadir a pantalla de inicio**.

## Probarla en el PC

```
python -m http.server 5173
```
y abre http://localhost:5173

## Documentación

- [Cómo funciona por dentro](docs/funcionamiento.md)
- [Cómo publicar cambios](docs/publicar.md)
- [Seguridad](docs/seguridad.md)
- [Historial de cambios](CHANGELOG.md)

Tipos de cambio: [Rates By Exchange Rate API](https://www.exchangerate-api.com).
