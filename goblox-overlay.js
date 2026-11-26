(() => {
  if (window.__gobloxFpsOverlayLoaded) return;
  window.__gobloxFpsOverlayLoaded = true;

  const KEY = "goblox_fps_enabled";
  const POS = "goblox_fps_position";
  const THEME_KEY = "goblox_theme";
  const validThemes = ["light", "dark", "8bits"];

  let enabled = localStorage.getItem(KEY) !== "false";
  let box = null;
  let value = null;
  let frames = 0;
  let last = performance.now();

  function addSettingsStyles() {
    if (document.getElementById("goblox-settings-fix-styles")) return;
    const style = document.createElement("style");
    style.id = "goblox-settings-fix-styles";
    style.textContent = `
      #settings-open-btn { display:inline-flex!important; align-items:center!important; justify-content:center!important; gap:7px!important; min-width:44px!important; min-height:42px!important; border:2px solid #7655ff!important; border-radius:11px!important; background:#211638!important; color:#fff!important; font-weight:800!important; cursor:pointer!important; z-index:10001!important; transition:transform .16s,background .16s!important; }
      #settings-open-btn:hover { background:#352254!important; transform:translateY(-1px); }
      #settings-open-btn:focus-visible,#settings-close-btn:focus-visible,.theme-choice:focus-visible { outline:3px solid #a78bfa!important; outline-offset:3px!important; }
      #settings-modal { z-index:10000!important; }
      #settings-modal > div { max-height:min(88dvh,560px); overflow-y:auto; border:1px solid #e5e7eb; }
      .theme-choice { min-height:48px; border:2px solid #d1d5db!important; background:#f9fafb; color:#252033; cursor:pointer; transition:all .15s ease; }
      .theme-choice:hover { border-color:#8b5cf6!important; transform:translateY(-1px); }
      .theme-choice[aria-pressed="true"] { border-color:#7c3aed!important; background:#ede9fe!important; color:#4c1d95!important; box-shadow:inset 0 0 0 1px #7c3aed; }
      body[data-goblox-theme="dark"] #settings-modal > div { background:#151827!important; color:#f3f4f6!important; border-color:#34384e!important; }
      body[data-goblox-theme="dark"] #settings-modal p,body[data-goblox-theme="dark"] #settings-modal strong,body[data-goblox-theme="dark"] #settings-title { color:#f3f4f6!important; }
      body[data-goblox-theme="dark"] #settings-modal label { border-color:#34384e!important; }
      body[data-goblox-theme="dark"] #settings-modal small,body[data-goblox-theme="dark"] #settings-modal .text-gray-500 { color:#aeb5ca!important; }
      body[data-goblox-theme="dark"] #settings-close-btn { color:#fff!important; }
      body[data-goblox-theme="dark"] .theme-choice { background:#202438!important; color:#e8e9f3!important; border-color:#454b66!important; }
      body[data-goblox-theme="dark"] .theme-choice[aria-pressed="true"] { background:#39265f!important; color:#fff!important; border-color:#a78bfa!important; }
      body[data-goblox-theme="8bits"] #settings-modal > div { background:#1b1032!important; color:#fff!important; border:2px solid #8b5cf6!important; border-radius:8px!important; font-family:monospace!important; }
      body[data-goblox-theme="8bits"] #settings-title,body[data-goblox-theme="8bits"] #settings-modal p,body[data-goblox-theme="8bits"] #settings-modal strong { color:#fff!important; }
      body[data-goblox-theme="8bits"] #settings-modal small,body[data-goblox-theme="8bits"] #settings-modal .text-gray-500 { color:#d6c5ff!important; }
      body[data-goblox-theme="8bits"] #settings-modal label { border-color:#7046b8!important; }
      body[data-goblox-theme="8bits"] .theme-choice { background:#24143e!important; color:#f5edff!important; border-color:#7046b8!important; border-radius:4px!important; }
      body[data-goblox-theme="8bits"] .theme-choice[aria-pressed="true"] { background:#6d28d9!important; color:#fff!important; border-color:#c4b5fd!important; }

      body[data-goblox-theme="dark"] header a,body[data-goblox-theme="dark"] #sidebar a,body[data-goblox-theme="dark"] #sidebar button,body[data-goblox-theme="dark"] footer a { color:#d9dced!important; }
      body[data-goblox-theme="dark"] #sidebar a:hover,body[data-goblox-theme="dark"] #sidebar button:hover,body[data-goblox-theme="dark"] #mobile-bottom-nav a:hover { background:#24283b!important; }
      body[data-goblox-theme="dark"] main h1,body[data-goblox-theme="dark"] main h2,body[data-goblox-theme="dark"] main h3 { color:#f3f4f6!important; }
      body[data-goblox-theme="dark"] #friends-panel input { background:#202438!important; color:#fff!important; border-color:#454b66!important; }
      body[data-goblox-theme="dark"] #friends-panel button { background:#5b43bd!important; color:#fff!important; }
      body[data-goblox-theme="dark"] #friends-panel button:hover { background:#7655ff!important; }
      body[data-goblox-theme="8bits"] header a,body[data-goblox-theme="8bits"] #sidebar a,body[data-goblox-theme="8bits"] #sidebar button,body[data-goblox-theme="8bits"] footer a { color:#e9ddff!important; }
      body[data-goblox-theme="8bits"] #sidebar a:hover,body[data-goblox-theme="8bits"] #sidebar button:hover { background:#2b174b!important; }
      body[data-goblox-theme="8bits"] main h1,body[data-goblox-theme="8bits"] main h2,body[data-goblox-theme="8bits"] main h3 { color:#fff!important; }
      body[data-goblox-theme="8bits"] #friends-panel input { background:#24143e!important; color:#fff!important; border-color:#8b5cf6!important; border-radius:4px!important; }
      body[data-goblox-theme="8bits"] #friends-panel button { background:#6d28d9!important; color:#fff!important; border:1px solid #c4b5fd!important; border-radius:4px!important; }
      body[data-goblox-theme="8bits"] #friends-panel button:hover { background:#7c3aed!important; }
      #goblox-fps-counter { box-sizing:border-box; }
      @media(max-width:767px) {
        #settings-modal { align-items:flex-end!important; padding:10px!important; }
        #settings-modal > div { width:100%!important; max-width:520px!important; border-radius:18px 18px 12px 12px!important; padding:20px!important; }
        #settings-open-btn { min-width:40px!important; min-height:40px!important; padding:7px 9px!important; }
      }
    `;
    document.head.appendChild(style);
  }

  function make() {
    if (box || !document.body) return;
    box = document.createElement("div");
    box.id = "goblox-fps-counter";
    box.setAttribute("role", "status");
    box.setAttribute("aria-label", "Contador de quadros por segundo. Arraste para mover.");
    box.innerHTML = '<span class="goblox-fps-label">FPS</span><strong id="goblox-fps-value">--</strong>';
    Object.assign(box.style, {
      position: "fixed", left: "14px", top: "90px", zIndex: "2147483647",
      padding: "8px 11px", border: "1px solid #9b78ff", borderRadius: "9px",
      background: "rgba(12,9,24,.94)", color: "#fff", font: "bold 13px Arial,sans-serif",
      boxShadow: "0 4px 18px #0006", display: enabled ? "flex" : "none",
      alignItems: "center", gap: "9px", cursor: "grab", userSelect: "none",
      touchAction: "none", minWidth: "76px"
    });
    const label = box.querySelector(".goblox-fps-label");
    label.style.color = "#c4b5fd";
    label.style.fontSize = "10px";
    label.style.letterSpacing = "1px";
    value = box.querySelector("#goblox-fps-value");
    value.style.fontSize = "16px";
    document.body.appendChild(box);

    try {
      const p = JSON.parse(localStorage.getItem(POS) || "null");
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
        box.style.left = Math.max(0, Math.min(innerWidth - box.offsetWidth, p.x)) + "px";
        box.style.top = Math.max(0, Math.min(innerHeight - box.offsetHeight, p.y)) + "px";
      }
    } catch {}

    let drag = null;
    box.addEventListener("pointerdown", e => {
      if (e.button !== undefined && e.button !== 0) return;
      drag = { x: e.clientX - box.offsetLeft, y: e.clientY - box.offsetTop };
      if (box.setPointerCapture) box.setPointerCapture(e.pointerId);
      box.style.cursor = "grabbing";
      e.preventDefault();
    });
    box.addEventListener("pointermove", e => {
      if (!drag) return;
      const x = Math.max(0, Math.min(innerWidth - box.offsetWidth, e.clientX - drag.x));
      const y = Math.max(0, Math.min(innerHeight - box.offsetHeight, e.clientY - drag.y));
      box.style.left = x + "px";
      box.style.top = y + "px";
    });
    const stop = () => {
      if (!drag) return;
      drag = null;
      box.style.cursor = "grab";
      try { localStorage.setItem(POS, JSON.stringify({ x: box.offsetLeft, y: box.offsetTop })); } catch {}
    };
    box.addEventListener("pointerup", stop);
    box.addEventListener("pointercancel", stop);
    window.addEventListener("resize", () => {
      if (!box) return;
      box.style.left = Math.max(0, Math.min(innerWidth - box.offsetWidth, box.offsetLeft)) + "px";
      box.style.top = Math.max(0, Math.min(innerHeight - box.offsetHeight, box.offsetTop)) + "px";
    });
  }

  function syncControls() {
    const toggle = document.getElementById("fps-toggle");
    if (toggle) toggle.checked = enabled;
    const theme = localStorage.getItem(THEME_KEY);
    if (validThemes.includes(theme)) document.body.dataset.gobloxTheme = theme;
    document.querySelectorAll("[data-theme-choice]").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === (validThemes.includes(theme) ? theme : "light")));
    });
  }

  function loop(now) {
    frames++;
    if (now - last >= 500) {
      const fps = Math.round(frames * 1000 / (now - last));
      frames = 0;
      last = now;
      if (value) value.textContent = String(fps);
    }
    requestAnimationFrame(loop);
  }

  addSettingsStyles();
  make();
  syncControls();
  requestAnimationFrame(loop);

  window.GobloxFPS = {
    setEnabled(state) {
      enabled = Boolean(state);
      try { localStorage.setItem(KEY, String(enabled)); } catch {}
      if (box) box.style.display = enabled ? "flex" : "none";
      const toggle = document.getElementById("fps-toggle");
      if (toggle) toggle.checked = enabled;
    },
    isEnabled() { return enabled; }
  };

  document.addEventListener("DOMContentLoaded", syncControls, { once: true });
  window.addEventListener("storage", event => {
    if (event.key === KEY) window.GobloxFPS.setEnabled(event.newValue !== "false");
    if (event.key === THEME_KEY) syncControls();
  });
})();