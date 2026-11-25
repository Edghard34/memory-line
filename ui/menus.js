function persist(){save('perfil',profile)}
function keep(){checkpoint=JSON.parse(JSON.stringify(run));save('travessia',checkpoint)}
function forget(){checkpoint=null;save('travessia',null)}
function label(title,seconds=2){$('announce').textContent=title;notice=seconds}
function imgTag(key){return '<img alt="" src="'+ART[key]+'">'}
function menuButton(text,action){const b=document.createElement('button');b.textContent=text;b.onclick=()=>{tone(280,370,.10);action()};return b}
function panel(next,title,copy='',home=false){
 mode=next;clearInput();
 $('touch').hidden=true;$('panel').hidden=false;
 const el=document.createElement('section');el.className='sheet';
 el.innerHTML=(home?'<div class="eyebrow">Uma travessia pelo folclore brasileiro</div><h1>BRASA</h1>':'<h2>'+title+'</h2>')+(copy?'<p class="subtitle">'+copy+'</p>':'');
 $('panel').replaceChildren(el);$('panel').scrollTop=0;return el;
}
function buttons(el,entries){const box=document.createElement('div');box.className='menu';for(const [title,cb] of entries)box.append(menuButton(title,cb));el.append(box)}
function back(el,action=home,text='Voltar'){const b=menuButton(text,action);b.className='back';el.append(b)}
function cards(el,entries){
 const box=document.createElement('div');box.className='grid';
 for(const [name,copy,icon,act,disabled,klass] of entries){
  const b=menuButton('',act);b.className='card '+(klass||'');b.innerHTML=(icon?imgTag(icon):'')+'<strong>'+name+'</strong><small>'+copy+'</small>';b.disabled=!!disabled;box.append(b);
 }
 el.append(box);
}
function home(){
 $('hud').hidden=true;$('announce').textContent='';
 const el=panel('menu','','Onde a noite engole tudo, uma lanterna ainda respira.',true);
 buttons(el,[...(checkpoint?[['Retomar travessia',resumeRun]]:[]),['Nova travessia',selectHero],['Oficina · '+profile.ash+' cinzas',workshop],['Almanaque',codex],['Controles e opções',()=>settings(home)]]);
}
function selectHero(){
 const el=panel('hero','Quem leva o fogo?','Passe pela mata, pelo sertão e pelo brejo antes que a última chama se apague.');
 cards(el,HEROES.map(([name,key,hp,speed,rate,dmg,skill,desc],i)=>[name,hp+' de chama · '+skill+'<br>'+desc,key+'0',()=>{if(checkpoint)confirmNew(i);else start(i)},false,'hero']));back(el);
}
function confirmNew(i){const el=panel('confirm','Começar outra travessia?','A travessia salva será substituída. As cinzas conquistadas ficam na oficina.');buttons(el,[['Começar com '+HEROES[i][0],()=>start(i)],['Voltar',selectHero]])}
function workshop(){
 const el=panel('forge','Oficina','Você tem '+profile.ash+' cinzas. As melhorias valem para novas travessias.');
 cards(el,UPGRADES.map(([name,desc,key])=>{
  const level=profile.levels[key]||0,cost=5+level*6;
  return [name,desc+' por nível · '+level+'/3<br>'+(level===3?'Nível máximo':cost+' cinzas'),'i_flame',()=>{if(profile.ash<cost)return;profile.ash-=cost;profile.levels[key]=level+1;persist();chime();workshop()},level===3||profile.ash<cost];
 }));back(el);
}
function codex(){
 const el=panel('codex','Almanaque',''+profile.runs+' travessias iniciadas · '+profile.wins+' fogueiras acesas no brejo.');
 const list=document.createElement('div');list.className='codex';
 const sections=[
  ['Inimigos',Object.entries(FOES).map(([id,[name,hp,speed,dmg,type]])=>imgTag(id)+name+' · '+({hunt:'Persegue a chama',weave:'Voa em zigue-zague',shot:'Dispara à distância',charge:'Carrega em linha reta',nest:'Gera cupinhos',orbit:'Rodeia e atira',burst:'Dispara em anel',slam:'Golpeia o chão',phase:'Aparece perto da chama',pounce:'Salta sobre a presa'}[type]))],
  ['Chefes',BIOMES.map(b=>imgTag(b[7])+b[8])],
  ['Bênçãos',PATRONS.map(b=>imgTag(b.icon)+b.patron+' · <b>'+b.name+'</b> — '+b.desc)],
  ['Pactos',PACTS.map(p=>imgTag('i_pacto')+p[0]+' — '+p[1])]
 ];
 for(const [title,parts] of sections){const d=document.createElement('details');d.innerHTML='<summary>'+title+' ('+parts.length+')</summary>'+parts.map(x=>'<p>'+x+'</p>').join('');list.append(d)}el.append(list);back(el);
}
function settings(returnTo){
 const el=panel('settings','Controles e opções','No toque, use o analógico e segure Atacar. A lanterna mira no inimigo mais próximo. No teclado, mova com WASD ou setas, ataque com mouse ou espaço, esquive com Shift e use o dom com Q. Esc pausa.');
 buttons(el,[['Som · '+(profile.muted?'desligado':'ligado'),()=>{profile.muted=!profile.muted;persist();settings(returnTo)}],['Ataque automático · '+(profile.assist?'ligado':'desligado'),()=>{profile.assist=!profile.assist;persist();settings(returnTo)}],['Tremor · '+(profile.shake?'ligado':'desligado'),()=>{profile.shake=!profile.shake;persist();settings(returnTo)}]]);
 back(el,returnTo);
}
function resumePlay(){mode='play';clearInput();$('panel').hidden=true;$('hud').hidden=false;$('touch').hidden=false;hud()}
function pause(){
 if(mode!=='play')return;
 const el=panel('pause','Travessia em pausa','O jogo guarda a entrada da sala atual. Ao reabrir, você volta ao começo dessa sala.');
 buttons(el,[['Continuar',resumePlay],['Controles e opções',()=>settings(()=>{mode='play';pause()})],['Voltar ao título',home]]);
}

function npcDialogue(npc,copy,action=resumePlay,choice='Entendi'){const el=panel('dialogue',npc.npc);el.classList.add('npc-dialogue');el.replaceChildren();const row=document.createElement('div');row.className='npc-dialogue-row';const portrait=document.createElement('div');portrait.className='npc-portrait';const img=document.createElement('img');img.src=ART[npc.k];img.alt=npc.npc;portrait.append(img);const words=document.createElement('div');words.className='npc-words';const name=document.createElement('h2');name.textContent=npc.npc;const speech=document.createElement('p');speech.textContent=copy;words.append(name,speech);row.append(portrait,words);el.append(row);const choices=document.createElement('div');choices.className='npc-choices';choices.append(menuButton(choice,action));el.append(choices);}

const INVENTORY_ITEMS={water:{name:'Garrafa de água',icon:'i_bolsa',desc:'Água para a viagem.',type:'consumable'},bread:{name:'Pão',icon:'i_bolsa',desc:'Uma pequena porção de alimento.',type:'consumable'},cloth:{name:'Pano',icon:'i_bolsa',desc:'Um pedaço de tecido útil em viagens.',type:'material'}};
function ensureInventory(){if(!Array.isArray(run.inventory))run.inventory=[{id:'water',qty:1},{id:'bread',qty:2},{id:'cloth',qty:1}];if(!run.equipment)run.equipment={};}
function addInventory(id,qty=1){ensureInventory();if(!INVENTORY_ITEMS[id]||qty<=0)return false;const item=run.inventory.find(i=>i&&i.id===id);if(item)item.qty+=qty;else {const free=Array.from({length:24},(_,i)=>i).find(i=>!run.inventory[i]);if(free===undefined)return false;run.inventory[free]={id,qty};}keep();return true;}
function clearInventory(){ensureInventory();run.inventory=[];keep();}
function openInventory(selected=-1){if(!run||!['play','inventory'].includes(mode))return;ensureInventory();$('talk').hidden=true;const el=panel('inventory','Inventário');el.classList.add('inventory-sheet');const layout=document.createElement('div');layout.className='inv-layout';const left=document.createElement('div');const title=document.createElement('h3');title.textContent=hero[0];left.append(title);const equip=document.createElement('div');equip.className='inv-equip';for(const slot of ['Cabeça','Pescoço','Mão','Corpo','person','Escudo','Anel','Pernas','Pés']){if(slot==='person'){const im=document.createElement('img');im.src=ART[hero[1]+'0'];equip.append(im);}else{const b=document.createElement('button');b.className='inv-slot';b.textContent=slot;b.disabled=true;equip.append(b);}}left.append(equip);const right=document.createElement('div');const grid=document.createElement('div');grid.className='inv-grid';for(let i=0;i<24;i++){const item=run.inventory[i];const b=document.createElement('button');b.className='inv-slot'+(selected===i?' selected':'');if(item){const data=INVENTORY_ITEMS[item.id];const im=document.createElement('img');im.src=ART[data.icon];im.alt=data.name;const qty=document.createElement('small');qty.textContent=item.qty;b.append(im,qty);}b.dataset.slot=i;b.setAttribute('aria-label',item?INVENTORY_ITEMS[item.id].name:'Espaço vazio');grid.append(b);}bindInventoryDrag(grid);right.append(grid);const info=document.createElement('div');info.className='inv-info';const item=run.inventory[selected];info.textContent=item?INVENTORY_ITEMS[item.id].name+' · '+INVENTORY_ITEMS[item.id].desc:'Selecione um item para examinar.';right.append(info);layout.append(left,right);el.append(layout);const foot=document.createElement('div');foot.className='inv-footer';const count=document.createElement('span');count.textContent=run.inventory.filter(Boolean).length+'/24 espaços · '+run.coins+' moedas';foot.append(count,menuButton('Fechar',resumePlay));el.append(foot);}

function bindInventoryDrag(grid){let drag=null;const targetAt=(x,y)=>document.elementFromPoint(x,y)?.closest('.inv-grid [data-slot]');function clean(){if(!drag)return;drag.ghost?.remove();drag.source.classList.remove('drag-source');grid.querySelectorAll('.drag-target').forEach(b=>b.classList.remove('drag-target'));drag=null;}
grid.onpointerdown=e=>{const source=e.target.closest('[data-slot]');if(!source||drag||e.button!==0)return;const from=Number(source.dataset.slot);if(!run.inventory[from])return;e.preventDefault();source.setPointerCapture(e.pointerId);drag={source,from,id:e.pointerId,x:e.clientX,y:e.clientY,ghost:null};};
grid.onpointermove=e=>{if(!drag||e.pointerId!==drag.id)return;if(!drag.ghost&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>7){const ghost=drag.source.cloneNode(true);ghost.className='inv-slot inv-ghost';ghost.style.width=drag.source.offsetWidth+'px';ghost.style.height=drag.source.offsetHeight+'px';document.body.append(ghost);drag.ghost=ghost;drag.source.classList.add('drag-source');}if(!drag.ghost)return;drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';grid.querySelectorAll('.drag-target').forEach(b=>b.classList.remove('drag-target'));targetAt(e.clientX,e.clientY)?.classList.add('drag-target');};
grid.onpointerup=e=>{if(!drag||e.pointerId!==drag.id)return;const from=drag.from,wasDrag=!!drag.ghost,target=targetAt(e.clientX,e.clientY),to=target?Number(target.dataset.slot):-1;clean();if(!wasDrag){openInventory(from);return;}if(to<0||to===from)return;const a=run.inventory[from],b=run.inventory[to];if(b&&a.id===b.id){b.qty+=a.qty;run.inventory[from]=null;}else{run.inventory[to]=a;run.inventory[from]=b||null;}keep();openInventory(to);};grid.onpointercancel=clean;grid.onlostpointercapture=clean;}
