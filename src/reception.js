const counter = { left: 115, right: 274, top: 176, bottom: 204 };
const corners = [
  { x: counter.left, y: counter.top },
  { x: counter.right, y: counter.top },
  { x: counter.left, y: counter.bottom },
  { x: counter.right, y: counter.bottom },
];

export const counterDepth = 198;
export const receptionFloor = { top: 143, bottom: 229 };

export function receptionFloorTop(x) {
  return Math.max(receptionFloor.top, 205 - x * 0.28);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function crossesCounter(a, b) {
  let entry = 0;
  let exit = 1;
  for (const [axis, min, max] of [
    ['x', counter.left, counter.right],
    ['y', counter.top, counter.bottom],
  ]) {
    const speed = b[axis] - a[axis];
    if (speed === 0) {
      if (a[axis] <= min || a[axis] >= max) return false;
      continue;
    }
    const first = (min - a[axis]) / speed;
    const last = (max - a[axis]) / speed;
    entry = Math.max(entry, Math.min(first, last));
    exit = Math.min(exit, Math.max(first, last));
  }
  return entry < exit - 1e-9;
}

export function receptionRoute(from, target) {
  if (target.x > counter.left && target.x < counter.right &&
      target.y > counter.top && target.y < counter.bottom) {
    const edges = [
      { x: counter.left, y: target.y },
      { x: counter.right, y: target.y },
      { x: target.x, y: counter.top },
      { x: target.x, y: counter.bottom },
    ];
    target = edges.reduce((nearest, edge) =>
      distance(edge, target) < distance(nearest, target) ? edge : nearest);
  }
  if (!crossesCounter(from, target)) return [target];

  let best = [];
  let shortest = Infinity;
  for (const first of corners) {
    if (crossesCounter(from, first)) continue;
    for (const last of corners) {
      if (crossesCounter(first, last) || crossesCounter(last, target)) continue;
      const length = distance(from, first) + distance(first, last) + distance(last, target);
      if (length < shortest) {
        shortest = length;
        best = first === last ? [first, target] : [first, last, target];
      }
    }
  }
  return best;
}
