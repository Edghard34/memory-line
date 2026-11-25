function drive(e,dt){
 e.age+=dt;e.timer-=dt;e.hit-=dt;e.slow-=dt;
 const a=between(e,player),d=distance(e,player),rate=e.speed*(e.slow>0?1-clamp(stat('slow')||.33,.15,.55):1);
 let heading=a,speed=rate;
 if(e.warn>0){
  e.warn-=dt;
  if(e.warn<=0)e.charge=e.chargeLength;
  return;
 }
 if(e.charge>0){
  e.charge-=dt;steer(e,e.vx*dt,e.vy*dt,e.type==='phase');
  if(e.id==='b_mula'&&(e.trail??0)<e.age){e.trail=e.age+.15;scorch(e.x,e.y,13,8,.14,.85)}
 }else{
  switch(e.type){
   case 'weave':heading+=Math.sin(e.age*8)*.95;break;
   case 'shot':case 'orbit':
    if(e.type==='orbit')heading+=d<110?1.47:.65;
    else if(d<89)heading+=Math.PI;else if(d<125)speed=0;
    if(e.timer<=0){spread(e,a,1,0,103,e.type==='orbit'?'p_leaf':'p_orb');e.timer=2.15}
    break;
   case 'charge':case 'pounce':
    if(e.timer<=0&&d<180){windup(e,a,e.type==='pounce'?.29:.53,e.type==='pounce'?196:151,.44);e.timer=e.type==='pounce'?2:2.45}
    break;
   case 'nest':
    if(e.timer<=0){if(enemies.filter(o=>o.hp>0&&o.id==='cupinho').length<5)spawn('cupinho',clamp(e.x+Math.cos(a)*16,17,W-17),clamp(e.y+Math.sin(a)*16,47,H-28));e.timer=3.3}break;
   case 'burst':
    if(e.timer<=0){ring(e,7,73,'p_ember',e.age);e.timer=2.65}break;
   case 'slam':
    if(e.timer<=0&&d<100){scorch(e.x,e.y,46,e.damage,.66,.35);e.timer=2.85}break;
   case 'phase':
    if(e.timer<=0){const side=rng()*TAU;e.x=clamp(player.x+Math.cos(side)*65,18,W-18);e.y=clamp(player.y+Math.sin(side)*65,55,H-30);scorch(e.x,e.y,18,e.damage,.55,.25);e.timer=3.4}break;
   case 'boss':{
    const rage=e.hp/e.max<.49;
    if(e.timer<=0){
     e.phase++;const pattern=e.phase%3;
     if(run.zone===0){
      if(pattern===1)spread(e,a,rage?7:5,.25,117,'p_leaf');
      if(pattern===2){for(let i=0;i<(rage?5:3);i++)scorch(clamp(player.x+(i-1)*27,22,W-22),clamp(player.y+(i%2)*33,54,H-26),21,14,.71+i*.12,.70)}
      if(pattern===0){ring(e,rage?14:10,87,'p_leaf',e.age);windup(e,a,.47,158,.53)}
     }else if(run.zone===1){
      if(pattern===1||pattern===0){windup(e,a,rage?.39:.58,221,.67);if(rage)spread(e,a,5,.27,112,'p_ember')}
      else{ring(e,rage?15:11,91,'p_ember',e.age);for(let i=0;i<4;i++)scorch(e.x+Math.cos(i*TAU/4)*36,e.y+Math.sin(i*TAU/4)*36,18,14,.62,1.7)}
     }else{
      if(pattern===1){ring(e,rage?18:12,86,'p_spit',e.age);spread(e,a,3,.29,134,'p_orb')}
      if(pattern===2){for(let i=0;i<(rage?7:4);i++){const t=i*2.4;scorch(clamp(player.x+Math.cos(t)*i*15,25,W-25),clamp(player.y+Math.sin(t)*i*15,56,H-31),23,16,.64+i*.09,1.15)}}
      if(pattern===0){if(enemies.filter(o=>o.hp>0).length<6){spawn('visagem',e.x-30,e.y+12);spawn('fogo',e.x+30,e.y+12)}ring(e,9,99,'p_orb',e.age)}
     }
     e.timer=rage?1.54:2.24;
    }
    if(run.zone===2&&d<86)heading+=1.6;
    break;
   }
  }
  if(e.warn<=0)steer(e,Math.cos(heading)*speed*dt,Math.sin(heading)*speed*dt,e.type==='phase');
 }
 for(const other of enemies){if(other===e||other.hp<=0)continue;const gap=distance(e,other),radius=(e.r+other.r)*.72;if(gap>0&&gap<radius){const t=between(other,e);steer(e,Math.cos(t)*dt*34,Math.sin(t)*dt*34,e.type==='phase')}}
 if(distance(e,player)<e.r+5)harm(e.damage);
}
