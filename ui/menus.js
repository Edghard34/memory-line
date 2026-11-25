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
