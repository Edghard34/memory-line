const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const status = document.querySelector('#status');

const frameWidth = 64;
const frameHeight = 88;
const footY = 79;
const frameCount = 8;
const framesPerSecond = 10;
const walkSpeed = 85;
const floorTop = 82;
const idleBreathSeconds = 2.8;

let x = canvas.width / 2;
let y = 173;
let destination = { x, y };
let facing = 'south';
let walkTime = 0;
let idleTime = 0;
let previousFrame;
let sideSheet;
let verticalSheet;

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = new URL(path, import.meta.url).href;
  });
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
  const frame = idle ? 0 : step;
  const vertical = idle || facing === 'north' || facing === 'south';
  const row = !idle && facing === 'north' ? frameHeight : 0;
  const inhale = idle && idleTime >= 0.7 && idleTime < 1.6 ? 1 : 0;
  context.scale(!vertical && facing === 'west' ? -1 : 1, 1);
  context.drawImage(vertical ? verticalSheet : sideSheet, frame * frameWidth, row, frameWidth, footY,
    -frameWidth / 2, -footY - inhale, frameWidth, footY + inhale);
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
  [sideSheet, verticalSheet] = await Promise.all([
    loadImage('https://raw.githubusercontent.com/Edghard34/memory-line/fc4a1fb7e317e86a1dee18d215277c3a27181474/assets/sprites/walk-side.png'),
    loadImage('https://raw.githubusercontent.com/Edghard34/memory-line/fc4a1fb7e317e86a1dee18d215277c3a27181474/assets/sprites/caminhada_norte_sul.png'),
  ]);
  requestAnimationFrame(render);
} catch {
  status.textContent = 'Não foi possível carregar os sprites.';
}
