/* Goblox Graphics Presets — shared by the platform's main games */
(() => {
  "use strict";
  const KEY = "goblox_graphics_quality";
  const presets = {
    "super-low": {label:"Super Low", filter:"none", texture:0, shadow:"none"},
    "low": {label:"Low", filter:"saturate(.82) contrast(.96)", texture:0, shadow:"none"},
    "medium": {label:"Médio", filter:"saturate(1.04) contrast(1.04) brightness(1.015)", texture:.055, shadow:"0 5px 18px #0005"},
    "realista": {label:"Realista", filter:"saturate(1.16) contrast(1.10) brightness(1.025)", texture:.12, shadow:"0 8px 26px #0008"}
  };
  const valid = Object.keys(presets);
  let quality = localStorage.getItem(KEY) || "medium";
  if (!valid.includes(quality)) quality = "medium";
  const style = document.createElement("style");
  style.textContent = `
    #goblox-gfx-control{position:fixed;right:14px;top:14px;z-index:99999;font:600 13px Arial,sans-serif;color:#fff}
    #goblox-gfx-toggle{border:1px solid #9b75ff;background:#171126;color:#fff;border-radius:10px;padding:10px 12px;cursor:pointer;box-shadow:0 4px 16px #0006}
    #goblox-gfx-panel{display:none;margin-top:7px;padding:12px;background:#151020;border:1px solid #8b5cf6;border-radius:12px;min-width:180px;box-shadow:0 12px 30px #0009}
    #goblox-gfx-panel.open{display:block}
    #goblox-gfx-panel label{display:block;margin-bottom:7px;color:#ddd}
    #goblox-gfx-select{width:100%;padding:9px;border-radius:8px;background:#090711;color:#fff;border:1px solid #7652b8}
    #goblox-gfx-note{display:block;margin-top:8px;color:#b9a5e9;font-size:11px;line-height:1.4}
    .goblox-gfx-wrap{position:relative!important;isolation:isolate}
    .goblox-gfx-texture{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;mix-blend-mode:soft-light;background-image:repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 4px),repeating-linear-gradient(90deg,#000 0px,#000 1px,transparent 1px,transparent 5px);border-radius:inherit}
    .goblox-gfx-wrap canvas{filter:none;transition:filter .2s}
    @media(max-width:600px){#goblox-gfx-control{top:8px;right:8px}#goblox-gfx-toggle{padding:8px 9px}}
  `;
  document.head.appendChild(style);
  const root = document.createElement("div");
  root.id = "goblox-gfx-control";
  root.innerHTML = '<button id="goblox-gfx-toggle" type="button" aria-expanded="false">Gráficos ⚙</button><div id="goblox-gfx-panel"><label for="goblox-gfx-select">Qualidade gráfica</label><select id="goblox-gfx-select"><option value="super-low">Super Low</option><option value="low">Low</option><option value="medium">Médio</option><option value="realista">Realista</option></select><span id="goblox-gfx-note">A qualidade escolhida fica salva para os próximos jogos.</span></div>';
  document.body.appendChild(root);
  const toggle = root.querySelector("#goblox-gfx-toggle");
  const panel = root.querySelector("#goblox-gfx-panel");
  const select = root.querySelector("#goblox-gfx-select");
  select.value = quality;
  const canvases = [...document.querySelectorAll("canvas")];
  const layers = [];
  canvases.forEach(canvas => {
    const parent = canvas.parentElement;
    if (!parent) return;
    parent.classList.add("goblox-gfx-wrap");
    const layer = document.createElement("div");
    layer.className = "goblox-gfx-texture";
    parent.appendChild(layer);
    layers.push({canvas, layer});
  });
  function apply(value) {
    quality = valid.includes(value) ? value : "medium";
    localStorage.setItem(KEY, quality);
    const preset = presets[quality];
    layers.forEach(({canvas,layer}) => {
      canvas.style.filter = preset.filter;
      layer.style.opacity = String(preset.texture);
      canvas.style.boxShadow = preset.shadow;
    });
    select.value = quality;
    root.dataset.quality = quality;
  }
  toggle.addEventListener("click", () => {
    const open = panel.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  select.addEventListener("change", () => apply(select.value));
  apply(quality);
})();