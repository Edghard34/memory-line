const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const status = document.querySelector('#status');
const imgs = new Map();
const floor = 392;
let view = 800, camera = 0, x = 275, target = x, velocity = 0, phase = 0;
let facing = 'direita', running = false, previousTap, lastTime;
let street, buildings, marker = 0, elapsed=0, hintTime=0;
const places=['Rua da Oficina','Mercearia','Padaria','Farmácia','Pousada','Casa do fim da rua'];
const thoughts=['O motor esfriou. Ninguém veio buscar o carro.','O cheiro de fruta madura atravessa a calçada.','A padaria está aberta. Mas não se ouve ninguém.','O relógio da farmácia parece ter parado.','Uma cortina se move atrás da janela.','Há algo familiar nesta casa.'];
let currentPlace=-1;
const dust=Array.from({length:32},(_,i)=>({x:(i*173.71)%2070,y:75+(i*47.3)%310,r:.5+(i%3)*.35}));
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
  elapsed+=dt;
  const place=street.fachadas.reduce((best,b,i)=>Math.abs(b.x+120-x)<Math.abs(street.fachadas[best].x+120-x)?i:best,0);
  if(place!==currentPlace){currentPlace=place;hintTime=5;document.querySelector('h1').textContent=places[place];status.textContent=thoughts[place];}
  hintTime=Math.max(0,hintTime-dt);if(hintTime===0)status.textContent='Toque para andar · Dois toques para correr';
  const delta = target-x;
  const acceleration = running ? 720 : 490;
  const desired = Math.sign(delta)*Math.min(running?205:91,Math.sqrt(2*acceleration*Math.abs(delta)));
  velocity += clamp(desired-velocity,-acceleration*dt,acceleration*dt);
  let step = velocity*dt;
  if (Math.sign(step)===Math.sign(delta) && Math.abs(step)>=Math.abs(delta)) {
    step=delta; velocity=0;
  }
  x = clamp(x+step,8,street.largura-8); if(Math.abs(target-x)<.05 && Math.abs(velocity)<2)velocity=0;
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
    ctx.save();ctx.translate(i*1176-(camera*.22%1176)+(i%2?1176:0),0);
    ctx.scale(i%2?-1:1,1);ctx.drawImage(bg,0,0,1177,floor);ctx.restore();
  }
  // Atmospheric perspective between distant landscape and street.
  const haze=ctx.createLinearGradient(0,80,0,floor);
  haze.addColorStop(0,'rgba(137,125,145,.02)');haze.addColorStop(1,'rgba(188,160,137,.23)');
  ctx.fillStyle=haze;ctx.fillRect(0,0,view,floor);
  for(const [index,b] of street.fachadas.entries()) {
    const layer=buildings[index], structure=imgs.get(layer.id);
    const scale=b.altura/structure.height;
    ctx.save();ctx.globalAlpha=.24;ctx.fillStyle='#201c29';ctx.fillRect(b.x-camera+5,floor-b.altura+7,structure.width*scale,b.altura);ctx.restore();
    sprite(layer.id,b.x,floor,b.altura);
    for(const p of layer.partes) {
      const im=imgs.get(p.id);
      ctx.drawImage(im,b.x-camera+p.x*scale,floor-b.altura+p.y*scale,im.width*scale,im.height*scale);
    }
  }
  for(let i=Math.floor(camera/200);i<=(camera+view)/200;i++)
    ctx.drawImage(imgs.get('cenario/rua'),i*200-camera,floor,201,58);
  for(let i=-1;i<5;i++)ctx.drawImage(imgs.get('objetos/fiacao'),500+i*625-camera,40,626,52);
  for(const [name,left,base,height] of street.objetos){
    const im=imgs.get('objetos/'+name),w=im.width*height/im.height;
    ctx.fillStyle='rgba(24,20,29,.26)';ctx.beginPath();ctx.ellipse(left-camera+w*.55,base+1,Math.max(4,w*.32),Math.min(7,height*.045),0,0,Math.PI*2);ctx.fill();
    sprite('objetos/'+name,left,base,height);
  }
  ctx.fillStyle='rgba(25,20,30,.38)';ctx.beginPath();ctx.ellipse(x-camera+2,397,13,3,0,0,Math.PI*2);ctx.fill();
  if(marker>0) {
    ctx.strokeStyle='rgba(255,226,168,'+Math.min(.85,marker*2)+')';
    ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(target-camera,397,8,2.4,0,0,Math.PI*2);ctx.stroke();
  }
  const id=Math.abs(velocity)>2?framePath(facing,running?'correr':'andar',Math.floor(phase*6)%6):'personagem/'+facing+'/parado';
  ctx.drawImage(imgs.get(id),x-camera-55,397-350*110/362,110,110);
  // Restrained dusk grading and moving airborne particles.
  const grade=ctx.createLinearGradient(0,0,0,450);
  grade.addColorStop(0,'rgba(45,43,77,.19)');grade.addColorStop(.65,'rgba(115,69,48,.07)');grade.addColorStop(1,'rgba(28,24,42,.25)');
  ctx.fillStyle=grade;ctx.fillRect(0,0,view,450);
  for(const p of dust){const px=((p.x+elapsed*7)%2070)-camera;if(px<0||px>view)continue;ctx.globalAlpha=.15+.12*Math.sin(elapsed*.7+p.x);ctx.fillStyle='#f8d9aa';ctx.fillRect(px,p.y+Math.sin(elapsed*.5+p.x)*5,p.r,p.r);}
  ctx.globalAlpha=1;
  const vignette=ctx.createRadialGradient(view*.5,225,Math.min(view,450)*.28,view*.5,225,Math.hypot(view/2,225));
  vignette.addColorStop(0,'rgba(18,15,29,0)');vignette.addColorStop(1,'rgba(18,15,29,.48)');ctx.fillStyle=vignette;ctx.fillRect(0,0,view,450);
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
