(() => {
  if (window.__gobloxFpsOverlayLoaded) return;
  window.__gobloxFpsOverlayLoaded = true;
  const KEY = "goblox_fps_enabled";
  const POS = "goblox_fps_position";
  let enabled = localStorage.getItem(KEY) !== "false";
  let box = null, value = null, frames = 0, last = performance.now(), fps = 0;
  function make() {
    if (box) return;
    box = document.createElement("div");
    box.id = "goblox-fps-counter";
    box.innerHTML = '<span class="goblox-fps-label">FPS</span><strong id="goblox-fps-value">0</strong>';
    Object.assign(box.style, {
      position:"fixed", left:"14px", top:"90px", zIndex:"2147483647",
      padding:"8px 11px", border:"1px solid #9b78ff", borderRadius:"9px",
      background:"rgba(12,9,24,.92)", color:"#fff", font:"bold 13px Arial,sans-serif",
      boxShadow:"0 4px 18px #0006", display:enabled?"flex":"none",
      alignItems:"center", gap:"9px", cursor:"grab", userSelect:"none",
      touchAction:"none", minWidth:"76px"
    });
    const label=box.querySelector(".goblox-fps-label");
    label.style.color="#bba7ff";
    label.style.fontSize="10px";
    label.style.letterSpacing="1px";
    value=box.querySelector("#goblox-fps-value");
    value.style.fontSize="16px";
    document.body.appendChild(box);
    try {
      const p=JSON.parse(localStorage.getItem(POS)||"null");
      if(p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        box.style.left=Math.max(0,Math.min(innerWidth-70,p.x))+"px";
        box.style.top=Math.max(0,Math.min(innerHeight-40,p.y))+"px";
      }
    } catch {}
    let drag=null;
    box.addEventListener("pointerdown",e=>{
      drag={x:e.clientX- box.offsetLeft,y:e.clientY-box.offsetTop};
      box.setPointerCapture(e.pointerId); box.style.cursor="grabbing"; e.preventDefault();
    });
    box.addEventListener("pointermove",e=>{
      if(!drag)return;
      const x=Math.max(0,Math.min(innerWidth-box.offsetWidth,e.clientX-drag.x));
      const y=Math.max(0,Math.min(innerHeight-box.offsetHeight,e.clientY-drag.y));
      box.style.left=x+"px"; box.style.top=y+"px";
    });
    const stop=()=>{if(!drag)return;drag=null;box.style.cursor="grab";localStorage.setItem(POS,JSON.stringify({x:box.offsetLeft,y:box.offsetTop}));};
    box.addEventListener("pointerup",stop); box.addEventListener("pointercancel",stop);
    window.addEventListener("resize",()=>{
      if(!box)return;
      box.style.left=Math.max(0,Math.min(innerWidth-box.offsetWidth,box.offsetLeft))+"px";
      box.style.top=Math.max(0,Math.min(innerHeight-box.offsetHeight,box.offsetTop))+"px";
    });
  }
  function loop(now) {
    frames++;
    if(now-last>=500) {
      fps=Math.round(frames*1000/(now-last)); frames=0; last=now;
      if(value) value.textContent=String(fps);
    }
    requestAnimationFrame(loop);
  }
  make();
  requestAnimationFrame(loop);
  window.GobloxFPS = {
    setEnabled(state) { enabled=!!state; localStorage.setItem(KEY,String(enabled)); if(box)box.style.display=enabled?"flex":"none"; },
    isEnabled() { return enabled; }
  };
})();