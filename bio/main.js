const root = document.documentElement;
const stage = document.querySelector(".profile-stage");
const copyButton = document.querySelector(".copy-email");
const toast = document.querySelector(".toast");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const mobileLayout = window.matchMedia("(max-width: 760px)");
const routePaths = Array.from(document.querySelectorAll(".route"));
const mobileFlowRoutePaths = Array.from(document.querySelectorAll(".mobile-flow-route"));
const mobileFlowDots = Array.from(document.querySelectorAll(".mobile-flow-dot"));
const nodePanels = Array.from(document.querySelectorAll(".data-node"));
const traceShell = document.querySelector(".trace-shell");
const styleTarget = stage || root;
const MOBILE_PACKET_STEPS = 160;

let toastTimer = 0;
let ticking = false;
let scrollTimer = 0;
let isScrolling = false;
let maxScroll = 1;
let nodeMetrics = [];
let lastProgress = -1;
let mobilePacketMetrics = [];
let styleValueCache = new WeakMap();
let attributeValueCache = new WeakMap();

function setCssVar(element, property, value) {
  let cache = styleValueCache.get(element);

  if (!cache) {
    cache = new Map();
    styleValueCache.set(element, cache);
  }

  if (cache.get(property) === value) return;
  cache.set(property, value);
  element.style.setProperty(property, value);
}

function setAttributeValue(element, property, value) {
  let cache = attributeValueCache.get(element);

  if (!cache) {
    cache = new Map();
    attributeValueCache.set(element, cache);
  }

  if (cache.get(property) === value) return;
  cache.set(property, value);
  element.setAttribute(property, value);
}

function sampleRoute(path, length) {
  return Array.from({ length: MOBILE_PACKET_STEPS + 1 }, (_, index) => {
    const point = path.getPointAtLength((length * index) / MOBILE_PACKET_STEPS);

    return { x: point.x, y: point.y };
  });
}

function getSampledPoint(route, progress) {
  const scaledProgress = clamp(progress, 0, 1) * MOBILE_PACKET_STEPS;
  const startIndex = Math.floor(scaledProgress);
  const endIndex = Math.min(MOBILE_PACKET_STEPS, startIndex + 1);
  const ratio = scaledProgress - startIndex;
  const start = route.samples[startIndex];
  const end = route.samples[endIndex];

  return {
    x: start.x + (end.x - start.x) * ratio,
    y: start.y + (end.y - start.y) * ratio,
  };
}

const routes = routePaths.map((path) => {
  const length = path.getTotalLength();
  setCssVar(path, "--route-length", length.toFixed(2));
  setCssVar(path, "--route-offset", length.toFixed(2));
  return { path, length };
});
const mobileRoutes = mobileFlowRoutePaths.map((path, index) => {
  const length = path.getTotalLength();
  setCssVar(path, "--mobile-route-length", length.toFixed(2));
  setCssVar(path, "--mobile-route-offset", length.toFixed(2));
  return { path, length, index, samples: sampleRoute(path, length) };
});
const mobilePacketConfig = [
  { selector: ".mobile-flow-packet-primary", routeIndex: 0, delay: 0, speed: 1 },
  { selector: ".mobile-flow-packet-secondary", routeIndex: 1, delay: 0.04, speed: 1.06 },
  { selector: ".mobile-flow-packet-tertiary", routeIndex: 0, delay: 0.1, speed: 1.1 },
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function smoothStep(value) {
  return value * value * (3 - value * 2);
}

function softLinear(value) {
  const progress = clamp(value, 0, 1);
  return progress * 0.72 + smoothStep(progress) * 0.28;
}

function delayedProgress(progress, delay) {
  return clamp((progress - delay) / Math.max(0.001, 1 - delay), 0, 1);
}

function getLayoutTop(element) {
  let top = 0;
  let current = element;

  while (current) {
    top += current.offsetTop;
    current = current.offsetParent;
  }

  return top;
}

function readCssNumber(element, property) {
  return Number.parseFloat(window.getComputedStyle(element).getPropertyValue(property)) || 0;
}

function refreshMetrics() {
  const documentMaxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

  if (mobileLayout.matches && traceShell) {
    const shellBottom = traceShell.getBoundingClientRect().bottom + window.scrollY;
    const contentScrollEnd = Math.max(1, shellBottom - window.innerHeight * 1.05);
    const naturalEnd = Math.min(documentMaxScroll, contentScrollEnd);

    maxScroll = Math.max(1, naturalEnd * 0.62);
  } else {
    maxScroll = documentMaxScroll;
  }

  nodeMetrics = nodePanels.map((node, index) => ({
    node,
    index,
    layoutTop: getLayoutTop(node),
    driftX: mobileLayout.matches ? readCssNumber(node, "--mobile-x-drift") : readCssNumber(node, "--x-drift"),
    driftY: mobileLayout.matches ? readCssNumber(node, "--mobile-y-drift") : readCssNumber(node, "--y-drift"),
  }));
  mobilePacketMetrics = mobilePacketConfig
    .map((config) => ({
      ...config,
      element: document.querySelector(config.selector),
      route: mobileRoutes[config.routeIndex],
    }))
    .filter(({ element, route }) => element && route);
}

function updateMobileFlow(progress, reduceMotion) {
  mobileRoutes.forEach(({ path, length, index }) => {
    const routeProgress = reduceMotion
      ? 1
      : delayedProgress(progress, index === 0 ? 0 : 0.04);
    const routeEase = routeProgress;

    setCssVar(path, "--mobile-route-offset", (length * (1 - routeEase)).toFixed(1));
    setCssVar(path, "--mobile-route-opacity", (0.28 + routeEase * 0.68).toFixed(3));
  });

  mobileFlowDots.forEach((dot, index) => {
    const dotProgress = reduceMotion
      ? 1
      : softLinear(delayedProgress(progress, index * 0.018));

    setCssVar(dot, "--mobile-dot-opacity", (0.28 + dotProgress * 0.7).toFixed(3));
    setCssVar(dot, "--mobile-dot-scale", (0.72 + dotProgress * 0.5).toFixed(3));
  });

  mobilePacketMetrics.forEach(({ element, route, delay, speed }) => {
    const packetProgress = reduceMotion ? 1 : delayedProgress(progress, delay) ** (1 / speed);
    const point = getSampledPoint(route, packetProgress);
    const visibility = packetProgress <= 0 ? 0 : 0.18 + softLinear(packetProgress) * 0.78;

    setAttributeValue(element, "transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
    setCssVar(element, "opacity", visibility.toFixed(3));
  });
}

function setProgress(force = false) {
  const isMobile = mobileLayout.matches;
  const reduceMotion = reducedMotion.matches;
  const rawProgress = reduceMotion ? 1 : clamp(window.scrollY / maxScroll, 0, 1);
  const progressThreshold = isMobile ? 0.0014 : 0.0008;

  if (!force && Math.abs(rawProgress - lastProgress) < progressThreshold) return;
  lastProgress = rawProgress;

  const progress = isMobile
    ? Math.pow(rawProgress, 0.62)
    : Math.pow(rawProgress, 1.42);
  const ambientProgress = isMobile
    ? Math.pow(rawProgress, 0.72)
    : Math.pow(rawProgress, 1.34);
  const lineReveal = clamp(progress, 0, 1);
  const hiddenRatio = 1 - lineReveal;
  const layerShift = (ambientProgress - 0.5) * (isMobile ? 72 : 14);
  const shellFactorX = isMobile ? 0.34 : 0.12;
  const shellFactorY = isMobile ? -0.56 : -0.18;
  const gridX = ambientProgress * (isMobile ? -84 : -7);
  const gridY = ambientProgress * (isMobile ? 98 : 13);
  const rainX = ambientProgress * (isMobile ? 128 : 16);
  const scanY = isMobile ? -52 + progress * 96 : -58 + ambientProgress * 108;

  if (isMobile) {
    setCssVar(styleTarget, "--mobile-flow-x", `${(Math.sin(progress * Math.PI) * 3).toFixed(1)}px`);
    setCssVar(styleTarget, "--mobile-flow-y", `${((0.5 - ambientProgress) * 12).toFixed(1)}px`);
    updateMobileFlow(progress, reduceMotion);
  } else {
    setCssVar(styleTarget, "--grid-x", `${gridX.toFixed(1)}px`);
    setCssVar(styleTarget, "--grid-y", `${gridY.toFixed(1)}px`);
    setCssVar(styleTarget, "--rain-x", `${rainX.toFixed(1)}px`);
    setCssVar(styleTarget, "--layer-before-y", `${(layerShift * -0.55).toFixed(1)}px`);
    setCssVar(styleTarget, "--shell-layer-x", `${(layerShift * shellFactorX).toFixed(1)}px`);
    setCssVar(styleTarget, "--shell-layer-y", `${(layerShift * shellFactorY).toFixed(1)}px`);
    setCssVar(styleTarget, "--shell-layer-inverse-x", `${(layerShift * shellFactorX * -1).toFixed(1)}px`);
    setCssVar(styleTarget, "--shell-layer-inverse-y", `${(layerShift * shellFactorY * -1).toFixed(1)}px`);
    setCssVar(styleTarget, "--floor-layer-y", `${(layerShift * -0.28).toFixed(1)}px`);
    setCssVar(styleTarget, "--core-layer-y", `${(layerShift * -0.12).toFixed(1)}px`);
    setCssVar(styleTarget, "--scan-y", `${scanY.toFixed(1)}svh`);
    setCssVar(styleTarget, "--packet-one-distance", `${(delayedProgress(progress, 0) * 100).toFixed(1)}%`);
    setCssVar(styleTarget, "--packet-two-distance", `${(delayedProgress(progress, 0.12) * 100).toFixed(1)}%`);
    setCssVar(styleTarget, "--packet-three-distance", `${(delayedProgress(progress, 0.22) * 100).toFixed(1)}%`);

    routes.forEach(({ path, length }) => {
      setCssVar(path, "--route-offset", (length * hiddenRatio).toFixed(1));
    });
  }

  nodeMetrics.forEach(({ node, index, layoutTop, driftX, driftY }) => {
    const viewportProgress = clamp(
      (window.scrollY + window.innerHeight * (isMobile ? 0.88 : 0.76) - layoutTop) /
        (window.innerHeight * (isMobile ? 0.58 : 0.86)),
      0,
      1
    );
    const mobileNodeProgress = clamp(progress * 0.72 + viewportProgress * 0.48, 0, 1);
    const localProgress = reduceMotion
      ? 1
      : isMobile
        ? mobileNodeProgress
        : delayedProgress(progress, index * 0.1);
    const localGlow = isMobile ? softLinear(localProgress) : smoothStep(localProgress);
    const baseOpacity = isMobile ? 0.58 : 0.36;
    let moveX = driftX * hiddenRatio * (isMobile ? 1 : 0.42);
    let moveY = driftY * hiddenRatio * (isMobile ? 1 : 0.42);

    if (isMobile && !reduceMotion) {
      const traceArc = Math.sin(localGlow * Math.PI);
      const traceRipple = Math.sin(localGlow * Math.PI * 2) * (3 + index * 0.8);
      const direction = index % 2 === 0 ? 1 : -1;

      moveX = driftX * (1 - localGlow) + direction * (18 + index * 5) * traceArc + traceRipple;
      moveY = driftY * (1 - localGlow) - (20 + index * 4.8) * traceArc;
    }

    setCssVar(node, "--node-opacity", (baseOpacity + localGlow * (1 - baseOpacity)).toFixed(3));
    setCssVar(node, "--move-x", `${moveX.toFixed(1)}px`);
    setCssVar(node, "--move-y", `${moveY.toFixed(1)}px`);
    setCssVar(node, "--node-branch", `${(isMobile ? 10 + localGlow * 46 + Math.sin(localGlow * Math.PI) * 12 : localGlow * 12).toFixed(1)}px`);
    setCssVar(node, "--node-scale", (0.9 + localGlow * 0.24).toFixed(3));
    setCssVar(node, "--node-glow-size", `${(18 + localGlow * (isMobile ? 18 : 14)).toFixed(1)}px`);
    setCssVar(node, "--node-line-opacity", (0.34 + localGlow * 0.66).toFixed(3));
    setCssVar(node, "--node-line-scale", (0.58 + localGlow * 0.42).toFixed(3));
  });
}

function requestProgressUpdate() {
  const shouldPauseAmbientAnimation = !mobileLayout.matches && !reducedMotion.matches;

  if (shouldPauseAmbientAnimation && !isScrolling) {
    isScrolling = true;
    document.body.classList.add("is-scrolling");
  }

  if (shouldPauseAmbientAnimation) {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      isScrolling = false;
      document.body.classList.remove("is-scrolling");
    }, 140);
  }

  if (ticking) return;
  ticking = true;

  window.requestAnimationFrame(() => {
    setProgress();
    ticking = false;
  });
}

function showToast(message) {
  if (!toast) return;

  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2200);
}

async function copyEmail() {
  const email = copyButton?.dataset.email;
  if (!email) return;

  try {
    await navigator.clipboard.writeText(email);
    showToast("Email copied to clipboard.");
  } catch {
    const copied = fallbackCopy(email);
    showToast(copied ? "Email copied to clipboard." : "Copy failed. Email: yena@moss.land");
  }
}

function fallbackCopy(text) {
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "0";
  field.style.top = "0";
  field.style.width = "1px";
  field.style.height = "1px";
  field.style.opacity = "0";
  field.style.pointerEvents = "none";
  document.body.appendChild(field);
  field.focus();
  field.select();
  field.setSelectionRange(0, field.value.length);

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    field.remove();
  }
}

window.addEventListener("scroll", requestProgressUpdate, { passive: true });
function refreshAndUpdate() {
  refreshMetrics();
  setProgress(true);
}

window.addEventListener("resize", refreshAndUpdate);
if (typeof reducedMotion.addEventListener === "function") {
  reducedMotion.addEventListener("change", refreshAndUpdate);
  mobileLayout.addEventListener("change", refreshAndUpdate);
} else {
  reducedMotion.addListener(refreshAndUpdate);
  mobileLayout.addListener(refreshAndUpdate);
}
copyButton?.addEventListener("click", copyEmail);

refreshMetrics();
setProgress(true);
