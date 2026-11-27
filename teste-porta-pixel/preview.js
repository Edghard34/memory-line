const stage = document.querySelector('#stage');
const screen = document.querySelector('#scene');
const display = screen.getContext('2d');
const doorControl = document.querySelector('#door');
const zoomControl = document.querySelector('#zoom');
const status = document.querySelector('#status');
const room = document.createElement('canvas');
room.width = 528;
room.height = 176;
const scene = room.getContext('2d');

let assets;
let doorOpen = false;
let detail = false;
let view = { scale: 1, left: 0, width: room.width };

function asset(name) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = `assets/${name}.png`;
    });
}

function render() {
    if (!assets) return;
    const [background, frame, closed, open, shadow, actor] = assets;
    scene.imageSmoothingEnabled = false;
    scene.drawImage(background, 0, 0);
    scene.drawImage(shadow, 307, 133);
    scene.drawImage(frame, 311, 61);
    scene.drawImage(doorOpen ? open : closed, doorOpen ? 341 : 315, 65);
    scene.fillStyle = '#211b1963';
    scene.fillRect(283, 135, 17, 2);
    scene.drawImage(actor, 282, 76);

    const dpr = window.devicePixelRatio || 1;
    const bounds = stage.getBoundingClientRect();
    const available = Math.max(1, Math.floor(bounds.width * dpr));
    const fit = Math.max(1, Math.floor(available / room.width));
    const scale = detail ? fit + 2 : fit;
    const width = Math.min(room.width, Math.max(1, Math.floor(available / scale)));
    const left = Math.max(0, Math.min(room.width - width, 320 - Math.floor(width / 2)));
    view = { scale, left, width };
    screen.width = width * scale;
    screen.height = room.height * scale;
    screen.style.width = `${screen.width / dpr}px`;
    screen.style.height = `${screen.height / dpr}px`;
    const center = bounds.left * dpr + (available - screen.width) / 2;
    screen.style.marginLeft = `${(Math.round(center) - bounds.left * dpr) / dpr}px`;

    display.imageSmoothingEnabled = false;
    display.drawImage(room, left, 0, width, room.height, 0, 0, screen.width, screen.height);
    status.textContent = `Grade de 528 × 176. Ampliação ${scale}× em pixels físicos.`;
}

function toggleDoor() {
    doorOpen = !doorOpen;
    doorControl.textContent = doorOpen ? 'Fechar porta' : 'Abrir porta';
    render();
}

doorControl.addEventListener('click', toggleDoor);
zoomControl.addEventListener('click', () => {
    detail = !detail;
    zoomControl.setAttribute('aria-pressed', String(detail));
    zoomControl.textContent = detail ? 'Ver sala' : 'Ampliar detalhe';
    render();
});
screen.addEventListener('click', event => {
    if (!assets) return;
    const bounds = screen.getBoundingClientRect();
    const x = view.left + (event.clientX - bounds.left) * view.width / bounds.width;
    const y = (event.clientY - bounds.top) * room.height / bounds.height;
    if (x >= 311 && x < 357 && y >= 61 && y < 136) toggleDoor();
});
new ResizeObserver(render).observe(stage);

Promise.all(['fundo', 'batente', 'porta-fechada', 'porta-aberta', 'sombra', 'personagem'].map(asset))
    .then(images => {
        assets = images;
        doorControl.disabled = false;
        zoomControl.disabled = false;
        render();
    })
    .catch(() => {
        status.textContent = 'Não foi possível carregar os arquivos da cena.';
    });
