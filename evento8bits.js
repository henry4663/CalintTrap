(() => {
  "use strict";
  const START = new Date("2026-11-26T00:00:00-03:00").getTime();
  const END = new Date("2026-12-26T00:00:00-03:00").getTime();
  const COINS_KEY = "goblox_8bits_pixel_coins_v1";
  const DAILY_KEY = "goblox_8bits_daily_v1";
  const missions = [
    {id:"visit",title:"Explorador Pixel",description:"Entre na página do evento e confira os desafios.",reward:10},
    {id:"games",title:"Caçador de jogos",description:"Escolha um jogo no catálogo do Goblox hoje.",reward:15},
    {id:"return",title:"Presença retrô",description:"Volte ao evento e complete sua terceira missão.",reward:20}
  ];
  const $ = id => document.getElementById(id);
  const dayKey = () => new Date().toLocaleDateString("en-CA");
  const readDaily = () => { try { const value=JSON.parse(localStorage.getItem(DAILY_KEY)||"{}"); return value.day===dayKey()?value:{day:dayKey(),done:[]}; } catch { return {day:dayKey(),done:[]}; } };
  const coins = () => Math.max(0,Number(localStorage.getItem(COINS_KEY)||0)||0);
  let daily = readDaily();
  function render(){
    $("pixel-coins").textContent=coins().toLocaleString("pt-BR");
    $("missions-count").textContent=daily.done.length+"/3";
    $("missions-list").replaceChildren();
    missions.forEach(m=>{
      const done=daily.done.includes(m.id), card=document.createElement("article");
      card.className="mission-card";
      const title=document.createElement("h3");title.textContent=m.title;
      const desc=document.createElement("p");desc.textContent=m.description;
      const reward=document.createElement("div");reward.className="mission-reward";reward.textContent="+"+m.reward+" PIXEL COINS";
      const btn=document.createElement("button");btn.type="button";btn.disabled=done;btn.textContent=done?"✓ CONCLUÍDA":"RESGATAR MISSÃO";
      btn.addEventListener("click",()=>complete(m));
      card.append(title,desc,reward,btn);$("missions-list").append(card);
    });
  }
  function complete(m){
    if(daily.done.includes(m.id))return;
    daily.done.push(m.id);localStorage.setItem(DAILY_KEY,JSON.stringify(daily));
    localStorage.setItem(COINS_KEY,String(coins()+m.reward));render();
  }
  function updateTimer(){
    const now=Date.now(),remaining=Math.max(0,END-now),active=now>=START&&now<END;
    const d=Math.floor(remaining/86400000),h=Math.floor(remaining%86400000/3600000),m=Math.floor(remaining%3600000/60000),s=Math.floor(remaining%60000/1000);
    const label=remaining===0?"EVENTO ENCERRADO":d+"d "+String(h).padStart(2,"0")+"h "+String(m).padStart(2,"0")+"m "+String(s).padStart(2,"0")+"s";
    $("event-countdown").textContent=label;$("event-status").textContent=active?"ATIVO":now<START?"EM BREVE":"ENCERRADO";
    const home=$("home-8bits-countdown");if(home)home.textContent=label;
    document.querySelectorAll("#event-8bits-home a").forEach(a=>{if(remaining===0){a.textContent="EVENTO ENCERRADO";a.setAttribute("aria-disabled","true");a.style.opacity=".55";a.style.pointerEvents="none";}});
  }
  if(Date.now()<START){$("event-countdown").textContent="EVENTO AINDA NÃO COMEÇOU";}
  render();updateTimer();setInterval(updateTimer,1000);
})();