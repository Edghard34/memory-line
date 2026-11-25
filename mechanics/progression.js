function start(i){
 beat=0;musicAt=0;
 profile.runs++;persist();
 run={id:i,seed:(Date.now()^Math.floor(Math.random()*2**32))>>>0,zone:0,room:0,kind:'combat',coins:0,earned:0,stats:{},bless:[],pacts:[],kills:0,rooms:0,time:0};
 UPGRADES.forEach(([,,key,value])=>run.stats[key]=(profile.levels[key]||0)*value);
 run.coins=stat('startGold');run.hp=HEROES[i][2]+stat('max');enter();
}
function stat(k){return run.stats[k]||0}
function maxFlame(){return Math.max(40,hero[2]+stat('max'))}
function heal(n){player.hp=clamp(player.hp+n,0,maxFlame())}
function resumeRun(){run=JSON.parse(JSON.stringify(checkpoint));enter()}
function rewardAsh(n){
 if(n<=0)return;
 run.earned+=n;
}
function enter(){
 hero=HEROES[run.id];biome=BIOMES[0];
 rng=seeded(run.seed^Math.imul(run.zone*13+run.room+1,943177));
 player={x:W/2,y:H-57,hp:run.hp,r:7,facing:1,dx:1,dy:0,walk:0,inv:0,dash:0,dashCD:0,skillCD:0,fireCD:0,guard:!!stat('guard'),count:0};
 enemies=[];shots=[];drops=[];objects=[];hazards=[];fx=[];doors=[];spawnQueue=[];
 roomTime=0;stageClock=0;sinceHit=0;doorLock=.7;shake=0;flash=0;cleared=false;fight=run.kind==='combat'||run.kind==='elite'||run.room===4;
 prepareFloor(biome,rng);
 objects.push({x:W/2+78,y:H-421,k:'fire0',w:26,r:9});
 HEROES.filter((_,i)=>i!==run.id).forEach((a,i)=>objects.push({x:W/2+78+(i?25:-25),y:H-405,k:a[1]+'0',w:24,r:7,npc:a[0]}));
 fight=true;run.zone=0;run.room=0;run.kind='combat';
 const pool=POOLS[0];
 for(let i=0;i<24;i++){const x=60+rng()*(W-120),y=65+rng()*(H-130);if(y<H-550&&Math.hypot(x-player.x,y-player.y)>160&&!objects.some(o=>Math.hypot(o.x-x,o.y-y)<o.r+12))spawn(choose(pool,rng),x,y);}

 keep();resumePlay();
 label('Mata do Avesso · Exploração livre',2.1);
 if(!fight){mode='wait';setRoomDoors();service()}
}
function service(){
 const el=panel('service',({rest:'Fogueira',shop:'Feira à meia-noite',altar:'Altar dos patronos',pact:'Caldeirão da Cuca'})[run.kind]);
 if(run.kind==='rest'){
  cards(el,[['Alimentar a brasa','Recupere 36 de chama.','fire0',()=>{heal(36);leaveService()}],['Levar as cinzas','Ganhe 4 cinzas para a oficina quando a travessia terminar.','i_bolsa',()=>{rewardAsh(4);leaveService()}]]);
 }else if(run.kind==='altar'){blessing();return}
 else if(run.kind==='pact'){
  cards(el,PACTS.filter(p=>!run.pacts.includes(p[0])).map(([name,desc,k,n,k2,n2])=>[name,desc,'i_pacto',()=>{upgrade(k,n);upgrade(k2,n2);run.pacts.push(name);leaveService()}]));
 }else{
  const cost=n=>Math.ceil(n*(1-stat('discount')));
  const entries=[['Garrafa de fogo','Recupere 32 de chama.', 'ember',12,()=>heal(32)],['Óleo grosso','Dano de ataque +5 nesta travessia.','i_flame',17,()=>upgrade('damage',5)],['Pavio novo','Capacidade da lanterna +14.','i_heart',19,()=>upgrade('max',14)]];
  cards(el,entries.map(([name,desc,icon,n,apply])=>[name+' · '+cost(n),desc,icon,()=>{run.coins-=cost(n);apply();leaveService()},run.coins<cost(n)]));
  el.append('Moedas disponíveis · '+run.coins);
 }
 back(el,leaveService,'Seguir viagem');
}
function leaveService(){chime();resumePlay();label('Escolha uma porta',2)}
function upgrade(k,n){run.stats[k]=stat(k)+n;if(k==='max')heal(n)}
function blessing(){
 const el=panel('blessing','Escolha uma bênção','O favor do patrono acompanha você até o fim da travessia.');
 const pool=PATRONS.filter(b=>!run.bless.includes(b.name)), offer=[];
 while(pool.length&&offer.length<3)offer.push(pool.splice(Math.floor(rng()*pool.length),1)[0]);
 cards(el,offer.map(b=>[b.name,b.patron+' · '+b.desc,b.icon,()=>{upgrade(b.key,b.value);run.bless.push(b.name);chime();resumePlay();label(b.name)}]));
 if(!offer.length)back(el,resumePlay,'Continuar');
}
function setRoomDoors(){
 if(run.room>=3){doors=[{x:W/2,y:48,k:'combat',label:run.room===3?biome[8]:BIOMES[run.zone+1]?.[0]||'Amanhecer',icon:'i_boss'}];return}
 const kinds=[['combat','Trilha','i_flame'],['altar','Altar','i_altar'],['rest','Fogueira','i_rest'],['shop','Feira','i_shop'],['elite','Elite','i_elite'],['pact','Pacto','i_pacto']];
 const left=run.room===0?kinds[0]:choose([kinds[0],kinds[1],kinds[4]],rng), right=choose(kinds.filter(k=>k!==left&&k[0]!=='combat'),rng);
 doors=[left,right].map(([k,label,icon],i)=>({x:i===0?W*.29:W*.71,y:48,k,label,icon}));
}
function nextRoom(door){
 if(run.room===4){if(run.zone===2){finish(true);return}run.zone++;run.room=0;run.kind='combat';heal(26)}
 else{run.room++;run.kind=door.k}
 run.hp=player.hp;enter();
}
function finish(won){
 const bonus=won?18:0;
 profile.ash+=run.earned+bonus;if(won)profile.wins++;
 persist();forget();$('hud').hidden=true;$('announce').textContent='';
 const el=panel('end',won?'O dia voltou':'A lanterna se apagou',won?'Os galos cantaram no sertão. De volta à vila, '+hero[0]+' deixou a lanterna acesa para quem vier depois.':'As brasas que sobraram voltaram com você. A oficina pode dar mais fôlego à próxima travessia.');
 const p=document.createElement('p');p.className='notes';p.textContent=run.kills+' inimigos abatidos · '+run.rooms+' salas vencidas · '+(run.earned+bonus)+' cinzas · '+Math.floor(run.time/60)+':'+String(Math.floor(run.time%60)).padStart(2,'0');el.append(p);
 buttons(el,[['Voltar ao título',home],['Visitar a oficina',workshop]]);
 if(won){const c=document.createElement('p');c.className='notes';c.textContent='BRASA · Arte de personagens e cenário a partir das folhas originais do projeto.';el.append(c)}
}

