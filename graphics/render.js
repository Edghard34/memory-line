const villageHouses=[0,1,2].map(type=>{
 const c=document.createElement('canvas');c.width=132;c.height=118;const g=c.getContext('2d');const rnd=seeded(934+type*23);const rect=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};const poly=(pts,col)=>{g.fillStyle=col;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill()};
 g.fillStyle='#171b1570';g.beginPath();g.ellipse(67,107,59,8,0,0,Math.PI*2);g.fill();
 rect(20,55,94,48,'#392b24');rect(23,57,88,42,'#a58a69');rect(23,57,13,42,'#79634e');for(let i=0;i<340;i++){const x=24+Math.floor(rnd()*86),y=58+Math.floor(rnd()*40);rect(x,y,1+Math.floor(rnd()*3),1,rnd()<.5?'#92765a':'#b39a77')}
 for(let y=91;y<104;y+=5)for(let x=22-(y%2)*3;x<111;x+=9){rect(x,y,8,4,'#635952');rect(x,y,7,1,'#93847a')}
 for(const x of [22,109]){rect(x,56,4,46,'#50392a');rect(x,56,1,46,'#96704a')}
 const dx=type===2?37:59;rect(dx-3,70,24,33,'#3b2921');rect(dx,73,18,29,'#785034');for(let x=dx+2;x<dx+18;x+=4){rect(x,74,1,27,'#473124');rect(x+1,75,1,25,'#98704b')}rect(dx+14,88,2,2,'#d2a86a');rect(dx-5,102,28,3,'#81766a');
 const wx=type===2?82:33;rect(wx-2,72,21,17,'#4c3527');rect(wx,74,17,12,'#242522');rect(wx+8,74,2,12,'#a57a50');rect(wx,79,17,2,'#a57a50');rect(wx-3,88,23,2,'#ad8054');
 const straw=type===1;poly([[9,59],[22,15],[104,15],[124,59],[116,66],[15,66]],'#392820');poly([[13,58],[25,18],[102,18],[120,58],[114,62],[17,62]],straw?'#a77a3e':'#88432f');
 if(straw){for(let y=20;y<61;y+=12){for(let x=20+Math.max(0,34-y);x<112-Math.max(0,34-y);x+=3){const n=Math.floor(rnd()*5);rect(x,y+n,2,11, ['#b78b49','#d3a35b','#8b6032','#c69953'][Math.floor(rnd()*4)]);rect(x,y+n,1,7,'#e0b36a')}}}else{for(let y=19;y<62;y+=8){const left=Math.round(25-(y-19)*.26),right=Math.round(102+(y-19)*.38);for(let x=left-(y%3)*2;x<right-3;x+=8){rect(x,y,7,7,'#67382b');rect(x+1,y,6,5,['#b05b40','#c16b4a','#a65037','#ad573c'][Math.floor(rnd()*4)]);rect(x+1,y,5,1,'#d18159');rect(x+1,y+5,5,1,'#803d2b')}}}
 rect(25,15,78,4,straw?'#d0a35e':'#ad6045');rect(27,15,74,1,straw?'#e0b778':'#d08058');
 if(type===0){rect(92,6,12,28,'#4d4440');for(let y=8;y<32;y+=5){rect(93,y,10,4,'#81736a');rect(93,y,9,1,'#aa9687')}rect(90,5,16,4,'#9b8b7e');rect(94,6,8,2,'#292323')}
 for(let i=0;i<55;i++){const x=Math.floor(12+rnd()*107),y=Math.floor(100+rnd()*8);if(Math.abs(x-dx-9)<15)continue;rect(x,y,2,2,['#475536','#657347','#849052'][Math.floor(rnd()*3)])}
 return c;
});
function bedrollCanvas(g,x,y,green){const a=bedrollArt[green?1:0];g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';for(let j=0;j<27;j++)for(let i=0;i<18;i++){const c=a.palette[parseInt(a.rows[j][i],16)];if(c){g.fillStyle=c;g.fillRect(Math.round(x)-9+i,Math.round(y)-27+j,1,1)}}g.restore();}
const nightShade=document.createElement('canvas');nightShade.width=420;nightShade.height=282;
function sprite(context,key,x,y,width,flip=false){
 const img=images[key];if(!img?.complete||!img.naturalWidth)return;
 const height=Math.max(1,Math.round(width*img.naturalHeight/img.naturalWidth));
 context.save();context.translate(Math.round(x),Math.round(y));if(flip)context.scale(-1,1);
 context.imageSmoothingEnabled=false;context.drawImage(img,-Math.round(width/2),-height,width,height);context.restore();
}
function trailCenter(y){const t=H-y;const u=Math.max(0,Math.min(1,(t-400)/190));return W/2+12*Math.sin(t/68)+7*Math.sin(t/37)+110*u*u*(3-2*u)+310*Math.pow(Math.max(0,Math.min(1,(t-590)/250)),1.2);}
function dirtEdge(x,y){const t=H-y,dx=x-W/2-78,dy=y-H+421;
 const a=Math.atan2(dy/67,dx/80),r=Math.hypot(dx/80,dy/67);
 const camp=(1+.12*Math.sin(a*3+.8)+.09*Math.cos(a*5)+.045*Math.sin(a*11))-r;
 const road=(19+4*Math.sin(t/24)+2*Math.cos(t/9)-Math.abs(x-trailCenter(y)))/19;
 const branch=(13+3*Math.sin(x/11)-Math.abs(y-(H-421+5*Math.sin((x-W/2)/19))))/13;
 const vx=x-W/2-420,vy=y-(H-850);const village=1-Math.hypot(vx/235,vy/190)+.08*Math.sin(x/13)*Math.cos(y/17);return Math.max(t<870?road:-2,village,x>W/2-12&&x<W/2+78?branch:-2,camp);}
function campClear(x,y){return dirtEdge(x,y)>-.35;}
function prepareFloor(zone,random){
 const c=floor.getContext('2d'),bg=c.createLinearGradient(0,34,W,H);
 bg.addColorStop(0,zone[3]);bg.addColorStop(.48,zone[2]);bg.addColorStop(1,zone[3]);
 c.fillStyle=bg;c.fillRect(0,0,W,H);
 for(let y=Math.max(0,H-1080);y<H;y+=2){for(let x=Math.max(0,Math.floor(W/2-45));x<Math.min(W,W/2+690);x+=2){const e=dirtEdge(x,y);const noise=(Math.sin(x*12.9898+y*78.233)*43758.5453)%1; if(e+noise*.14>0){c.fillStyle=e<.18?'#594734':e<.4?'#654a35':noise>.55?'#79583e':'#70513a';c.fillRect(x,y,2,2);}}}
 for(let i=0;i<81600;i++){
  const x=Math.floor(random()*W),y=Math.floor(random()*H);
  const road=campClear(x,y);
  c.fillStyle=road?(i%2?'#e9ae7920':'#04040920'):(i%2?zone[4]+'2d':'#08070b48');
  c.fillRect(x,y,1+Math.floor(random()*5),1+(i%5===0?1:0));
 }
 for(let i=0;i<2880;i++){
  const x=12+random()*(W-24),y=40+random()*(H-52);
  if(dirtEdge(x,y)>.22|| (campClear(x,y)&&random()<.8))continue;
  c.globalAlpha=.41+random()*.51;sprite(c,choose(zone[6],random),x,y,3+Math.floor(random()*7),random()<.5);
 }
 c.globalAlpha=1;
 for(let x=6;x<W+8;x+=15){sprite(c,'wall_'+zone[1],x,44,16);sprite(c,'wall_'+zone[1],x,H+7,16)}
 for(let y=63;y<H;y+=16){sprite(c,'wall_'+zone[1],6,y,11);sprite(c,'wall_'+zone[1],W-6,y,11)}
 for(let i=0;i<704;i++){
  const x=20+random()*(W-40),y=52+random()*(H-69);
  if(campClear(x,y)|| (Math.abs(x-W/2-420)<245&&Math.abs(y-(H-850))<200))continue;
  const edge=x<55||x>W-55||y>H-42;
  if(!edge&&((x>100&&x<320)||random()>.55))continue;
  if(!edge&&Math.abs(y-113)<17)continue;
  const key=choose(zone[5],random),w=14+Math.floor(random()*24);
  const ob={x,y,k:key,w,r:w*.18};
  if(objects.some(o=>distance(ob,o)<14))continue;
  objects.push(ob);
 }
}
function villageFence(g,o){g.save();g.translate(Math.round(o.x),Math.round(o.y));g.fillStyle='#33291e';if(o.vertical){g.fillRect(-3,-17,6,19);g.fillStyle='#806348';g.fillRect(-2,-16,4,17);g.fillStyle='#a17a50';g.fillRect(-2,-16,1,17);}else{g.fillRect(-8,-9,16,3);g.fillRect(-8,-4,16,3);g.fillStyle='#826344';g.fillRect(-8,-10,16,2);g.fillRect(-8,-5,16,2);}g.fillStyle='#4b3929';g.fillRect(-2,-13,4,15);g.fillStyle='#96744d';g.fillRect(-2,-13,1,14);g.restore();}
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
 g.imageSmoothingEnabled=false;g.setTransform(1,0,0,1,0,0);g.fillStyle=biome[3];g.fillRect(0,0,420,282);const cx=player?player.x-210:W/2-210,cy=player?player.y-141:H*.70-141;g.translate(-Math.round(cx),-Math.round(cy));g.drawImage(floor,0,0);for(const o of objects){if(o.k==='bedroll_a'||o.k==='bedroll_b')bedrollCanvas(g,o.x,o.y+13,o.k==='bedroll_b');} for(const o of objects){if(o.k!=='fire0')continue;const r=115*(1+.025*Math.sin(globalTime*8)),x=o.x,y=o.y;g.save();g.globalCompositeOperation='screen';const ground=g.createRadialGradient(x,y,0,x,y,r);ground.addColorStop(0,'rgba(255,205,130,.26)');ground.addColorStop(.4,'rgba(255,185,100,.18)');ground.addColorStop(.75,'rgba(230,150,75,.07)');ground.addColorStop(1,'rgba(230,150,75,0)');g.fillStyle=ground;g.fillRect(x-r,y-r,r*2,r*2);g.restore();}
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

 const layers=objects.filter(o=>o.k!=='house_collision'&&!o.k.startsWith('bedroll_')&&Math.abs(o.x-cx-210)<260&&Math.abs(o.y-cy-141)<190).map(o=>({y:o.y,run:()=>{if(o.house!==undefined){const im=villageHouses[o.house];g.drawImage(im,Math.round(o.x-o.w/2),Math.round(o.y-o.w*118/132),o.w,Math.round(o.w*118/132));return;}if(o.k==='village_fence'){villageFence(g,o);return;}if(o.k==='fire0')light(o.x,o.y-10,65,'#ff9a405c');sprite(g,'shadow_m',o.x,o.y+2,o.w*.66);sprite(g,o.k==='fire0'&&globalTime%1<.5?'fire1':o.k,o.x,o.y,o.w);if(o.npc)littleText(o.npc,o.x,o.y-30)}}));
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

 }});
 layers.sort((a,b)=>a.y-b.y).forEach(layer=>layer.run());
 for(const s of shots){
  const w=s.team==='you'?(s.id==='p_pellet'?5:8):8;
  if(s.team==='you')light(s.x,s.y,9,'#ffcc7259');
  sprite(g,s.id,s.x,s.y+w/2,w);
 }
 for(const p of fx){g.globalAlpha=clamp(p.life/p.max,0,1);g.fillStyle=p.color;g.fillRect(Math.round(p.x),Math.round(p.y),p.max>.4?2:1,2)}
 g.globalAlpha=1;
 // Night shading is applied to the scene, with a genuine opening in the ambient shadow at each fire.
 const shade=nightShade;
 const n=shade.getContext('2d');
 n.setTransform(1,0,0,1,0,0);n.clearRect(0,0,420,282);
 n.globalCompositeOperation='source-over';n.fillStyle='#10182cb5';n.fillRect(0,0,420,282);
 for(const o of objects){if(o.k!=='fire0')continue;
  const f=Math.sin(globalTime*8.3)*.035+Math.sin(globalTime*13.7)*.02;
  const x=o.x-Math.round(cx),y=o.y-Math.round(cy),r=135*(1+f);
  n.globalCompositeOperation='destination-out';
  const hole=n.createRadialGradient(x,y,0,x,y,r);
  hole.addColorStop(0,'rgba(0,0,0,1)');hole.addColorStop(.43,'rgba(0,0,0,1)');hole.addColorStop(.75,'rgba(0,0,0,.65)');hole.addColorStop(1,'rgba(0,0,0,0)');
  n.fillStyle=hole;n.fillRect(x-r,y-r,r*2,r*2);
 }
 n.globalCompositeOperation='source-over';
 g.drawImage(shade,Math.round(cx),Math.round(cy));
 for(const o of objects){if(o.k!=='fire0')continue;
  const f=Math.sin(globalTime*8.3)*.04+Math.sin(globalTime*13.7)*.02;
  g.save();g.globalCompositeOperation='screen';
  const r=125*(1+f),x=o.x,y=o.y;
  const glow=g.createRadialGradient(x,y,0,x,y,r);
  glow.addColorStop(0,'rgba(255,174,75,'+(.38+f)+')');
  glow.addColorStop(.35,'rgba(255,150,55,'+(.22+f)+')');
  glow.addColorStop(.7,'rgba(235,135,55,.08)');glow.addColorStop(1,'rgba(215,100,30,0)');
  g.fillStyle=glow;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
  sprite(g,globalTime%1<.5?'fire0':'fire1',o.x,o.y,o.w);
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

window.brasaRenderVersion=28;
