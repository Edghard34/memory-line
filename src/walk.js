const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const status = document.querySelector('#status');

const frameWidth = 64;
const footY = 79;
const frameCount = 8;
const framesPerSecond = 10;
const walkSpeed = 85;
const floorTop = 82;
const idleBreathSeconds = 2.8;

let x = canvas.width / 2;
let y = 173;
let destination = { x, y };
let facing = 'east';
let walkTime = 0;
let idleTime = 0;
let previousFrame;
let sideSheet;
let verticalFrames;

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = new URL(path, import.meta.url).href;
  });
}

function readVerticalFrame(sheet, index) {
  const left = Math.round((index % 4) * sheet.width / 4);
  const top = Math.round(Math.floor(index / 4) * sheet.height / 4);
  const right = Math.round((index % 4 + 1) * sheet.width / 4);
  const bottom = Math.round((Math.floor(index / 4) + 1) * sheet.height / 4);
  const frame = document.createElement('canvas');
  const width = frame.width = right - left;
  const height = frame.height = bottom - top;
  const pixels = frame.getContext('2d');
  pixels.drawImage(sheet, left, top, width, height, 0, 0, width, height);
  const image = pixels.getImageData(0, 0, width, height);
  const { data } = image;
  const pending = [];

  // Clear the white backdrop connected to the edge, preserving the white shirt.
  function clearBackdrop(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const offset = (y * width + x) * 4;
    if (data[offset + 3] === 0 ||
      Math.min(data[offset], data[offset + 1], data[offset + 2]) < 227) return;
    data[offset + 3] = 0;
    pending.push(y * width + x);
  }

  for (let x = 0; x < width; x++) {
    clearBackdrop(x, 0);
    clearBackdrop(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    clearBackdrop(0, y);
    clearBackdrop(width - 1, y);
  }
  while (pending.length) {
    const point = pending.pop();
    const x = point % width;
    const y = Math.floor(point / width);
    clearBackdrop(x - 1, y);
    clearBackdrop(x + 1, y);
    clearBackdrop(x, y - 1);
    clearBackdrop(x, y + 1);
  }

  let firstRow = height;
  let lastRow = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] === 0) continue;
      firstRow = Math.min(firstRow, y);
      lastRow = y;
    }
  }

  pixels.putImageData(image, 0, 0);
  return { image: frame, top: firstRow, height: lastRow - firstRow + 1 };
}

function walkTo(targetX, targetY) {
  destination = {
    x: Math.max(frameWidth / 2, Math.min(canvas.width - frameWidth / 2, targetX)),
    y: Math.max(floorTop + 1, Math.min(canvas.height - 5, targetY)),
  };
}

function update(seconds) {
  const dx = destination.x - x;
  const dy = destination.y - y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    idleTime = (idleTime + seconds) % idleBreathSeconds;
    return;
  }

  idleTime = 0;
  facing = Math.abs(dx) >= Math.abs(dy)
    ? (dx < 0 ? 'west' : 'east')
    : (dy < 0 ? 'north' : 'south');
  const step = walkSpeed * seconds;
  if (distance <= step) {
    ({ x, y } = destination);
    walkTime = 0;
    return;
  }
  x += dx / distance * step;
  y += dy / distance * step;
  walkTime += seconds;
}

function drawActor() {
  const idle = x === destination.x && y === destination.y;
  const step = Math.floor(walkTime * framesPerSecond) % frameCount;
  context.save();
  context.translate(Math.round(x), Math.round(y));
  if (idle || facing === 'north' || facing === 'south') {
    const index = idle ? 0 : step + (facing === 'north' ? frameCount : 0);
    const frame = verticalFrames[index];
    const height = 73 + (idle && idleTime >= 0.7 && idleTime < 1.6 ? 1 : 0);
    const width = Math.round(frame.image.width * 73 / frame.height);
    context.drawImage(frame.image, 0, frame.top, frame.image.width, frame.height,
      -Math.round(width / 2), -height, width, height);
  } else {
    context.scale(facing === 'west' ? -1 : 1, 1);
    context.drawImage(sideSheet, step * frameWidth, 0, frameWidth, footY,
      -frameWidth / 2, -footY, frameWidth, footY);
  }
  context.restore();
}

function render(timestamp) {
  const seconds = previousFrame === undefined ? 0 : Math.min((timestamp - previousFrame) / 1000, 0.05);
  previousFrame = timestamp;
  update(seconds);

  context.fillStyle = '#222b39';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#343b46';
  context.fillRect(0, floorTop, canvas.width, canvas.height - floorTop);
  context.imageSmoothingEnabled = false;
  drawActor();
  requestAnimationFrame(render);
}

canvas.addEventListener('click', (event) => {
  const bounds = canvas.getBoundingClientRect();
  walkTo((event.clientX - bounds.left) * canvas.width / bounds.width,
    (event.clientY - bounds.top) * canvas.height / bounds.height);
});

canvas.addEventListener('keydown', (event) => {
  const targets = {
    ArrowLeft: [0, y],
    ArrowRight: [canvas.width, y],
    ArrowUp: [x, floorTop + 1],
    ArrowDown: [x, canvas.height],
  };
  const target = targets[event.key];
  if (target) {
    event.preventDefault();
    walkTo(...target);
  }
});

try {
  const [side, vertical] = await Promise.all([
    loadImage('../assets/sprites/walk-side.png'),
    loadImage('../assets/sprites/walk-front-back.jpg'),
  ]);
  sideSheet = side;
  verticalFrames = Array.from({ length: frameCount * 2 }, (_, index) => readVerticalFrame(vertical, index));
  requestAnimationFrame(render);
} catch {
  status.textContent = 'Não foi possível carregar os sprites.';
}
