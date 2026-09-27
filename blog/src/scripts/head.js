{
  document.documentElement.classList.add("js");

  const from = window.navigation?.activation?.from?.url || document.referrer;
  if (from && performance.getEntriesByType("navigation")[0]?.type !== "reload") {
    const previous = new URL(from);
    const pagePath = (path) => path.replace(/^\/(ko|en|ja|zh)(?=\/|$)/, "");
    if (previous.origin === location.origin && previous.pathname !== location.pathname && pagePath(previous.pathname) === pagePath(location.pathname)) {
      document.documentElement.classList.add("locale-change");
    }
  }

  const thumbFor = (url) => (url ? document.querySelector(`[data-thumb="${new URL(url).pathname}"]`) : null);

  const nameThumb = (thumb) => {
    document.querySelectorAll("[data-thumb]").forEach((element) => (element.style.viewTransitionName = ""));
    const hero = document.querySelector(".post-hero");
    if (hero) hero.style.viewTransitionName = thumb ? "none" : "";
    if (thumb) thumb.style.viewTransitionName = "post-thumb";
  };

  addEventListener("pageswap", (event) => {
    if (event.viewTransition) nameThumb(thumbFor(event.activation?.entry.url));
  });

  addEventListener("pagereveal", (event) => {
    const thumb = thumbFor(window.navigation?.activation?.from?.url);
    if (!event.viewTransition || !thumb) return;
    nameThumb(thumb);
    event.viewTransition.finished.finally(() => nameThumb());
  });
}
