let previous=0;
const portrait=matchMedia('(orientation: portrait)');
function orientationChanged(){clearInput();resize();if(portrait.matches&&mode==='play')pause();}
portrait.addEventListener('change',orientationChanged);
function frame(now){
 const dt=Math.min(.033,(now-(previous||now))/1000);previous=now;if(portrait.matches){requestAnimationFrame(frame);return;}globalTime+=dt;
 if(notice>0){notice-=dt;if(notice<=0)$('announce').textContent=''}
 if(mode==='sleep')tickCampSleep(dt);
 if(mode==='guide'||mode==='play')tickVillageGuide(dt);
 if(mode==='play'){
  tick(dt);score(dt);shake=Math.max(0,shake-dt);flash=Math.max(0,flash-dt);
  updateHud+=dt;if(updateHud>.12&&mode==='play'){hud();updateHud=0}
 }
 for(const p of fx){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=dt*21}
 fx=fx.filter(p=>p.life>0);
 render();requestAnimationFrame(frame);
}
resize();home();
Promise.all(Object.values(images).map(img=>img.decode().catch(()=>{}))).then(()=>{
 if(!run){biome=BIOMES[0];prepareFloor(biome,seeded(25))}
 requestAnimationFrame(frame);
});


