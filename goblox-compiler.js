// Goblox Compiler v1 — converte projetos .gog em jogos HTML 3D jogáveis.
const esc = value => String(value ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
export function compileGobloxProject(project) {
  if (!project || project.format !== "GOBLOX_GAME" || !Array.isArray(project.objects)) {
    throw new Error("Projeto .gog inválido ou incompatível.");
  }
  const safe = JSON.stringify({
    name: String(project.name || "Meu jogo").slice(0, 60),
    objects: project.objects.map(o => ({
      name: String(o.name || "Objeto").slice(0, 60),
      type: ["Bloco","Cilindro","Esfera","Spawn"].includes(o.type) ? o.type : "Bloco",
      position: {x:Number(o.position?.x)||0,y:Number(o.position?.y)||0,z:Number(o.position?.z)||0},
      size: {x:Math.max(.1,Number(o.size?.x)||1),y:Math.max(.1,Number(o.size?.y)||1),z:Math.max(.1,Number(o.size?.z)||1)},
      color: /^#[0-9a-f]{6}$/i.test(o.color) ? o.color : "#8b5cf6"
    }))
  }).replace(/</g,"\\u003c");
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><title>${esc(project.name || "Jogo Goblox")}</title>
<style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#090014;color:white;font:14px Arial}canvas{display:block}#hud{position:fixed;top:12px;left:12px;padding:10px 14px;border:1px solid #ffffff30;border-radius:10px;background:#100b20dd;z-index:2}#help{position:fixed;bottom:12px;left:12px;padding:9px 12px;background:#100b20dd;border-radius:9px;color:#d8cfff}#error{padding:24px;color:#ffaaaa}</style></head>
<body><div id="hud"><b>GOBLOX</b> · ${esc(project.name || "Meu jogo")}</div><div id="help">WASD: mover câmera · Mouse: olhar ao redor · Scroll: zoom</div>
<script type="module">
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
const data=${safe};
const scene=new THREE.Scene();scene.background=new THREE.Color("#171725");
scene.add(new THREE.HemisphereLight(0xffffff,0x45405e,2));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(7,12,6);scene.add(sun);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1000);camera.position.set(9,8,11);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);document.body.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1,0);controls.enableDamping=true;
const grid=new THREE.GridHelper(100,100,0x66558c,0x302b43);scene.add(grid);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:"#20202d",roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-.04;scene.add(floor);
for(const o of data.objects){let g;if(o.type==="Cilindro")g=new THREE.CylinderGeometry(o.size.x/2,o.size.x/2,o.size.y,24);else if(o.type==="Esfera")g=new THREE.SphereGeometry(o.size.x/2,24,16);else g=new THREE.BoxGeometry(o.size.x,o.size.y,o.size.z);const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:o.color,roughness:.78}));m.name=o.name;m.position.set(o.position.x,o.position.y,o.position.z);m.castShadow=true;scene.add(m);}
const keys=new Set();addEventListener("keydown",e=>keys.add(e.key.toLowerCase()));addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
function tick(){requestAnimationFrame(tick);const speed=.12;if(keys.has("w"))camera.position.z-=speed;if(keys.has("s"))camera.position.z+=speed;if(keys.has("a"))camera.position.x-=speed;if(keys.has("d"))camera.position.x+=speed;controls.update();renderer.render(scene,camera);}tick();
</script></body></html>`;
}
export function downloadCompiledGame(project) {
  const html = compileGobloxProject(project);
  const blob = new Blob([html], {type:"text/html;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = (String(project.name || "jogo-goblox").replace(/[^a-z0-9-_]/gi,"-").slice(0,50) || "jogo-goblox") + ".html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return html.length;
}
