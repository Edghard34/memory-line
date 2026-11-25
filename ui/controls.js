let view={x:0,y:0,w:1,h:1};
function resize(){
 const box=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
 canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr));ctx.imageSmoothingEnabled=false;
}
function hud(){
 if(!player||!run)return;
 const value=Math.ceil(Math.max(0,player.hp)),max=maxFlame(),ready=player.skillCD<=0,dash=player.dashCD<=0;
 $('flame').style.width=100*value/max+'%';
 $('flame').parentElement.setAttribute('aria-valuemax',max);
 $('flame').parentElement.setAttribute('aria-valuenow',value);
 $('stats').textContent='Chama '+value+'/'+max+' · '+run.coins+' moedas';
 $('place').innerHTML=biome[0]+'<br>Sala '+(run.room+1)+'/5 · '+(ready?hero[6]+' pronto':Math.ceil(player.skillCD)+'s para o dom');
 $('dash').innerHTML=imgTag('i_dash')+(dash?'Esquiva':player.dashCD.toFixed(1)+'s');$('skill').innerHTML=imgTag('i_skill1')+(ready?'Dom':Math.ceil(player.skillCD)+'s');
}
function clearInput(){input.keys.clear();input.cx=input.cy=0;input.fire=input.mouse=input.dash=input.skill=false;$('nub').style.transform='';pointer=null;firePointer=null}
let pointer=null,firePointer=null;
const pad=$('pad');
function trackPad(e){
 const {left,top,width,height}=pad.getBoundingClientRect(),x=e.clientX-left-width/2,y=e.clientY-top-height/2,r=Math.max(30,Math.hypot(x,y));
 input.cx=x/r;input.cy=y/r;$('nub').style.transform='translate('+input.cx*28+'px,'+input.cy*28+'px)';
}
pad.onpointerdown=e=>{if(mode!=='play'||pointer!==null)return;pointer=e.pointerId;pad.setPointerCapture(pointer);trackPad(e)};
pad.onpointermove=e=>{if(e.pointerId===pointer)trackPad(e)};
pad.onpointerup=pad.onpointercancel=pad.onlostpointercapture=e=>{if(e.pointerId!==pointer)return;pointer=null;input.cx=input.cy=0;$('nub').style.transform=''};
$('fire').onpointerdown=e=>{if(mode!=='play')return;firePointer=e.pointerId;$('fire').setPointerCapture(e.pointerId);input.fire=true};
$('fire').onpointerup=$('fire').onpointercancel=$('fire').onlostpointercapture=e=>{if(e.pointerId===firePointer){input.fire=false;firePointer=null}};
for(const key of ['skill','dash']){
 $(key).onpointerdown=e=>{e.preventDefault();if(mode==='play')input[key]=true};
 $(key).onclick=e=>{if(e.detail===0&&mode==='play')input[key]=true};
}
$('fire').innerHTML=imgTag('i_flame')+'Atacar';
function aim(e){const b=canvas.getBoundingClientRect();input.aim={x:((e.clientX-b.left)*canvas.width/b.width-view.x)*W/view.w,y:((e.clientY-b.top)*canvas.height/b.height-view.y)*H/view.h}}
canvas.onpointerdown=e=>{if(mode==='play'&&e.pointerType==='mouse'){canvas.setPointerCapture(e.pointerId);input.mouse=true;aim(e)}};
canvas.onpointermove=e=>{if(e.pointerType==='mouse')aim(e)};
canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=()=>input.mouse=false;
addEventListener('keydown',e=>{
 const key=e.key.toLowerCase();
 if(key==='escape'){if(mode==='pause')resumePlay();else pause();return}
 if(mode!=='play')return;
 if(['w','a','s','d',' ','arrowup','arrowdown','arrowleft','arrowright','q','shift'].includes(key))e.preventDefault();
 input.keys.add(key);if(e.repeat)return;
 if(key==='shift')input.dash=true;if(key==='q')input.skill=true;
});
addEventListener('keyup',e=>input.keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{clearInput();pause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause()}});
$('pause').onclick=pause;
addEventListener('resize',resize);
