import { getCurrentNick } from "./authLocal.js";
export const EVENT_START = new Date("2026-11-26T00:00:00-03:00").getTime();
export const EVENT_END = new Date("2026-12-26T00:00:00-03:00").getTime();
export const MISSIONS = [
 {id:"visit",title:"Explorador Pixel",description:"Visite a página oficial do evento.",action:"visit",reward:10},
 {id:"catalog",title:"Vitrine retrô",description:"Abra o catálogo do Goblox pelo evento.",action:"catalog",reward:15},
 {id:"game",title:"Hora de jogar",description:"Inicie um jogo pelo lobby do Goblox.",action:"game",reward:25}
];
export const ITEMS = [
 {id:"badge_pixel",name:"Emblema Pixel",icon:"🏅",description:"Um emblema retrô para sua coleção.",price:35},
 {id:"pet_ghost",name:"Mascote Fantasma",icon:"👾",description:"Um pequeno companheiro 8-bit.",price:75},
 {id:"title_arcade",name:"Título Fliperama",icon:"🕹️",description:"Título especial de jogador clássico.",price:110},
 {id:"aura_glitch",name:"Aura Glitch",icon:"💠",description:"Efeito visual inspirado em pixels.",price:160},
 {id:"crown_8bit",name:"Coroa 8 Bits",icon:"👑",description:"Uma coroa para quem ama o retrô.",price:220},
 {id:"trophy_gold",name:"Troféu Dourado",icon:"🏆",description:"O prêmio de maior valor da loja.",price:300}
];
const dayKey=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
const nick=()=>String(getCurrentNick()||"").trim().toLowerCase().replace(/[^a-z0-9_-]/g,"_");
const key=()=>"goblox_8bits_v3_"+(nick()||"guest");
const blankDaily=()=>({day:dayKey(),actions:{visit:false,catalog:false,game:false},claimed:[]});
function normalize(v={}){
 const d=v.daily?.day===dayKey()?v.daily:blankDaily();
 return {coins:Math.max(0,Math.floor(Number(v.coins)||0)),inventory:Array.isArray(v.inventory)?[...new Set(v.inventory.filter(id=>ITEMS.some(i=>i.id===id)))]:[],equipped:ITEMS.some(i=>i.id===v.equipped)?v.equipped:null,daily:{day:dayKey(),actions:{visit:!!d.actions?.visit,catalog:!!d.actions?.catalog,game:!!d.actions?.game},claimed:Array.isArray(d.claimed)?[...new Set(d.claimed.filter(id=>MISSIONS.some(m=>m.id===id)))]:[]}};
}
function load(){
 try{
  const saved=localStorage.getItem(key());
  if(saved)return normalize(JSON.parse(saved));
  const old=JSON.parse(localStorage.getItem("goblox_8bits_v2_"+(nick()||"visitante"))||"{}");
  return normalize({coins:Number(old.coins)||Number(localStorage.getItem("goblox_8bits_pixel_coins_v1"))||0,inventory:old.inventory||[]});
 }catch{return normalize();}
}
let state=load();
function save(){localStorage.setItem(key(),JSON.stringify(state));window.dispatchEvent(new CustomEvent("goblox8bits:update"));}
export const getEventNick=()=>getCurrentNick();
export const getState=()=>JSON.parse(JSON.stringify(state));
export const getEventStatus=(now=Date.now())=>now<EVENT_START?"soon":now>=EVENT_END?"ended":"active";
export const getTimeRemaining=(now=Date.now())=>Math.max(0,EVENT_END-now);
export function markAction(action){
 if(getEventStatus()!=="active"||!["visit","catalog","game"].includes(action))return false;
 if(!state.daily.actions[action]){state.daily.actions[action]=true;save();}
 return true;
}
export function claimMission(id){
 if(getEventStatus()!=="active")return {ok:false,reason:"O evento não está ativo."};
 const m=MISSIONS.find(x=>x.id===id);
 if(!m)return {ok:false,reason:"Missão inválida."};
 if(!state.daily.actions[m.action])return {ok:false,reason:"Complete a ação da missão primeiro."};
 if(state.daily.claimed.includes(id))return {ok:false,reason:"Recompensa já resgatada hoje."};
 state.daily.claimed.push(id);state.coins+=m.reward;save();return {ok:true,reward:m.reward};
}
export function buyItem(id){
 if(getEventStatus()!=="active")return {ok:false,reason:"A loja está fechada."};
 const item=ITEMS.find(x=>x.id===id);
 if(!item)return {ok:false,reason:"Item inválido."};
 if(state.inventory.includes(id))return {ok:false,reason:"Você já possui este item."};
 if(state.coins<item.price)return {ok:false,reason:"Pixel Coins insuficientes."};
 state.coins-=item.price;state.inventory.push(id);save();return {ok:true,item};
}
export function equipItem(id){
 if(!state.inventory.includes(id))return {ok:false,reason:"Item não encontrado na coleção."};
 state.equipped=state.equipped===id?null:id;save();return {ok:true,equipped:state.equipped};
}
if(getCurrentNick())markAction("visit");
