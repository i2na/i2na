import { renderApp } from "./render.js";
import { desktopQuery, startMotion } from "./motion.js";
import { resolveLocale, t } from "./i18n.js";

const STORAGE_KEY = "yena.locale";
const root = document.getElementById("app");
const toast = document.querySelector(".toast");

let locale = resolveLocale(readStored());
let stopMotion = () => {};
let toastTimer = 0;

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function store(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* storage unavailable */
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function fallbackCopy(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none";
  document.body.append(field);
  field.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

async function copyEmail(email) {
  let copied = false;
  try {
    await navigator.clipboard.writeText(email);
    copied = true;
  } catch {
    copied = fallbackCopy(email);
  }
  showToast(copied ? t(locale, "ui.copied") : t(locale, "ui.copyFailed", { email }));
}

function restartMotion() {
  stopMotion();
  stopMotion = startMotion(root);
}

function mount() {
  document.documentElement.lang = locale;
  renderApp(root, { locale, onLocale: setLocale, onCopy: copyEmail });
  restartMotion();
  document.body.classList.remove("is-ready");
  void document.body.offsetWidth;
  document.body.classList.add("is-ready");
}

function setLocale(code) {
  if (code === locale) return;
  locale = code;
  store(code);
  mount();
  root.querySelector('.lang-code[aria-pressed="true"]')?.focus({ preventScroll: true });
}

desktopQuery.addEventListener("change", restartMotion);

mount();
