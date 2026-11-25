function sprite(context,key,x,y,width,flip=false){
 const img=images[key];if(!img?.complete||!img.naturalWidth)return;
 const height=Math.max(1,Math.round(width*img.naturalHeight/img.naturalWidth));
 context.save();context.translate(Math.round(x),Math.round(y));if(flip)context.scale(-1,1);
 context.imageSmoothingEnabled=false;context.drawImage(img,-Math.round(width/2),-height,width,height);context.restore();
}
function campClear(x,y){return Math.abs(x-W/2)<30&&y>H-490||Math.hypot(x-W/2-78,y-H+421)<65|| (Math.abs(y-H+421)<18&&x>W/2&&x<W/2+78)}
function prepareFloor(zone,random){
 const c=floor.getContext('2d'),bg=c.createLinearGradient(0,34,W,H);
 bg.addColorStop(0,zone[3]);bg.addColorStop(.48,zone[2]);bg.addColorStop(1,zone[3]);
 c.fillStyle=bg;c.fillRect(0,0,W,H);
 c.fillStyle='#70513a';c.fillRect(W/2-19,H-490,38,490);c.fillRect(W/2,H-435,78,28);c.beginPath();c.ellipse(W/2+78,H-421,57,45,0,0,TAU);c.fill();
 for(let i=0;i<81600;i++){
  const x=Math.floor(random()*W),y=Math.floor(random()*H);
  const road=campClear(x,y);
  c.fillStyle=road?(i%2?'#e9ae7920':'#04040920'):(i%2?zone[4]+'2d':'#08070b48');
  c.fillRect(x,y,1+Math.floor(random()*5),1+(i%5===0?1:0));
 }
 for(let i=0;i<2880;i++){
  const x=12+random()*(W-24),y=40+random()*(H-52);
  if(campClear(x,y))continue;
  c.globalAlpha=.41+random()*.51;sprite(c,choose(zone[6],random),x,y,3+Math.floor(random()*7),random()<.5);
 }
 c.globalAlpha=1;
 for(let x=6;x<W+8;x+=15){sprite(c,'wall_'+zone[1],x,44,16);sprite(c,'wall_'+zone[1],x,H+7,16)}
 for(let y=63;y<H;y+=16){sprite(c,'wall_'+zone[1],6,y,11);sprite(c,'wall_'+zone[1],W-6,y,11)}
 for(let i=0;i<704;i++){
  const x=20+random()*(W-40),y=52+random()*(H-69);
  if(campClear(x,y))continue;
  const edge=x<55||x>W-55||y>H-42;
  if(!edge&&((x>100&&x<320)||random()>.55))continue;
  if(!edge&&Math.abs(y-113)<17)continue;
  const key=choose(zone[5],random),w=14+Math.floor(random()*24);
  const ob={x,y,k:key,w,r:w*.18};
  if(objects.some(o=>distance(ob,o)<14))continue;
  objects.push(ob);
 }
}
function light(x,y,r,color){
 const l=g.createRadialGradient(x,y,0,x,y,r);
 l.addColorStop(0,color);l.addColorStop(1,'#ffae5000');
 g.fillStyle=l;g.fillRect(x-r,y-r,r*2,r*2);
}
function littleText(str,x,y,color='#fff0ba',size=8){
 g.textAlign='center';g.font='bold '+size+'px monospace';g.fillStyle='#140c19';g.fillText(str,Math.round(x)+1,Math.round(y)+1);
 g.fillStyle=color;g.fillText(str,Math.round(x),Math.round(y));
}
function danger(h){
 const r=seeded(h.seed),active=h.delay<=0;
 if(active)light(h.x,h.y,h.r+9,biome[1]==='cuca'?'#bc58cc54':'#fd5d3e50');
 for(let i=0;i<25;i++){
  const a=i*TAU/25,j=h.r+(r()-.6)*4;
  const x=h.x+Math.cos(a)*j,y=h.y+Math.sin(a)*j*.83;
  g.fillStyle=active?(i%3===0?'#ffe19a':'#ff7849'):(i%2?'#ff5959':'#d59b66');
  if(active||Math.sin(globalTime*15+i)>.0)g.fillRect(Math.round(x),Math.round(y),i%3===0?2:1,2);
 }
 if(active)for(let i=0;i<6;i++){const x=h.x+(r()-.5)*h.r*1.3,y=h.y+(r()-.5)*h.r;sprite(g,biome[1]==='cuca'?'p_spit':'p_ember',x,y-Math.sin(globalTime*9+i)*2,4+i%4)}
}
function render(){
 g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,0,0);g.fillStyle=biome[3];g.fillRect(0,0,420,282);const cx=player?player.x-210:W/2-210,cy=player?player.y-141:H*.70-141;g.translate(-Math.round(cx),-Math.round(cy));g.drawImage(floor,0,0);
 const title=!run||mode==='menu'||mode==='hero'||mode==='forge'||mode==='codex'||mode==='confirm'||(mode==='settings'&&!player);
 for(const d of doors){
  light(d.x,d.y-7,32,'#ffc75b48');sprite(g,'door_'+biome[1]+'_o',d.x,d.y,28);
  sprite(g,d.icon,d.x,d.y+10,10);littleText(d.label,d.x,d.y+21);
 }
 for(const h of hazards)danger(h);
 for(const e of enemies){
  if(e.warn<=0)continue;
  const a=Math.atan2(e.vy,e.vx);
  const len=Math.hypot(e.vx,e.vy)*e.chargeLength;
  for(let d=6;d<len;d+=6){const x=e.x+Math.cos(a)*d,y=e.y+Math.sin(a)*d;if(x>16&&x<W-16&&y>45&&y<H-22){g.fillStyle=d%12?'#f58058':'#ebca83';g.fillRect(Math.round(x),Math.round(y),3,2)}}
 }
 for(let i=0;i<29;i++){
  const x=(i*53+Math.sin(globalTime*.67+i)*11+W)%W,y=(i*71+Math.sin(globalTime*.8+i*2)*10+H)%H;
  if(i%4===0)light(x,y,12,'#ffc56528');
  if(Math.sin(globalTime*2+i)>-.15)sprite(g,i%2?'vaga0':'vaga1',x,y,i%5?2:4);
 }
 for(const drop of drops){
  const k=drop.k==='coin0'?'coin'+Math.floor(globalTime*7)%3:drop.k;
  if(k==='ember')light(drop.x,drop.y,16,'#ff8a3c57');
  sprite(g,k,drop.x,drop.y-2+Math.sin(globalTime*6+drop.x)*2,9);
 }
 const layers=objects.filter(o=>Math.abs(o.x-cx-210)<260&&Math.abs(o.y-cy-141)<190).map(o=>({y:o.y,run:()=>{if(o.k==='fire0')light(o.x,o.y-10,65,'#ff9a405c');sprite(g,'shadow_m',o.x,o.y+2,o.w*.66);sprite(g,o.k==='fire0'&&globalTime%1<.5?'fire1':o.k,o.x,o.y,o.w);if(o.npc)littleText(o.npc,o.x,o.y-30)}}));
 for(const e of enemies)layers.push({y:e.y,run:()=>{
  const width=e.boss?(e.id==='b_mula'?50:43):e.elite?32:e.id==='mapinguari'?33:e.id==='cupinho'?15:23;
  sprite(g,'shadow_m',e.x,e.y+2,width*.64);
  const bob=e.type==='weave'||e.type==='shot'||e.type==='orbit'?2+Math.sin(e.age*11)*2:Math.sin(e.age*(e.charge>0?25:13))*1.1;
  if(e.elite)light(e.x,e.y-9,25,'#ce4c8564');
  if(e.hit>0)g.filter='brightness(1.75)';
  sprite(g,e.id,e.x,e.y-bob,width,player.x<e.x&&e.id!=='b_mula'&&e.id!=='queixada');
  g.filter='none';
  if(e.boss||e.elite||e.hit>0){const w=e.boss?43:21;g.fillStyle='#230f1a';g.fillRect(Math.round(e.x-w/2),Math.round(e.y+5),w,3);g.fillStyle=e.boss?'#e67462':'#ebae6f';g.fillRect(Math.round(e.x-w/2),Math.round(e.y+5),Math.ceil(clamp(e.hp/e.max,0,1)*w),2)}
 }});
 const actor=title?{x:W/2,y:H*.70,hp:100,facing:1,inv:0,walk:0}:player;
 if(actor)layers.push({y:actor.y,run:()=>{
  const key=title?'luzia':hero[1];
  const frame=actor.walk?Math.floor(actor.walk)%4:0;
  sprite(g,'shadow_m',actor.x,actor.y+2,15);
  g.globalAlpha=actor.inv>0&&Math.floor(globalTime*22)%2?.55:1;
  sprite(g,key+[0,1,0,2][frame],actor.x,actor.y+(frame===1?-1:0),24,actor.facing<0);g.globalAlpha=1;
  if(key!=='luzia')sprite(g,'ember',actor.x+actor.facing*8,actor.y-6,6);
 }});
 layers.sort((a,b)=>a.y-b.y).forEach(layer=>layer.run());
 for(const s of shots){
  const w=s.team==='you'?(s.id==='p_pellet'?5:8):8;
  if(s.team==='you')light(s.x,s.y,9,'#ffcc7259');
  sprite(g,s.id,s.x,s.y+w/2,w);
 }
 for(const p of fx){g.globalAlpha=clamp(p.life/p.max,0,1);g.fillStyle=p.color;g.fillRect(Math.round(p.x),Math.round(p.y),p.max>.4?2:1,2)}
 g.globalAlpha=1;
 if(actor){
  const health=title?1:actor.hp/maxFlame(),r=57+health*78;
  const vx=actor.x+actor.facing*7,vy=actor.y-10;
  const dark=g.createRadialGradient(vx,vy,18,vx,vy,r*1.6);
  dark.addColorStop(0,'#100b1800');dark.addColorStop(.43,'#100b180b');dark.addColorStop(1,health<.25?'#200e21c9':'#100c1a95');
  g.fillStyle=dark;g.fillRect(0,0,W,H);
  g.globalCompositeOperation='screen';light(vx,vy,r*.71,health<.22?'#ee612448':'#f9913f40');light(vx,vy,21,'#ffb35554');g.globalCompositeOperation='source-over';
 }
 if(flash>0){g.fillStyle='rgba(255,199,106,'+flash*.38+')';g.fillRect(0,0,W,H)}
 g.setTransform(1,0,0,1,0,0);const vignette=g.createRadialGradient(210,146,97,210,146,235);
 vignette.addColorStop(0,'#12091600');vignette.addColorStop(1,'#0a0612b2');g.fillStyle=vignette;g.fillRect(0,0,420,282);
 const vw=canvas.width,vh=canvas.height,fit=Math.min(vw/420,vh/282),sw=Math.floor(420*fit),sh=Math.floor(282*fit);
 const sx=Math.floor((vw-sw)/2),sy=Math.floor((vh-sh)/2)-(vh>vw?Math.floor(vh*.054):0);
 view={x:sx,y:sy,w:sw,h:sh};ctx.fillStyle='#110e14';ctx.fillRect(0,0,vw,vh);ctx.imageSmoothingEnabled=false;
 const jitter=0;
 ctx.drawImage(world,sx+Math.round(Math.sin(globalTime*153)*jitter),sy+Math.round(Math.cos(globalTime*170)*jitter),sw,sh);
}
