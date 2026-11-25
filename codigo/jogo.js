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
function draw(){
 ctx.setTransform(canvas.width/view,0,0,canvas.height/450,0,0);
 ctx.imageSmoothingEnabled=true;
 const sky=ctx.createLinearGradient(0,0,0,450);sky.addColorStop(0,'#343b3b');sky.addColorStop(.55,'#89918a');sky.addColorStop(1,'#b5b6a5');ctx.fillStyle=sky;ctx.fillRect(0,0,view,450);
 for(let k=0;k<3;k++){ctx.fillStyle=['#697571','#4b5955','#303d3a'][k];ctx.beginPath();ctx.moveTo(0,450);for(let u=0;u<=view+20;u+=12){let w=u+camera*(.12+k*.19);ctx.lineTo(u,240+k*35+36*Math.sin(w*.003+k)+17*Math.sin(w*.012));}ctx.lineTo(view+20,450);ctx.fill();}
 function tree(x,y,h,seed,col){ctx.save();ctx.translate(x,y);ctx.scale(h/220,h/220);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-13,0);ctx.bezierCurveTo(-7,-60,-17,-145,-6,-220);ctx.lineTo(3,-220);ctx.bezierCurveTo(6,-130,2,-65,12,0);ctx.fill();ctx.strokeStyle=col;ctx.lineCap='round';for(let j=0;j<9;j++){let yy=-45-j*18,dir=j%2?1:-1,len=33+25*Math.sin(seed+j*2);ctx.lineWidth=7-j*.5;ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(dir*len*.6,yy-12,dir*len,yy-44);ctx.stroke();ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(dir*len*.6,yy-15);ctx.lineTo(dir*len*.5,yy-53);ctx.stroke();}ctx.restore();}
 for(let k=0;k<2;k++)for(let i=-2;i<35;i++){let px=i*(83+k*37)+25*Math.sin(i*31)-camera*(.42+k*.34);if(px>-150&&px<view+150)tree(px,390,155+k*70+55*Math.sin(i*7),i,['#56635d','#303b36'][k]);}
 for(let i=0;i<6;i++){let z=street.fachadas[i].x-camera;if(z<-320||z>view+100)continue;let w=155+(i%3)*22,h=110+(i%2)*35,y=391-h;ctx.fillStyle='#242c29';ctx.fillRect(z,y,w,h);ctx.beginPath();ctx.moveTo(z-12,y+4);ctx.lineTo(z+w*.48,y-42);ctx.lineTo(z+w+12,y+4);ctx.fill();ctx.fillStyle='#151c1a';ctx.fillRect(z+w*.66,391-68,30,68);ctx.fillStyle=i===2?'#afa78b':'#57635b';ctx.fillRect(z+25,y+23,35,37);ctx.fillStyle='#292f2c';ctx.fillRect(z+41,y+23,3,37);ctx.fillRect(z+25,y+40,35,3);}
 ctx.fillStyle='#1b2421';ctx.beginPath();ctx.moveTo(0,450);for(let u=0;u<=view+5;u+=5)ctx.lineTo(u,395+2*Math.sin((u+camera)*.07));ctx.lineTo(view+5,450);ctx.fill();
 for(let i=-1;i<160;i++){let px=i*17-camera;if(px<-20||px>view+20)continue;ctx.strokeStyle='#242e28';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(px,418);ctx.quadraticCurveTo(px-3,404,px+7*Math.sin(i*9),399-9*Math.abs(Math.sin(i*4)));ctx.stroke();}
 let id=Math.abs(velocity)>2?framePath(facing,running?'correr':'andar',Math.floor(phase*6)%6):'personagem/'+facing+'/parado';
 ctx.fillStyle='#141b18';ctx.beginPath();ctx.ellipse(x-camera,397,15,3,0,0,Math.PI*2);ctx.fill();
 ctx.filter='grayscale(1) brightness(.22)';ctx.drawImage(imgs.get(id),x-camera-55,397-350*110/362,110,110);ctx.filter='none';
 for(let i=-2;i<15;i++){let px=i*260-camera*1.24;if(px>-160&&px<view+160)tree(px,470,340+55*Math.sin(i*5),i,'#101816');}
 const fog=ctx.createLinearGradient(0,180,0,450);fog.addColorStop(0,'#b9c1ae00');fog.addColorStop(.65,'#aeb8aa18');fog.addColorStop(1,'#111a1870');ctx.fillStyle=fog;ctx.fillRect(0,180,view,270);
 const v=ctx.createRadialGradient(view/2,225,120,view/2,225,Math.hypot(view/2,225));v.addColorStop(0,'#0000');v.addColorStop(1,'#080e0dcc');ctx.fillStyle=v;ctx.fillRect(0,0,view,450);
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
