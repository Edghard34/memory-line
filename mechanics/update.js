let villageGuide=null;
function guideWalk(o,x,y,dt,speed=55){const dx=x-o.x,dy=y-o.y,d=Math.hypot(dx,dy);if(d<2){o.walk=0;return true;}const step=Math.min(d,speed*dt);o.x+=dx/d*step;o.y+=dy/d*step;o.dx=dx/d;o.dy=dy/d;if(Math.abs(dx)>1)o.facing=Math.sign(dx);o.walk=(o.walk||0)+dt*9;return false;}
function beginMorningGuide(){const npc=objects.find(o=>o.npc==='Tião')||objects.find(o=>o.npc);if(!npc){resumePlay();return;}mode='guide';villageGuide={npc,phase:'approach'};}
function guideChoices(npc){npcDialogue(npc,'Tem uma vila mais acima, seguindo a trilha. Estou indo pra lá agora. Quer vir comigo?',()=>{},'');const box=document.querySelector('.npc-choices');box.replaceChildren(menuButton('Claro, vamos juntos.',()=>guideReply(true)),menuButton('Obrigado. Mostre o caminho.',()=>guideReply(true)),menuButton('Não preciso de ajuda.',()=>guideReply(false)));}
function guideReply(follow){const a=villageGuide;npcDialogue(a.npc,follow?'Então vamos. É só seguir a trilha.':'Tudo bem. A gente se vê por lá.',()=>{resumePlay();a.phase='travel';a.follow=follow;a.y=H-450;a.join=true;run.campStage=3;keep();if(follow){mode='guide';$('touch').hidden=true;$('hud').hidden=true;$('talk').hidden=true;}},'Continuar');}
function tickVillageGuide(dt){const a=villageGuide;if(!a)return;const n=a.npc;if(a.phase==='approach'){if(guideWalk(n,player.x-20,player.y,dt)){a.phase='talk';guideChoices(n);}return;}if(a.phase!=='travel')return;if(a.join){if(guideWalk(n,trailCenter(a.y),a.y,dt))a.join=false;}else{a.y=Math.max(H-690,a.y-48*dt);guideWalk(n,trailCenter(a.y),a.y,dt,65);}if(a.follow){const tx=n.x,ty=n.y+25;if(Math.hypot(player.x-tx,player.y-ty)>4)guideWalk(player,tx,ty,dt,80);else player.walk=0;}if(!a.join&&a.y<=H-690&&Math.hypot(n.x-trailCenter(a.y),n.y-a.y)<4){n.walk=0;if(a.follow&&Math.hypot(player.x-n.x,player.y-n.y-25)>5)return;run.campStage=4;run.hp=player.hp;keep();villageGuide=null;player.walk=0;if(a.follow)resumePlay();}}
let campSleep=null;
function beginCampSleep(){resumePlay();clearInput();mode='sleep';$('touch').hidden=true;$('hud').hidden=true;$('talk').hidden=true;const mat=objects.find(o=>o.k==='bedroll_b');campSleep={phase:'walk',t:0,x:mat.x,y:mat.y+5};}
function tickCampSleep(dt){const a=campSleep;if(!a)return;const fade=$('sleep-fade');a.t+=dt;if(a.phase==='walk'){const dx=a.x-player.x,dy=a.y-player.y,d=Math.hypot(dx,dy);if(d<2){player.walk=0;a.phase='out';a.t=0;}else{const step=Math.min(d,55*dt);player.x+=dx/d*step;player.y+=dy/d*step;player.dx=dx/d;player.dy=dy/d;if(Math.abs(dx)>1)player.facing=Math.sign(dx);player.walk+=dt*9;}}else if(a.phase==='out'){fade.style.opacity=Math.min(1,a.t/2.5);if(a.t>=2.5){a.phase='black';a.t=0;run.day=true;run.campStage=2;run.hp=player.hp;keep();}}else if(a.phase==='black'){if(a.t>=1.2){a.phase='in';a.t=0;}}else{fade.style.opacity=Math.max(0,1-a.t/3);if(a.t>=3){campSleep=null;beginMorningGuide();}}}
function clearFight(){
 fight=false;cleared=true;hazards=[];shots=[];
 run.rooms++;heal(stat('clear'));run.coins+=stat('gold');
 rewardAsh((run.room===4?6:run.kind==='elite'?3:1)+stat('ash'));
 for(const drop of drops)collect(drop);drops=[];
 if(run.room<4)heal(8);
 setRoomDoors();doorLock=.85;
 chime();blessing();label(run.room===4?biome[8]+' caiu':'A noite recua',1.5);
}
function collect(d){if(d.k==='ember')heal(d.value+stat('ember'));else if(d.k==='gota')rewardAsh(d.value);else run.coins+=d.value}
function tick(dt){
 run.time+=dt;roomTime+=dt;stageClock+=dt;sinceHit+=dt;doorLock-=dt;
 player.punch=Math.max(0,(player.punch||0)-dt);player.inv-=dt;player.dashCD-=dt;player.skillCD-=dt;player.fireCD-=dt;player.dash-=dt;
 const k=input.keys;
 let x=clamp(input.cx+(k.has('d')||k.has('arrowright')?1:0)-(k.has('a')||k.has('arrowleft')?1:0),-1,1);
 let y=clamp(input.cy+(k.has('s')||k.has('arrowdown')?1:0)-(k.has('w')||k.has('arrowup')?1:0),-1,1);
 const d=Math.max(1,Math.hypot(x,y));x/=d;y/=d;
 if(Math.hypot(x,y)>.10&&player.dash<=0){player.dx=x;player.dy=y;if(Math.abs(x)>.10)player.facing=Math.sign(x)}
 if(input.dash&&player.dashCD<=0)useDash();
 if(input.skill&&fight&&player.skillCD<=0)skill();
 input.dash=input.skill=false;
 if(player.dash>0){const a=Math.atan2(player.dy,player.dx);steer(player,Math.cos(a)*278*dt,Math.sin(a)*278*dt);if(rng()<.65)dust(player.x,player.y,'#dc8853',2,29)}
 else {const v=hero[3]*(1+stat('speed'));steer(player,x*v*dt,y*v*dt)}
 const npc=objects.find(o=>o.npc&&distance(o,player)<28);const talk=$('talk');if(talk){talk.hidden=!npc;talk.onclick=()=>{if(!npc)return;const lines={Luzia:'A mata mudou desde que a última luz se apagou. Fique na trilha até conhecer o terreno.',Zambi:'Ouvi um assobio vindo do norte. Não parecia coisa de gente. Se quiser investigar, siga com cuidado.',Tião:'Pode descansar perto do fogo. Mais adiante vi rastros estranhos entre as árvores.'};const stage=run.campStage||0;const camp=objects.filter(o=>o.npc);if(!run.day&&stage===0){npcDialogue(npc,'Ainda bem que encontrou nosso acampamento. A mata não é segura a esta hora. Converse com '+camp.find(o=>o!==npc).npc+'.',()=>{run.campStage=1;run.firstCampNpc=npc.npc;keep();resumePlay();});}else if(!run.day&&stage===1&&npc.npc!==run.firstCampNpc){npcDialogue(npc,'Não é seguro andar pela mata à noite. Melhor dormir por aqui mesmo. Pode usar meu pano, aquele mais abaixo. Ao amanhecer, você segue viagem.',beginCampSleep,'Vou descansar');}else{npcDialogue(npc,run.day?'Bom dia! Agora já pode seguir viagem.':lines[npc.npc]);}talk.hidden=true;};}
 player.walk=Math.hypot(x,y)>.1||player.dash>0?player.walk+dt*9:0;
 if(fight){
  const drain=(sinceHit>7?2.2:sinceHit>3?1.36:.75)*(1-clamp(stat('drain'),-.65,.73));
  // Exploration: flame is depleted only by damage.
  while(spawnQueue.length&&spawnQueue[0].at<=roomTime){
   const item=spawnQueue.shift(),side=Math.floor(rng()*3),px=side===0?28:side===1?W-28:70+rng()*(W-140),py=side===2?72:76+rng()*110;
   spawn(item.id,px,py,false,item.elite);dust(px,py,'#ba82a6',13,57);
  }
  if(player.fireCD<=0&&enemies.length&&(input.mouse||input.fire||k.has(' ')||profile.assist))attack();
  for(const e of enemies.slice())if(e.hp>0&&distance(e,player)<170)drive(e,dt);
  for(const h of hazards){
   if(h.delay>0)h.delay-=dt;else{h.life-=dt;if(distance(h,player)<h.r)harm(h.damage)}
  }
  hazards=hazards.filter(h=>h.life>0);
  for(const s of shots){
   s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
   if(s.x<8||s.x>W-8||s.y<33||s.y>H-13){s.life=0;continue}
   if(s.team==='foe'){if(Math.hypot(s.x-player.x,s.y-(player.y-5))<10){harm(s.damage);s.life=0}continue}
   for(const e of enemies){
    if(e.hp<=0||s.seen.has(e)||Math.hypot(s.x-e.x,s.y-(e.y-6))>=e.r+4)continue;
    const crit=rng()<.05+stat('crit');hurt(e,s.damage*(crit?1.65+stat('critPower'):1),crit);e.slow=stat('slow')?1.4:e.slow;
    s.seen.add(e);if(s.pierce--<=0){s.life=0;break}
   }
  }
  shots=shots.filter(s=>s.life>0);enemies=enemies.filter(e=>e.hp>0);
  for(const drop of drops){
   const length=distance(drop,player);
   if(length<10){collect(drop);drop.done=true;continue}
   const range=43+stat('magnet');
   if(length<range){const a=between(drop,player),v=(100+2*(range-length))*dt;drop.x+=Math.cos(a)*v;drop.y+=Math.sin(a)*v}
  }
  drops=drops.filter(d=>!d.done);
  if(player.hp<=0){finish(false);return}
  // No wave completion in exploration mode.
 }else if(doorLock<=0){
  const door=doors.find(o=>distance(o,player)<16);
  if(door)nextRoom(door);
 }
}

