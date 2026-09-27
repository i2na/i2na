const body = document.querySelector<HTMLElement>(".prose");
const bar = document.querySelector<HTMLElement>(".progress");
const links = [...document.querySelectorAll<HTMLAnchorElement>(".toc a")];
const headings = links.map((link) => document.getElementById(link.getAttribute("href")!.slice(1)));
let ticking = false;

function update() {
  ticking = false;
  if (body && bar) {
    const box = body.getBoundingClientRect();
    const total = box.height - innerHeight;
    const progress = total > 0 ? Math.min(Math.max(-box.top / total, 0), 1) : Number(box.top < innerHeight);
    bar.style.setProperty("--progress", progress.toFixed(4));
  }
  const line = innerHeight * 0.25;
  const current = headings.findLastIndex((heading) => heading && heading.getBoundingClientRect().top <= line);
  links.forEach((link, index) => link.setAttribute("aria-current", String(index === current)));
}

function request() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

addEventListener("scroll", request, { passive: true });
addEventListener("resize", request);
update();
