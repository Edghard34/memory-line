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
 player.inv-=dt;player.dashCD-=dt;player.skillCD-=dt;player.fireCD-=dt;player.dash-=dt;
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
 player.walk=Math.hypot(x,y)>.1||player.dash>0?player.walk+dt*9:0;
 if(fight){
  const drain=(sinceHit>7?2.2:sinceHit>3?1.36:.75)*(1-clamp(stat('drain'),-.65,.73));
  heal(-dt*drain);
  while(spawnQueue.length&&spawnQueue[0].at<=roomTime){
   const item=spawnQueue.shift(),side=Math.floor(rng()*3),px=side===0?28:side===1?W-28:70+rng()*(W-140),py=side===2?72:76+rng()*110;
   spawn(item.id,px,py,false,item.elite);dust(px,py,'#ba82a6',13,57);
  }
  if(player.fireCD<=0&&enemies.length&&(input.mouse||input.fire||k.has(' ')||profile.assist))attack();
  for(const e of enemies.slice())if(e.hp>0)drive(e,dt);
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
  if(!enemies.length&&!spawnQueue.length)clearFight();
 }else if(doorLock<=0){
  const door=doors.find(o=>distance(o,player)<16);
  if(door)nextRoom(door);
 }
}

