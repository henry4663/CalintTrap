/* Goblox Graphics Presets — shared by the platform's main games.
   The selector lives in lobby.html > Configurações. */
(() => {
  "use strict";
  const KEY = "goblox_graphics_quality";
  const presets = {
    "super-low": {filter:"none", texture:0, shadow:"none"},
    "low": {filter:"saturate(.82) contrast(.96)", texture:0, shadow:"none"},
    "medium": {filter:"saturate(1.04) contrast(1.04) brightness(1.015)", texture:.055, shadow:"0 5px 18px #0005"},
    "realista": {filter:"saturate(1.16) contrast(1.10) brightness(1.025)", texture:.12, shadow:"0 8px 26px #0008"}
  };
  const valid = Object.keys(presets);
  let quality = localStorage.getItem(KEY) || "medium";
  if (!valid.includes(quality)) quality = "medium";
  const style = document.createElement("style");
  style.textContent = `
    .goblox-gfx-wrap{position:relative!important;display:block;isolation:isolate;max-width:100%}
    .goblox-gfx-texture{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;mix-blend-mode:soft-light;background-image:repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 4px),repeating-linear-gradient(90deg,#000 0px,#000 1px,transparent 1px,transparent 5px);border-radius:inherit}
    .goblox-gfx-wrap canvas{filter:none;transition:filter .2s}
  `;
  document.head.appendChild(style);
  const layers = [];
  document.querySelectorAll("canvas").forEach(canvas => {
    const parent = canvas.parentElement;
    if (!parent || canvas.dataset.gobloxGfxWrapped === "true") return;
    const wrap = document.createElement("div");
    wrap.className = "goblox-gfx-wrap";
    const computed = getComputedStyle(canvas);
    wrap.style.width = computed.width;
    wrap.style.maxWidth = computed.maxWidth;
    wrap.style.height = computed.height === "auto" ? "auto" : computed.height;
    parent.insertBefore(wrap, canvas);
    wrap.appendChild(canvas);
    canvas.dataset.gobloxGfxWrapped = "true";
    canvas.style.width = "100%";
    canvas.style.maxWidth = "100%";
    const layer = document.createElement("div");
    layer.className = "goblox-gfx-texture";
    wrap.appendChild(layer);
    layers.push({canvas, layer});
  });
  function apply(value) {
    quality = valid.includes(value) ? value : "medium";
    localStorage.setItem(KEY, quality);
    const preset = presets[quality];
    layers.forEach(({canvas, layer}) => {
      canvas.style.filter = preset.filter;
      layer.style.opacity = String(preset.texture);
      canvas.style.boxShadow = preset.shadow;
    });
    document.dispatchEvent(new CustomEvent("goblox:graphics-quality-changed", {detail:{quality}}));
  }
  window.GobloxGraphics = {
    getQuality: () => quality,
    setQuality: apply,
    getPresets: () => valid.slice()
  };
  apply(quality);
})();