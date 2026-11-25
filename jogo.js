const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const imgs = new Map();
const floor = 392;
let view = 800, camera = 0, x = 275, target = x, velocity = 0, phase = 0;
let facing = 'direita', running = false, previousTap, lastTime;
let street, buildings, marker = 0;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const framePath = (side, gait, frame) => 'personagem/'+side+'/'+gait+'/'+String(frame+1).padStart(2,'0');
async function json(path) {
  const res = await fetch('dados/'+path+'.json');
  if (!res.ok) throw Error(path);
  return res.json();
}
async function load(id) {
  const img = new Image();
  img.src = 'assets/'+id+'.png';
  await img.decode();
  imgs.set(id,img);
}
function resize() {
  const rect = canvas.getBoundingClientRect();
  view = 450 * rect.width / rect.height;
  canvas.width = Math.round(rect.width * Math.min(devicePixelRatio,2));
  canvas.height = Math.round(rect.height * Math.min(devicePixelRatio,2));
  ctx.imageSmoothingEnabled = false;
}
function sprite(id,left,base,height) {
  const img = imgs.get(id);
  ctx.drawImage(img,left-camera,base-height,img.width*height/img.height,height);
}
function update(dt) {
  const delta = target-x;
  const acceleration = running ? 720 : 490;
  const desired = Math.sign(delta)*Math.min(running?205:91,Math.sqrt(2*acceleration*Math.abs(delta)));
  velocity += clamp(desired-velocity,-acceleration*dt,acceleration*dt);
  let step = velocity*dt;
  if (Math.sign(step)===Math.sign(delta) && Math.abs(step)>=Math.abs(delta)) {
    step=delta; velocity=0;
  }
  x = clamp(x+step,8,street.largura-8);
  if (Math.abs(step)>0.001) facing=step>0?'direita':'esquerda';
  phase += Math.abs(step)/(running?106:66);
  const wanted = clamp(x-view*.42,0,Math.max(0,street.largura-view));
  camera += (wanted-camera)*(1-Math.exp(-7*dt));
  marker = Math.max(0,marker-dt);
}
function draw() {
  ctx.setTransform(canvas.width/view,0,0,canvas.height/450,0,0);
  const bg=imgs.get('cenario/horizonte');
  for(let i=-1;i<=Math.ceil(view/1176)+1;i++) {
    ctx.save();ctx.translate(i*1176-camera*.12+(i%2?1176:0),0);
    ctx.scale(i%2?-1:1,1);ctx.drawImage(bg,0,0,1177,floor);ctx.restore();
  }
  for(const [index,b] of street.fachadas.entries()) {
    const layer=buildings[index], structure=imgs.get(layer.id);
    const scale=b.altura/structure.height;
    sprite(layer.id,b.x,floor,b.altura);
    for(const p of layer.partes) {
      const im=imgs.get(p.id);
      ctx.drawImage(im,b.x-camera+p.x*scale,floor-b.altura+p.y*scale,im.width*scale,im.height*scale);
    }
  }
  for(let i=Math.floor(camera/200);i<=(camera+view)/200;i++)
    ctx.drawImage(imgs.get('cenario/rua'),i*200-camera,floor,201,58);
  for(let i=-1;i<5;i++)ctx.drawImage(imgs.get('objetos/fiacao'),500+i*625-camera,40,626,52);
  for(const [name,left,base,height] of street.objetos)sprite('objetos/'+name,left,base,height);
  if(marker>0) {
    ctx.strokeStyle='rgba(255,226,168,'+Math.min(.85,marker*2)+')';
    ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(target-camera,397,8,2.4,0,0,Math.PI*2);ctx.stroke();
  }
  const id=Math.abs(velocity)>2?framePath(facing,running?'correr':'andar',Math.floor(phase*6)%6):'personagem/'+facing+'/parado';
  ctx.drawImage(imgs.get(id),x-camera-55,397-350*110/362,110,110);
}
function loop(time) {
  const dt=Math.min((time-(lastTime??time))/1000,.04);
  lastTime=time;update(dt);draw();requestAnimationFrame(loop);
}
async function start() {
  [street,buildings]=await Promise.all([json('rua'),json('fachadas')]);
  const ids=new Set(['cenario/horizonte','cenario/rua','objetos/fiacao']);
  for(const [name] of street.objetos)ids.add('objetos/'+name);
  for(const b of buildings){ids.add(b.id);for(const p of b.partes)ids.add(p.id);}
  for(const side of ['direita','esquerda']){
    ids.add('personagem/'+side+'/parado');
    for(const gait of ['andar','correr'])for(let i=0;i<6;i++)ids.add(framePath(side,gait,i));
  }
  await Promise.all([...ids].map(load)); resize(); window.addEventListener('resize',resize);
  camera=clamp(x-view*.42,0,Math.max(0,street.largura-view));
  status.textContent='Toque para andar · Dois toques para correr';
  canvas.addEventListener('pointerdown',e=>{
    if(!e.isPrimary || e.button!==0)return;
    const now=performance.now(), rect=canvas.getBoundingClientRect();
    running=Boolean(previousTap && now-previousTap.time<340 && Math.hypot(e.clientX-previousTap.x,e.clientY-previousTap.y)<36);
    previousTap=running?null:{time:now,x:e.clientX,y:e.clientY};
    target=clamp(camera+(e.clientX-rect.left)*view/rect.width,8,street.largura-8);marker=.8;
  });
  requestAnimationFrame(loop);
}
start().catch(err=>{status.textContent='Falha ao abrir os arquivos da vila.';console.error(err);});
