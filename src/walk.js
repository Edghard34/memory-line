const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const status = document.querySelector('#status');
const sheet = new Image();

const frameWidth = 64;
const frameCount = 8;
const idleFrame = 3;
const idleBreathSeconds = 2.8;
const framesPerSecond = 10;
const walkSpeed = 85;
const groundY = 182;
const footY = 79;

let x = canvas.width / 2;
let destination = x;
let facing = 1;
let walkTime = 0;
let idleTime = 0;
let previousFrame;

function walkTo(targetX) {
  destination = Math.max(frameWidth / 2, Math.min(canvas.width - frameWidth / 2, targetX));
}

function update(seconds) {
  const distance = destination - x;
  if (distance === 0) {
    idleTime = (idleTime + seconds) % idleBreathSeconds;
    return;
  }

  idleTime = 0;

  facing = Math.sign(distance);
  const step = walkSpeed * seconds;
  if (Math.abs(distance) <= step) {
    x = destination;
    walkTime = 0;
    return;
  }
  x += facing * step;
  walkTime += seconds;
}

function render(timestamp) {
  const seconds = previousFrame === undefined ? 0 : Math.min((timestamp - previousFrame) / 1000, 0.05);
  previousFrame = timestamp;
  update(seconds);

  context.fillStyle = '#222b39';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#343b46';
  context.fillRect(0, groundY, canvas.width, canvas.height - groundY);
  context.imageSmoothingEnabled = false;

  const idle = x === destination;
  const frame = idle ? idleFrame : Math.floor(walkTime * framesPerSecond) % frameCount;
  const inhale = idle && idleTime >= 0.7 && idleTime < 1.6 ? 1 : 0;
  context.save();
  context.translate(Math.round(x), groundY);
  context.scale(facing, 1);
  context.drawImage(sheet, frame * frameWidth, 0, frameWidth, footY,
    -frameWidth / 2, -footY - inhale, frameWidth, footY + inhale);
  context.restore();
  requestAnimationFrame(render);
}

canvas.addEventListener('click', (event) => {
  const bounds = canvas.getBoundingClientRect();
  walkTo((event.clientX - bounds.left) * canvas.width / bounds.width);
});

canvas.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    walkTo(event.key === 'ArrowLeft' ? 0 : canvas.width);
  }
});

sheet.addEventListener('load', () => requestAnimationFrame(render));
sheet.addEventListener('error', () => {
  status.textContent = 'A folha de sprites não carregou.';
});
sheet.src = new URL('../assets/sprites/walk-side.png', import.meta.url).href;
