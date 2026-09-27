{
  document.documentElement.classList.add("js");

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
