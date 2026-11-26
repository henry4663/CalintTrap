import { getEventNick, getState, getEventStatus, getTimeRemaining, MISSIONS, ITEMS, claimMission, buyItem, equipItem, markAction } from "./evento8bits-core.js";
const $=id=>document.getElementById(id);
const feedback=document.createElement("p");feedback.className="notice event-feedback";feedback.setAttribute("role","status");$("missions-list").after(feedback);
const say=text=>feedback.textContent=text;
function render(){
 const state=getState();
 $("pixel-coins").textContent=state.coins.toLocaleString("pt-BR");
 $("missions-count").textContent=state.daily.claimed.length+"/3";
 $("missions-list").replaceChildren();
 MISSIONS.forEach(m=>{
  const done=state.daily.claimed.includes(m.id),ready=state.daily.actions[m.action],card=document.createElement("article");card.className="mission-card";
  const title=document.createElement("h3");title.textContent=m.title;
  const desc=document.createElement("p");desc.textContent=m.description;
  const reward=document.createElement("div");reward.className="mission-reward";reward.textContent="+"+m.reward+" PIXEL COINS";
  const stateText=document.createElement("small");stateText.className="mission-state";stateText.textContent=done?"RECOMPENSA RESGATADA":ready?"AÇÃO CONCLUÍDA":"AÇÃO AINDA NÃO CONCLUÍDA";
  const btn=document.createElement("button");btn.type="button";btn.disabled=done||!ready||getEventStatus()!=="active";btn.textContent=done?"✓ RESGATADA":ready?"RESGATAR":"BLOQUEADA";
  btn.addEventListener("click",()=>{const result=claimMission(m.id);say(result.ok?"Você recebeu "+result.reward+" Pixel Coins!":result.reason);render();});
  card.append(title,desc,reward,stateText,btn);$("missions-list").append(card);
 });
 $("shop-grid").replaceChildren();
 ITEMS.forEach(item=>{
  const owned=state.inventory.includes(item.id),card=document.createElement("article");card.className="shop-item";
  const icon=document.createElement("div");icon.className="item-icon";icon.textContent=item.icon;
  const title=document.createElement("h3");title.textContent=item.name;
  const desc=document.createElement("p");desc.textContent=item.description;
  const price=document.createElement("div");price.className="price";price.textContent=item.price+" PIXEL COINS";
  const btn=document.createElement("button");btn.type="button";btn.disabled=owned||state.coins<item.price||getEventStatus()!=="active";btn.textContent=owned?"✓ ADQUIRIDO":state.coins<item.price?"MOEDAS INSUFICIENTES":"COMPRAR";
  btn.addEventListener("click",()=>{const result=buyItem(item.id);say(result.ok?item.name+" adicionado à coleção!":result.reason);render();});
  card.append(icon,title,desc,price,btn);$("shop-grid").append(card);
 });
 const inventory=$("inventory-list");inventory.replaceChildren();
 const ownedItems=ITEMS.filter(item=>state.inventory.includes(item.id));
 if(!ownedItems.length){const empty=document.createElement("p");empty.textContent="Sua coleção está vazia. Complete missões para ganhar Pixel Coins.";inventory.append(empty);}
 ownedItems.forEach(item=>{
  const card=document.createElement("article");card.className="inventory-item";
  const icon=document.createElement("span");icon.textContent=item.icon;
  const name=document.createElement("strong");name.textContent=item.name;
  const btn=document.createElement("button");btn.type="button";btn.textContent=state.equipped===item.id?"EQUIPADO • REMOVER":"EQUIPAR";
  btn.addEventListener("click",()=>{const result=equipItem(item.id);render();say(result.equipped?"Item equipado.":"Item removido.");});
  card.append(icon,name,btn);inventory.append(card);
 });
}
function timer(){
 const status=getEventStatus(),left=getTimeRemaining(),d=Math.floor(left/86400000),h=Math.floor(left%86400000/3600000),m=Math.floor(left%3600000/60000),s=Math.floor(left%60000/1000);
 $("event-countdown").textContent=status==="ended"?"EVENTO ENCERRADO":status==="soon"?"EVENTO EM BREVE":d+"d "+String(h).padStart(2,"0")+"h "+String(m).padStart(2,"0")+"m "+String(s).padStart(2,"0")+"s";
 $("event-status").textContent=status==="active"?"ATIVO":status==="soon"?"EM BREVE":"ENCERRADO";
 if(status!=="active")document.querySelectorAll(".mission-card button,.shop-item button").forEach(btn=>btn.disabled=true);
}
if(!getEventNick())window.location.replace("index.html");
else{
 $("event-catalog-link").addEventListener("click",()=>markAction("catalog"));
 render();timer();setInterval(timer,1000);
 window.addEventListener("goblox8bits:update",render);
}
