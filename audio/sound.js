function tone(hz,end,duration,vol=.035,kind='triangle'){
 if(profile.muted)return;
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state==='suspended')audio.resume().catch(()=>{});
  const t=audio.currentTime,o=audio.createOscillator(),gain=audio.createGain();o.type=kind;
  o.frequency.setValueAtTime(hz,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);
  gain.gain.setValueAtTime(vol,t);gain.gain.exponentialRampToValueAtTime(.001,t+duration);
  o.connect(gain).connect(audio.destination);o.start(t);o.stop(t+duration);
 }catch{}
}
const melodies=[[0,7,10,7,12,10,3,5],[0,5,7,10,7,5,3,0],[0,3,8,7,0,10,6,3]];
let beat=0, musicAt=0;
function score(dt){
 if(!audio||audio.state!=='running'||profile.muted||mode!=='play')return;
 musicAt-=dt;if(musicAt>0)return;
 const boss=run.room===4&&fight,root=[82.4,98,73.42][run.zone];
 const step=beat%8,note=root*2**(melodies[run.zone][step]/12);
 musicAt=boss?.26:.43;
 if(step%2===0)tone(note*.5,note*.495,boss?.43:.69,.026,'sine');
 if(fight&&step%4===0)tone(65,33,.21,boss?.11:.055,'sine');
 if(step!==3&&step!==7)tone(note*2,note*1.99,.27,.013);
 beat++;
}
const chime=()=>{tone(370,530,.22,.05);tone(555,740,.31,.025)};
