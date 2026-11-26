import { getCurrentNick } from "./authLocal.js";

(() => {
  "use strict";
  const START = new Date("2026-11-26T00:00:00-03:00").getTime();
  const END = new Date("2026-12-26T00:00:00-03:00").getTime();
  const nick = String(getCurrentNick() || "visitante").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "_");
  const KEY = "goblox_8bits_v2_" + nick;
  const missions = [
    {id:"visit",title:"Explorador Pixel",description:"Confira a página do evento e seus desafios.",reward:10},
    {id:"games",title:"Caçador de jogos",description:"Escolha um jogo no catálogo do Goblox.",reward:15},
    {id:"return",title:"Presença retrô",description:"Complete mais um desafio diário.",reward:20}
  ];
  const items = [
    {id:"badge_pixel",name:"Emblema Pixel",icon:"🏅",description:"Um emblema retrô para sua coleção.",price:35},
    {id:"pet_ghost",name:"Mascote Fantasma",icon:"👾",description:"Um pequeno companheiro 8-bit.",price:75},
    {id:"title_arcade",name:"Título Fliperama",icon:"🕹️",description:"Título especial de jogador clássico.",price:110},
    {id:"aura_glitch",name:"Aura Glitch",icon:"💠",description:"Efeito visual inspirado em pixels.",price:160},
    {id:"crown_8bit",name:"Coroa 8 Bits",icon:"👑",description:"Uma coroa para quem ama o retrô.",price:220},
    {id:"trophy_gold",name:"Troféu Dourado",icon:"🏆",description:"O prêmio de maior valor da loja.",price:300}
  ];
  const $=id=>document.getElementById(id);
  const dayKey=()=>new Date().toLocaleDateString("en-CA");
  function load(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||"{}");
      return {coins:Math.max(0,Number(v.coins)||0),daily:v.daily?.day===dayKey()?v.daily:{day:dayKey(),done:[]},inventory:Array.isArray(v.inventory)?v.inventory:[]};
    }catch{return {coins:0,daily:{day:dayKey(),done:[]},inventory:[]};}
  }
  let state=load();
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  function renderMissions(){
    $("missions-list").replaceChildren();
    missions.forEach(m=>{
      const done=state.daily.done.includes(m.id),card=document.createElement("article");card.className="mission-card";
      const title=document.createElement("h3");title.textContent=m.title;
      const desc=document.createElement("p");desc.textContent=m.description;
      const reward=document.createElement("div");reward.className="mission-reward";reward.textContent="+"+m.reward+" PIXEL COINS";
      const btn=document.createElement("button");btn.type="button";btn.disabled=done||Date.now()<START||Date.now()>=END;btn.textContent=done?"✓ CONCLUÍDA":"RESGATAR MISSÃO";
      btn.addEventListener("click",()=>{if(btn.disabled)return;state.daily.done.push(m.id);state.coins+=m.reward;save();render();});
      card.append(title,desc,reward,btn);$("missions-list").append(card);
    });
  }
  function renderShop(){
    $("shop-grid").replaceChildren();
    items.forEach(item=>{
      const owned=state.inventory.includes(item.id),card=document.createElement("article");card.className="shop-item";
      const icon=document.createElement("div");icon.className="item-icon";icon.textContent=item.icon;
      const title=document.createElement("h3");title.textContent=item.name;
      const desc=document.createElement("p");desc.textContent=item.description;
      const price=document.createElement("div");price.className="price";price.textContent=item.price+" PIXEL COINS";
      const button=document.createElement("button");button.type="button";button.disabled=owned||state.coins<item.price||Date.now()<START||Date.now()>=END;button.textContent=owned?"✓ ADQUIRIDO":state.coins<item.price?"MOEDAS INSUFICIENTES":"COMPRAR";
      button.addEventListener("click",()=>{if(button.disabled||state.inventory.includes(item.id)||state.coins<item.price)return;state.coins-=item.price;state.inventory.push(item.id);save();render();});
      card.append(icon,title,desc,price,button);$("shop-grid").append(card);
    });
  }
  function renderInventory(){
    const root=$("inventory-list");root.replaceChildren();
    const owned=items.filter(i=>state.inventory.includes(i.id));
    if(!owned.length){const empty=document.createElement("p");empty.textContent="Ainda não há itens. Visite a Loja Pixel!";root.append(empty);return;}
    owned.forEach(item=>{const card=document.createElement("div");card.className="inventory-item";const icon=document.createElement("span");icon.textContent=item.icon;const name=document.createElement("strong");name.textContent=item.name;card.append(icon,name);root.append(card);});
  }
  function render(){
    $("pixel-coins").textContent=state.coins.toLocaleString("pt-BR");
    $("missions-count").textContent=state.daily.done.length+"/3";
    renderMissions();renderShop();renderInventory();
  }
  function updateTimer(){
    const now=Date.now(),remaining=Math.max(0,END-now),active=now>=START&&now<END;
    const d=Math.floor(remaining/86400000),h=Math.floor(remaining%86400000/3600000),m=Math.floor(remaining%3600000/60000),s=Math.floor(remaining%60000/1000);
    $("event-countdown").textContent=remaining===0?"EVENTO ENCERRADO":now<START?"EVENTO EM BREVE":d+"d "+String(h).padStart(2,"0")+"h "+String(m).padStart(2,"0")+"m "+String(s).padStart(2,"0")+"s";
    $("event-status").textContent=active?"ATIVO":now<START?"EM BREVE":"ENCERRADO";
    document.querySelectorAll(".mission-card button,.shop-item button").forEach(btn=>{if(!active)btn.disabled=true;});
  }
  render();updateTimer();setInterval(updateTimer,1000);
})();
