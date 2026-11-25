function spawn(id,x,y,boss=false,elite=false){
 const data=boss?[biome[8],[440,590,730][run.zone],[46,63,37][run.zone],[13,16,17][run.zone],'boss']:FOES[id];
 const [name,base,speed,damage,type]=data,hp=base*(elite?1.6:1)*(boss?1:1+run.zone*.14);
 enemies.push({id,name,hp,max:hp,speed,damage,type,x,y,r:boss?15:elite?11:id==='mapinguari'?13:8,boss,elite,timer:.7+rng()*.7,age:0,charge:0,warn:0,slow:0,hit:0,phase:0,vx:0,vy:0});
}
function dust(x,y,color,n=7,speed=48){
 for(let i=0;i<n;i++){const a=Math.random()*TAU,v=Math.random()*speed;const life=.18+Math.random()*.42;fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-10,life,max:life,color})}
}
function shoot(x,y,a,team,{damage=8,speed=110,id='p_spit',life=3,pierce=0}={}){
 shots.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,a,team,damage,id,life,pierce,seen:new Set()});
}
function spread(e,angle,n,gap,speed,id){for(let i=0;i<n;i++)shoot(e.x,e.y-5,angle+(i-(n-1)/2)*gap,'foe',{damage:e.damage,speed,id})}
function ring(e,n,speed,id,phase=0){spread(e,phase,n,TAU/n,speed,id)}
function steer(entity,x,y,pass=false){
 entity.x=clamp(entity.x+x,16,W-16);entity.y=clamp(entity.y+y,45,H-23);
 if(pass)return;
 for(const ob of objects){
  const min=ob.r?ob.r+entity.r:0,d=distance(entity,ob);
  if(min&&d<min){const a=d?between(ob,entity):0;entity.x=ob.x+Math.cos(a)*min;entity.y=ob.y+Math.sin(a)*min}
 }
 entity.x=clamp(entity.x,16,W-16);entity.y=clamp(entity.y,45,H-23);
}
function attack(){
 if(run.id!==2){player.fireCD=hero[4];player.punch=.22;const target=enemies.filter(e=>e.hp>0&&distance(player,e)<25).sort((a,b)=>distance(player,a)-distance(player,b))[0];if(target){player.facing=target.x>=player.x?1:-1;hurt(target,hero[5]+stat('damage'));}return;}if(shots.some(s=>s.team==='you'))return;
 player.count++;
 const target=enemies.reduce((a,b)=>b.hp>0&&(!a||distance(player,b)<distance(player,a))?b:a,null);
 let a=Math.atan2(player.dy,player.dx);
 if(input.mouse&&input.aim)a=Math.atan2(input.aim.y-player.y,input.aim.x-player.x);
 else if(target)a=between(player,target);
 player.facing=Math.cos(a)>=0?1:-1;
 const id=['p_bolt','p_ember','p_pellet'][run.id],n=1;
 const damage= Math.max(1,hero[5]+stat('damage')/(run.id===2?2:1));
 const data={id,damage,speed:(run.id===1?169:235)*(1+stat('bullet')),life:run.id===2?.47:1.65,pierce:stat('pierce')};
 for(let i=0;i<n;i++){const angle=a+(i-(n-1)/2)*.14;shoot(player.x+Math.cos(angle)*4,player.y-6,angle,'you',data)}
 
 player.fireCD=hero[4]/Math.max(.3,1+stat('rate'));
 dust(player.x+Math.cos(a)*9,player.y-5,'#ffb35b',4,22);
 tone(run.id===2?100:235,run.id===2?44:142,.10,.023,run.id===2?'sawtooth':'triangle');
}
function useDash(){
 player.dash=.16+stat('dashTime');player.dashCD=1.4*(1-stat('dash'));
 if(stat('dashBlast'))for(const e of enemies)if(distance(player,e)<50)hurt(e,stat('dashBlast'));
 tone(230,70,.18,.04);
}
function skill(){if(run.id!==2)return;if(player.fireCD<=0)attack();}
function harm(n){
 if(player.inv>0||player.dash>0||!fight)return;
 if(player.guard||rng()<stat('evade')){player.guard=false;player.inv=.3;label('Protegido',.55);return}
 heal(-n*(1-clamp(stat('armor'),0,.65)));player.inv=.62;shake=.23;
 dust(player.x,player.y-7,'#ff7857',13,65);tone(120,46,.2,.09,'sawtooth');
}
function hurt(e,n,critical=false){
 if(e.hp<=0)return;
 e.hp-=n*(e.boss||e.elite?1+stat('boss'):1);e.hit=.12;sinceHit=0;
 if(critical&&stat('knock')&&!e.boss){const a=between(player,e);steer(e,Math.cos(a)*stat('knock')*.25,Math.sin(a)*stat('knock')*.25)}
 dust(e.x,e.y-8,critical?'#fff1ab':'#ee9e67',critical?10:4,44);
 if(e.hp>0)return;
 run.kills++;shake=Math.max(shake,e.boss?.44:.09);
 const flame=e.boss?24:e.elite?13:7;
 drops.push({x:e.x,y:e.y,k:'ember',value:flame},{x:e.x+9,y:e.y+5,k:'coin0',value:(e.boss?13:e.elite?6:2)+stat('coins')});
 if(e.boss||e.elite||rng()<.14)drops.push({x:e.x-10,y:e.y+3,k:'gota',value:e.boss?5:e.elite?3:1});
 heal(stat('kill'));if(stat('blast'))for(const other of enemies)if(distance(other,e)<36)hurt(other,stat('blast'));
 dust(e.x,e.y-10,e.boss?'#fff1a4':'#c08ab7',e.boss?60:14,100);tone(215,72,.18,.045);
}
function windup(e,a,seconds,speed,time){e.warn=seconds;e.chargeLength=time;e.vx=Math.cos(a)*speed;e.vy=Math.sin(a)*speed}
function scorch(x,y,r,damage,delay,duration=1.1){hazards.push({x,y,r,damage,delay,life:duration,seed:Math.floor(rng()*99999)})}
