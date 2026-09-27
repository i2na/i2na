import { layoutRoute, placePacket } from "./route.js";
import { fitViewport } from "./fit.js";

export const desktopQuery = window.matchMedia("(min-width: 1024px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const PACKETS = [
  { duration: 15000, phase: 0.05 },
  { duration: 21000, phase: 0.55 },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function runIdle(state) {
  const startedAt = performance.now();
  let frame = 0;

  const tick = (now) => {
    const elapsed = now - startedAt;
    state.packets.forEach((packet, index) => {
      const { duration, phase } = PACKETS[index];
      const progress = (elapsed / duration + phase) % 1;
      placePacket(packet, state.route, progress * state.length, clamp(Math.min(progress, 1 - progress) * 12, 0, 1));
    });
    frame = requestAnimationFrame(tick);
  };

  frame = requestAnimationFrame(tick);
  return { stop: () => cancelAnimationFrame(frame), refresh: () => {} };
}

function runScroll(band, state, nodes) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );
  nodes.forEach((node) => observer.observe(node));

  let ticking = false;
  const update = () => {
    ticking = false;
    const box = band.getBoundingClientRect();
    const progress = clamp((window.innerHeight * 0.82 - box.top) / box.height, 0, 1);
    const head = progress * state.length;
    state.route.style.setProperty("--route-offset", (state.length * (1 - progress)).toFixed(1));
    state.packets.forEach((packet, index) => {
      placePacket(packet, state.route, Math.max(0, head - index * 72), progress <= 0 ? 0 : index ? 0.55 : 1);
    });
  };
  const request = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", request, { passive: true });
  update();
  return {
    stop: () => {
      window.removeEventListener("scroll", request);
      observer.disconnect();
    },
    refresh: update,
  };
}

function placeStatic(state, nodes) {
  state.route.style.setProperty("--route-offset", "0");
  state.packets.forEach((packet) => (packet.style.opacity = "0"));
  nodes.forEach((node) => node.classList.add("is-in"));
  return { stop: () => {}, refresh: () => {} };
}

export function startMotion(root) {
  const band = root.querySelector(".timeline-band");
  const nodes = [...band.querySelectorAll(".node")];
  const horizontal = desktopQuery.matches;
  fitViewport(horizontal);
  const state = layoutRoute(band, horizontal);
  const runner = reducedMotion.matches ? placeStatic(state, nodes) : horizontal ? runIdle(state) : runScroll(band, state, nodes);

  let stopped = false;
  const relayout = () => {
    if (stopped) return;
    Object.assign(state, layoutRoute(band, horizontal));
    runner.refresh();
  };
  const refit = () => {
    if (stopped) return;
    fitViewport(horizontal);
    relayout();
  };
  const observer = new ResizeObserver(relayout);
  [band, ...nodes].forEach((element) => observer.observe(element));
  window.addEventListener("resize", refit);
  document.fonts?.ready.then(refit);

  return () => {
    stopped = true;
    observer.disconnect();
    window.removeEventListener("resize", refit);
    runner.stop();
  };
}
