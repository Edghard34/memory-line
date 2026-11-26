import { createStreet, sidewalk } from './street.js';
import { counterDepth, receptionFloor, receptionRoute } from './reception.js';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const status = document.querySelector('#status');
const instructions = document.querySelector('#instructions');
const sceneDoor = document.querySelector('#scene-door');

const frameWidth = 64;
const frameHeight = 88;
const footY = 79;
const frameCount = 8;
const idleFrame = 2;
const directionRows = { south: 0, west: 2, east: 2, north: 3 };
const framesPerSecond = 10;
const walkSpeed = 85;
const street = createStreet(canvas.width, canvas.height);
const idleBreathSeconds = 2.8;

let x = canvas.width / 2;
let y = 173;
let destination = { x, y };
let route = [];
let facing = 'south';
let walkTime = 0;
let idleTime = 0;
let previousFrame;
let actorSheet;
let stationArt;
let walkable = sidewalk;

function changeScene() {
  const entering = walkable === sidewalk;
  walkable = entering ? receptionFloor : sidewalk;
  x = entering ? 71 : 390;
  y = entering ? 151 : 139;
  destination = { x, y };
  route = [];
  facing = 'south';
  walkTime = 0;
  idleTime = 0;
  const action = entering ? 'Voltar para a rua' : 'Entrar na delegacia';
  sceneDoor.textContent = action;
  canvas.setAttribute('aria-label', entering ? 'Recepção da delegacia' : 'Rua da delegacia');
  instructions.textContent = entering
    ? 'Toque no piso para andar ou na porta à esquerda para sair.'
    : 'Toque na calçada para andar ou na porta iluminada para entrar.';
}

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = new URL(path, import.meta.url).href;
  });
}

function walkTo(targetX, targetY) {
  const target = {
    x: Math.max(frameWidth / 2, Math.min(canvas.width - frameWidth / 2, targetX)),
    y: Math.max(walkable.top + 4, Math.min(walkable.bottom - 3, targetY)),
  };
  route = walkable === receptionFloor ? receptionRoute({ x, y }, target) : [target];
  destination = route.shift() ?? { x, y };
  advanceRoute();
}

function advanceRoute() {
  while (route.length && x === destination.x && y === destination.y) {
    destination = route.shift();
  }
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
    advanceRoute();
    if (x === destination.x && y === destination.y) walkTime = 0;
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
  const frame = idle ? idleFrame : step;
  const direction = idle ? 'south' : facing;
  const row = directionRows[direction] * frameHeight;
  if (direction === 'west') context.scale(-1, 1);
  const inhale = idle && idleTime >= 0.7 && idleTime < 1.6 ? 1 : 0;
  context.drawImage(actorSheet, frame * frameWidth, row, frameWidth, footY,
    -frameWidth / 2, -footY - inhale, frameWidth, footY + inhale);
  context.restore();
}

function render(timestamp) {
  const seconds = previousFrame === undefined ? 0 : Math.min((timestamp - previousFrame) / 1000, 0.05);
  previousFrame = timestamp;
  update(seconds);

  context.imageSmoothingEnabled = false;
  const inside = walkable === receptionFloor;
  if (inside) {
    for (const layer of stationArt.room) context.drawImage(layer, 0, 0);
  } else {
    context.drawImage(street, 0, 0);
    context.drawImage(stationArt.facade, 0, 0);
  }
  if (inside && y >= counterDepth) context.drawImage(stationArt.counter, 0, 0);
  context.fillStyle = '#14182465';
  context.beginPath();
  context.ellipse(Math.round(x), Math.round(y), 11, 3, 0, 0, Math.PI * 2);
  context.fill();
  drawActor();
  if (inside) {
    if (y < counterDepth) context.drawImage(stationArt.counter, 0, 0);
    context.drawImage(stationArt.foreground, 0, 0);
    context.drawImage(stationArt.light, 0, 0);
  }
  requestAnimationFrame(render);
}

canvas.addEventListener('click', (event) => {
  if (!stationArt) return;
  const bounds = canvas.getBoundingClientRect();
  const targetX = (event.clientX - bounds.left) * canvas.width / bounds.width;
  const targetY = (event.clientY - bounds.top) * canvas.height / bounds.height;
  const inside = walkable === receptionFloor;
  const atDoor = inside
    ? targetX >= 39 && targetX <= 103 && targetY >= 26 && targetY <= 125
    : targetX >= 370 && targetX <= 412 && targetY >= 64 && targetY <= 112;
  if (atDoor) {
    changeScene();
    return;
  }
  walkTo(targetX, targetY);
});

canvas.addEventListener('keydown', (event) => {
  const targets = {
    ArrowLeft: [0, y],
    ArrowRight: [canvas.width, y],
    ArrowUp: [x, walkable.top + 4],
    ArrowDown: [x, walkable.bottom - 3],
  };
  const target = targets[event.key];
  if (target) {
    event.preventDefault();
    walkTo(...target);
  }
});

sceneDoor.addEventListener('click', () => {
  changeScene();
  canvas.focus();
});

try {
  const files = ['paredes', 'piso', 'moveis', 'primeiro-plano', 'luz', 'fachada', 'balcao'];
  const [character, ...layers] = await Promise.all([
    loadImage('../assets/sprites/personagem_4_direcoes.png?v=0.3.6'),
    ...files.map(name => loadImage(`../assets/backgrounds/delegacia/${name}.png?v=0.4.1`)),
  ]);
  actorSheet = character;
  const [walls, floor, furniture, foreground, light, facade, counter] = layers;
  stationArt = { room: [walls, floor, furniture], foreground, light, facade, counter };
  sceneDoor.disabled = false;
  requestAnimationFrame(render);
} catch {
  status.textContent = 'Não foi possível carregar a cena.';
}
