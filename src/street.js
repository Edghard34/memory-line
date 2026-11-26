export const sidewalk = { top: 111, bottom: 190 };

export function createStreet(width, height) {
  const layer = document.createElement('canvas');
  layer.width = width;
  layer.height = height;
  const draw = layer.getContext('2d');

  function stripe(y, height, color) {
    draw.fillStyle = color;
    draw.fillRect(0, y, width, height);
  }

  const sky = draw.createLinearGradient(0, 0, 0, sidewalk.top);
  sky.addColorStop(0, '#101426');
  sky.addColorStop(1, '#242c43');
  stripe(0, sidewalk.top, sky);

  const roadTop = sidewalk.bottom + 5;
  stripe(roadTop, height - roadTop, '#242631');
  stripe(roadTop, 4, '#1b1d28');
  stripe(roadTop + 5, 1, '#30313d');
  draw.fillStyle = '#5e5860';
  for (let x = -19; x < width; x += 92) draw.fillRect(x, height - 11, 43, 2);

  stripe(sidewalk.top, 16, '#383b48');
  stripe(sidewalk.top + 16, 23, '#424552');
  stripe(sidewalk.top + 39, 23, '#4b4e5a');
  stripe(sidewalk.top + 62, 18, '#535663');
  for (const y of [111, 127, 150, 173]) stripe(y, 1, '#2a2d39');

  for (let x = -64; x < width + 64; x += 72) {
    draw.fillStyle = '#353845';
    draw.beginPath();
    draw.moveTo(x + (width / 2 - x) * 0.24, sidewalk.top);
    draw.lineTo(x, sidewalk.bottom);
    draw.lineTo(x + 1, sidewalk.bottom);
    draw.lineTo(x + (width / 2 - x) * 0.24 + 1, sidewalk.top);
    draw.fill();
  }

  stripe(sidewalk.bottom, 2, '#777785');
  stripe(sidewalk.bottom + 2, 3, '#454652');
  draw.fillStyle = '#30323e';
  for (let x = 8; x < width; x += 48) draw.fillRect(x, sidewalk.bottom + 1, 1, 4);

  // A fixed seed keeps the asphalt and concrete grain stable while walking.
  let seed = 143;
  for (let i = 0; i < 850; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const x = (seed >>> 12) % width;
    const y = sidewalk.top + 1 + (seed & 4095) % (height - sidewalk.top - 1);
    if (y >= sidewalk.bottom && y < roadTop + 4) continue;
    draw.fillStyle = i % 2 ? '#070a151c' : '#c6c6d620';
    draw.fillRect(x, y, i % 7 === 0 ? 2 : 1, 1);
  }

  return layer;
}
