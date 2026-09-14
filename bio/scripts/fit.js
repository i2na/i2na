const LEVELS = 3;
const root = document.documentElement;

function setDensity(level) {
  if (level) root.dataset.density = String(level);
  else delete root.dataset.density;
}

export function fitViewport(horizontal) {
  if (!horizontal) {
    setDensity(0);
    return;
  }
  for (let level = 0; level <= LEVELS; level++) {
    setDensity(level);
    if (root.scrollHeight <= window.innerHeight) return;
  }
}
