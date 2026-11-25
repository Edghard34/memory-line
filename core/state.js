'use strict';
const $=id=>document.getElementById(id);
const canvas=$('scene'), ctx=canvas.getContext('2d',{alpha:false}), W=1680,H=1128, TAU=Math.PI*2;
const world=document.createElement('canvas');world.width=504;world.height=338;
const g=world.getContext('2d');
const floor=document.createElement('canvas');floor.width=W;floor.height=H;
const images=Object.fromEntries(Object.entries(ART).map(([key,url])=>{const img=new Image();img.src=url;return [key,img]}));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const between=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
const choose=(array,r)=>array[Math.floor(r()*array.length)];
function seeded(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}}
function read(key,fallback){try{return JSON.parse(localStorage.getItem('brasa.'+key))??fallback}catch{return fallback}}
function save(key,data){try{localStorage.setItem('brasa.'+key,JSON.stringify(data))}catch{}}
const profile=read('perfil',{ash:0,levels:{},wins:0,runs:0,muted:false,assist:false,shake:true});
let checkpoint=read('travessia',null);
let run=null,mode='menu',hero,player,biome,rng,enemies=[],shots=[],drops=[],objects=[],hazards=[],fx=[];
let fight=false, cleared=false, roomTime=0, sinceHit=0, stageClock=0, updateHud=0, shake=0, notice=0;
let doors=[],spawnQueue=[], doorLock=0, flash=0, globalTime=0;
const input={keys:new Set(),cx:0,cy:0,fire:false,mouse:false,dash:false,skill:false,aim:null};
let audio;
