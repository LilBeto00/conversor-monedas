// Conversor de monedas: tipos de cambio de open.er-api.com (gratis, sin clave).
const API = "https://open.er-api.com/v6/latest/";
const REFRESH_MS = 10 * 60 * 1000; // vuelve a consultar cada 10 minutos
const DEFAULT_TARGETS = ["EUR", "USD"];
const POPULAR = ["EUR", "USD", "JPY", "GBP", "CHF", "CNY", "KRW", "MXN", "CAD", "AUD"];

// Monedas cuyo país no sale de las dos primeras letras del código.
const FLAG_OVERRIDES = { EUR: "eu", ANG: "cw", XAF: "cm", XOF: "sn", XCD: "ag", XPF: "pf" };

// Solo se aceptan códigos ISO de 3 letras mayúsculas: cualquier otra cosa se descarta.
const CODE_RE = /^[A-Z]{3}$/;
const MAX_AMOUNT_CHARS = 20;

const $ = (id) => document.getElementById(id);
const names = new Intl.DisplayNames(["es"], { type: "currency" });

const state = {
  from: validCode(load("from", "JPY")) ? load("from", "JPY") : "JPY",
  targets: cleanTargets(load("targets", DEFAULT_TARGETS)),
  amount: String(load("amount", "1000")).slice(0, MAX_AMOUNT_CHARS),
  rates: null, // tipos con base USD: { CODE: valor }
  updated: null,
  picking: null, // "from" o "add" mientras el selector está abierto
};

function validCode(code) {
  return typeof code === "string" && CODE_RE.test(code);
}

function cleanTargets(list) {
  return Array.isArray(list) ? [...new Set(list.filter(validCode))].slice(0, 50) : DEFAULT_TARGETS;
}

// Se queda solo con pares código -> número positivo; protege frente a respuestas manipuladas.
function cleanRates(raw) {
  if (!raw || typeof raw !== "object") return null;
  const out = {};
  for (const [code, value] of Object.entries(raw)) {
    if (validCode(code) && typeof value === "number" && Number.isFinite(value) && value > 0) out[code] = value;
  }
  return out.USD === 1 && Object.keys(out).length > 10 ? out : null;
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function load(key, fallback) {
  try {
    const v = localStorage.getItem("conv:" + key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}

function save(key, value) {
  try { localStorage.setItem("conv:" + key, JSON.stringify(value)); } catch {}
}

function currencyName(code) {
  try {
    const n = names.of(code);
    return n.charAt(0).toUpperCase() + n.slice(1);
  } catch { return code; }
}

// Quita tildes y mayúsculas para que "dolar" encuentre "dólar".
function normalize(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// Bandera redonda (imagen de flagcdn.com); si no existe, un círculo con el código.
// Los códigos ya vienen validados (3 letras), así que es seguro meterlos en el HTML.
function flagHtml(code, size = "") {
  const cc = FLAG_OVERRIDES[code] || code.slice(0, 2).toLowerCase();
  if (code.startsWith("X") && !FLAG_OVERRIDES[code]) return badgeHtml(code, size);
  return `<img class="flag ${size}" src="https://flagcdn.com/w80/${cc}.png" alt="" loading="lazy" data-code="${code}">`;
}

function badgeHtml(code, size = "") {
  return `<span class="flag badge ${size}">${code}</span>`;
}

// Si una bandera no carga, se cambia por el círculo con el código (sin JavaScript en el HTML, por la CSP).
document.addEventListener("error", (e) => {
  const img = e.target;
  if (img instanceof HTMLImageElement && img.classList.contains("flag")) {
    img.outerHTML = badgeHtml(img.dataset.code, img.classList.contains("lg") ? "lg" : "");
  }
}, true);

function parseAmount(text) {
  const n = parseFloat(String(text).replace(/\s/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function format(value, code) {
  try {
    return new Intl.NumberFormat("es-ES", { style: "currency", currency: code, maximumFractionDigits: value < 1 ? 4 : 2 }).format(value);
  } catch {
    return value.toFixed(2) + " " + code;
  }
}

function convert(amount, from, to) {
  const r = state.rates;
  return (amount / r[from]) * r[to];
}

function renderFrom() {
  $("from").innerHTML = `${flagHtml(state.from)}<span>${state.from}</span>
    <svg class="chev" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>`;
  $("from-name").textContent = currencyName(state.from);
}

function render() {
  renderFrom();
  if (!state.rates) return;
  const amount = parseAmount($("amount").value);
  const list = state.targets.filter((c) => c !== state.from && state.rates[c]);
  if (!list.length) {
    $("results").innerHTML = `<li class="empty">Pulsa «Añadir moneda» para ver a cuánto equivale.</li>`;
    return;
  }
  $("results").innerHTML = list.map((code) => `
    <li class="result">
      ${flagHtml(code, "lg")}
      <div class="info">
        <div class="value">${format(convert(amount, state.from, code), code)}</div>
        <div class="name">${currencyName(code)} · 1 ${state.from} = ${convert(1, state.from, code).toLocaleString("es-ES", { maximumSignificantDigits: 4 })} ${code}</div>
      </div>
      <div class="actions">
        <button data-use="${code}" aria-label="Convertir desde ${code}" title="Convertir desde ${code}">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v16M7 4L3 8M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4"/></svg>
        </button>
        <button class="remove" data-remove="${code}" aria-label="Quitar ${code}" title="Quitar">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
    </li>`).join("");
}

/* ---------- Selector con buscador ---------- */

function openPicker(mode) {
  if (!state.rates) return;
  state.picking = mode;
  $("picker-title").textContent = mode === "from" ? "Convertir desde" : "Añadir moneda";
  $("search").value = "";
  renderPicker();
  $("picker").showModal();
  // En el móvil el teclado tapa la lista si se abre solo; en el PC enfocamos el buscador directamente.
  if (matchMedia("(pointer: fine)").matches) $("search").focus();
}

function closePicker() {
  $("picker").close();
  state.picking = null;
}

function renderPicker() {
  const q = normalize($("search").value.trim());
  const all = Object.keys(state.rates).sort();
  const matches = (c) => !q || normalize(c).includes(q) || normalize(currencyName(c)).includes(q);
  const current = state.picking === "from" ? [state.from] : state.targets;

  const item = (c) => `
    <li><button data-pick="${c}" aria-current="${current.includes(c)}">
      ${flagHtml(c)}<span class="code">${c}</span><span class="cname">${currencyName(c)}</span>
      ${current.includes(c) ? '<span class="check">✓</span>' : ""}
    </button></li>`;

  let html = "";
  if (!q) {
    html += `<li class="group">Populares</li>` + POPULAR.filter((c) => state.rates[c]).map(item).join("");
    html += `<li class="group">Todas</li>`;
  }
  // Al buscar, primero el código exacto, luego las monedas populares y luego el resto.
  const score = (c) => {
    const code = normalize(c);
    if (code === q) return 0;
    if (code.startsWith(q)) return 1;
    if (POPULAR.includes(c)) return 2 + POPULAR.indexOf(c) / 100;
    return normalize(currencyName(c)).startsWith(q) ? 3 : 4;
  };
  const found = all.filter(matches);
  if (q) found.sort((a, b) => score(a) - score(b) || a.localeCompare(b));
  html += found.length ? found.map(item).join("") : `<li class="none">No hay ninguna moneda con «${escapeHtml($("search").value)}».</li>`;
  $("picker-list").innerHTML = html;
  $("picker-list").scrollTop = 0;
}

function pick(code) {
  if (!validCode(code) || !state.rates[code]) return;
  if (state.picking === "from") {
    state.from = code;
    save("from", state.from);
  } else if (!state.targets.includes(code)) {
    state.targets.push(code);
    save("targets", state.targets);
  }
  closePicker();
  render();
}

/* ---------- Tipos de cambio ---------- */

function setStatus(text, error = false) {
  $("status").textContent = text;
  $("status").classList.toggle("error", error);
}

function showUpdated() {
  if (!state.updated) return;
  const d = new Date(state.updated);
  setStatus("Tipos de cambio del " + d.toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }));
}

async function fetchRates() {
  $("refresh").classList.add("spin");
  try {
    const res = await fetch(API + "USD", {
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const rates = data && data.result === "success" ? cleanRates(data.rates) : null;
    if (!rates || !Number.isFinite(data.time_last_update_unix)) throw new Error("respuesta no válida");
    state.rates = rates;
    state.updated = data.time_last_update_unix * 1000;
    save("cache", { rates: state.rates, updated: state.updated });
    render();
    showUpdated();
  } catch (err) {
    const cache = load("cache", null);
    if (cache && !state.rates && cleanRates(cache.rates)) {
      state.rates = cleanRates(cache.rates);
      state.updated = cache.updated;
      render();
    }
    setStatus(state.rates ? "Sin conexión: usando los últimos tipos guardados." : "No se pudieron cargar los tipos de cambio.", true);
  } finally {
    $("refresh").classList.remove("spin");
  }
}

/* ---------- Eventos ---------- */

$("amount").value = state.amount;
$("amount").addEventListener("input", () => { save("amount", $("amount").value); render(); });
$("amount").addEventListener("focus", (e) => e.target.select());

$("from").addEventListener("click", () => openPicker("from"));
$("add").addEventListener("click", () => openPicker("add"));
$("picker-close").addEventListener("click", closePicker);
$("search").addEventListener("input", renderPicker);
$("search").addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const first = $("picker-list").querySelector("[data-pick]");
  if (first && $("search").value.trim()) pick(first.dataset.pick);
});
$("picker-list").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-pick]");
  if (btn) pick(btn.dataset.pick);
});
// Cerrar tocando fuera de la hoja.
$("picker").addEventListener("click", (e) => { if (e.target === $("picker")) closePicker(); });

$("results").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const { remove, use } = btn.dataset;
  if (remove) {
    state.targets = state.targets.filter((c) => c !== remove);
  } else if (use) {
    // Intercambia: la moneda pulsada pasa a ser la de origen.
    const amount = parseAmount($("amount").value);
    $("amount").value = String(Math.round(convert(amount, state.from, use) * 100) / 100).replace(".", ",");
    save("amount", $("amount").value);
    state.targets = state.targets.map((c) => (c === use ? state.from : c));
    state.from = use;
    save("from", state.from);
  }
  save("targets", state.targets);
  render();
});

$("refresh").addEventListener("click", fetchRates);

render();
fetchRates();
setInterval(fetchRates, REFRESH_MS);
document.addEventListener("visibilitychange", () => { if (!document.hidden) fetchRates(); });

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
