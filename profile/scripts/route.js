function smoothPath(points) {
  const last = points.length - 1;
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < last; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(last, i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function anchorsOf(band) {
  return [...band.querySelectorAll(".node-marker")].map((marker) => {
    let x = marker.offsetWidth / 2;
    let y = marker.offsetHeight / 2;
    for (let element = marker; element && element !== band; element = element.offsetParent) {
      x += element.offsetLeft;
      y += element.offsetTop;
    }
    return { x, y };
  });
}

export function layoutRoute(band, horizontal) {
  const svg = band.querySelector(".route-svg");
  const width = band.clientWidth;
  const height = band.clientHeight;
  const anchors = anchorsOf(band);
  const first = anchors[0];
  const last = anchors[anchors.length - 1];
  const points = horizontal
    ? [{ x: -90, y: height / 2 }, ...anchors, { x: width - 26, y: height / 2 }]
    : [{ x: first.x, y: -30 }, ...anchors, { x: last.x, y: height - 24 }];
  const d = smoothPath(points);
  const end = points[points.length - 1];

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.querySelectorAll(".route, .route-shadow").forEach((path) => path.setAttribute("d", d));
  svg.querySelector("#route-gradient").setAttribute("x2", horizontal ? "1" : "0");
  svg.querySelector("#route-gradient").setAttribute("y2", horizontal ? "0" : "1");
  svg.querySelector(".now-cap").setAttribute("transform", `translate(${end.x.toFixed(1)} ${end.y.toFixed(1)})`);

  const route = svg.querySelector(".route");
  const length = route.getTotalLength();
  route.style.setProperty("--route-length", length.toFixed(1));

  return { route, length, packets: [...svg.querySelectorAll(".packet")] };
}

export function placePacket(packet, route, distance, opacity) {
  const point = route.getPointAtLength(distance);
  packet.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
  packet.style.opacity = opacity.toFixed(2);
}
