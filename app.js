// Conversor de monedas: tipos de cambio de open.er-api.com (gratis, sin clave).
const API = "https://open.er-api.com/v6/latest/";
const REFRESH_MS = 10 * 60 * 1000; // vuelve a consultar cada 10 minutos
const DEFAULT_TARGETS = ["EUR", "USD"];

const $ = (id) => document.getElementById(id);
const names = new Intl.DisplayNames(["es"], { type: "currency" });

const state = {
  from: load("from", "JPY"),
  targets: load("targets", DEFAULT_TARGETS),
  amount: load("amount", "1000"),
  rates: null, // tipos con base USD: { CODE: valor }
  updated: null,
};

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
  try { return names.of(code); } catch { return code; }
}

// Bandera aproximada a partir de las dos primeras letras del código (JPY -> JP).
function flag(code) {
  if (code === "EUR") return "🇪🇺";
  const cc = code.slice(0, 2);
  if (!/^[A-Z]{2}$/.test(cc)) return "💱";
  return String.fromCodePoint(...[...cc].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

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

function fillSelects() {
  const codes = Object.keys(state.rates).sort();
  const option = (c) => `<option value="${c}">${c} · ${currencyName(c)}</option>`;
  $("from").innerHTML = codes.map(option).join("");
  $("from").value = state.from;
  const extra = codes.filter((c) => !state.targets.includes(c) && c !== state.from);
  $("extra").innerHTML = extra.map(option).join("");
}

function render() {
  if (!state.rates) return;
  const amount = parseAmount($("amount").value);
  const list = state.targets.filter((c) => c !== state.from && state.rates[c]);
  $("results").innerHTML = list.map((code) => `
    <li class="result">
      <span class="flag" aria-hidden="true">${flag(code)}</span>
      <div class="info">
        <div class="value">${format(convert(amount, state.from, code), code)}</div>
        <div class="name">${code} · ${currencyName(code)} · 1 ${state.from} = ${convert(1, state.from, code).toLocaleString("es-ES", { maximumSignificantDigits: 4 })} ${code}</div>
      </div>
      <button class="use" data-use="${code}" aria-label="Convertir desde ${code}" title="Convertir desde ${code}">⇅</button>
      <button data-remove="${code}" aria-label="Quitar ${code}" title="Quitar">✕</button>
    </li>`).join("");
}

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
    const res = await fetch(API + "USD", { cache: "no-store" });
    const data = await res.json();
    if (data.result !== "success") throw new Error("respuesta no válida");
    state.rates = data.rates;
    state.updated = data.time_last_update_unix * 1000;
    save("cache", { rates: state.rates, updated: state.updated });
    fillSelects();
    render();
    showUpdated();
  } catch (err) {
    const cache = load("cache", null);
    if (cache && !state.rates) {
      state.rates = cache.rates;
      state.updated = cache.updated;
      fillSelects();
      render();
    }
    setStatus(state.rates ? "Sin conexión: usando los últimos tipos guardados." : "No se pudieron cargar los tipos de cambio.", true);
  } finally {
    $("refresh").classList.remove("spin");
  }
}

$("amount").value = state.amount;
$("amount").addEventListener("input", () => { save("amount", $("amount").value); render(); });
$("amount").addEventListener("focus", (e) => e.target.select());

$("from").addEventListener("change", (e) => {
  state.from = e.target.value;
  save("from", state.from);
  fillSelects();
  render();
});

$("add").addEventListener("click", () => {
  const code = $("extra").value;
  if (!code || state.targets.includes(code)) return;
  state.targets.push(code);
  save("targets", state.targets);
  fillSelects();
  render();
});

$("results").addEventListener("click", (e) => {
  const remove = e.target.dataset.remove;
  const use = e.target.dataset.use;
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
  } else {
    return;
  }
  save("targets", state.targets);
  fillSelects();
  render();
});

$("refresh").addEventListener("click", fetchRates);

fetchRates();
setInterval(fetchRates, REFRESH_MS);
document.addEventListener("visibilitychange", () => { if (!document.hidden) fetchRates(); });

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
