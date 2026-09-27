export function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);

  for (const [name, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (name === "class") element.className = value;
    else if (name === "style") {
      for (const [property, styleValue] of Object.entries(value)) element.style.setProperty(property, styleValue);
    } else if (name.startsWith("on")) element.addEventListener(name.slice(2), value);
    else element.setAttribute(name, value === true ? "" : String(value));
  }

  element.append(...children.flat(Infinity).filter((child) => child != null && child !== false));
  return element;
}
