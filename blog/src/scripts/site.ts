const COOKIE = "yena.locale";
const toast = document.querySelector<HTMLElement>(".toast");
let toastTimer = 0;

function showToast(message = "") {
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function fallbackCopy(text: string) {
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

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return fallbackCopy(text);
  }
}

function storeLocale(code: string) {
  const domain = location.hostname.endsWith("yena.io.kr") ? "; domain=yena.io.kr" : "";
  try {
    document.cookie = `${COOKIE}=${code}; path=/; max-age=31536000; samesite=lax${domain}`;
  } catch {
    /* cookies unavailable */
  }
}

async function share({ dataset }: HTMLElement) {
  const url = dataset.share || location.href;
  if (navigator.share && matchMedia("(pointer: coarse)").matches) {
    try {
      await navigator.share({ title: dataset.title, url });
      return;
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return;
    }
  }
  showToast((await copy(url)) ? dataset.done : dataset.failed);
}

document.addEventListener("click", (event) => {
  const target = (event.target as Element).closest<HTMLElement>("[data-locale], [data-copy], [data-share]");
  if (!target) return;
  const { locale, copy: text } = target.dataset;
  if (locale) {
    storeLocale(locale);
    if (target.getAttribute("aria-current") === "true" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) event.preventDefault();
  } else if (text) copy(text).then((copied) => showToast(copied ? target.dataset.done : target.dataset.failed));
  else share(target);
});

for (const bar of document.querySelectorAll<HTMLElement>("[data-tag-bar]")) {
  const update = () => {
    bar.toggleAttribute("data-more-start", bar.scrollLeft > 1);
    bar.toggleAttribute("data-more-end", bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 1);
  };
  const active = bar.querySelector<HTMLElement>('[aria-current="page"]');
  if (active) bar.scrollLeft = active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2;
  bar.addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
}
