import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";

const $ = id => document.getElementById(id);
const canvas=$("view"), scene=new THREE.Scene();
scene.background=new THREE.Color("#171725");
const camera=new THREE.PerspectiveCamera(55,1,.1,1000);
camera.position.set(9,8,11);
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
const controls=new OrbitControls(camera,renderer.domElement);
controls.enableDamping=true; controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight(0xffffff,0x45405e,2));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(7,12,6);sun.castShadow=true;scene.add(sun);
const grid=new THREE.GridHelper(100,100,0x66558c,0x302b43);scene.add(grid);
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshStandardMaterial({color:"#20202d",roughness:1}));
floor.rotation.x=-Math.PI/2;floor.position.y=-.03;floor.receiveShadow=true;scene.add(floor);
const objects=[];let selected=null;let counter=0;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
function status(msg){$("status").textContent=msg;}
function resize(){const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;renderer.setSize(box.width,box.height,false);camera.aspect=box.width/box.height;camera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(canvas);resize();
function geometry(type,size){if(type==="Cilindro")return new THREE.CylinderGeometry(size.x/2,size.x/2,size.y,24);if(type==="Esfera")return new THREE.SphereGeometry(size.x/2,24,16);return new THREE.BoxGeometry(size.x,size.y,size.z);}
function addObject(type="Bloco",data={}){
 const size=data.size||{x:2,y:1,z:2};
 const material=new THREE.MeshStandardMaterial({color:data.color||"#8b5cf6",roughness:.78});
 const mesh=new THREE.Mesh(geometry(type,size),material);
 mesh.name=data.name||type+" "+(++counter);mesh.userData.kind=type;
 const p=data.position||{x:0,y:size.y/2,z:0};mesh.position.set(p.x,p.y,p.z);
 mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);objects.push(mesh);select(mesh);renderList();status(mesh.name+" adicionado.");return mesh;
}
function select(mesh){selected=mesh;renderList();renderProperties();}
function renderList(){
 const root=$("object-list");root.replaceChildren();
 if(!objects.length){const p=document.createElement("p");p.className="empty";p.textContent="Sua cena está vazia. Adicione um bloco para começar.";root.append(p);return;}
 [...objects].reverse().forEach(mesh=>{const b=document.createElement("button");b.className="object-item"+(mesh===selected?" active":"");const icon=document.createElement("span");icon.className="object-icon";icon.textContent=mesh.userData.kind==="Bloco"?"▰":mesh.userData.kind==="Cilindro"?"◉":mesh.userData.kind==="Esfera"?"●":"⌂";const name=document.createElement("span");name.textContent=mesh.name;b.append(icon,name);b.addEventListener("click",()=>select(mesh));root.append(b);});
}
function field(label,key,value,step="0.5"){const wrap=document.createElement("div");wrap.className="field";const l=document.createElement("label");l.textContent=label;const input=document.createElement("input");input.type="number";input.step=step;input.value=Number(value.toFixed(2));input.addEventListener("change",()=>{if(!selected)return;const v=Number(input.value);if(!Number.isFinite(v))return;const [target,axis]=key.split(".");selected[target][axis]=target==="scale"?Math.max(.1,v):v;renderProperties();});wrap.append(l,input);return wrap;}
function renderProperties(){
 const root=$("properties");root.replaceChildren();if(!selected){const p=document.createElement("p");p.className="empty";p.textContent="Selecione um objeto para editar.";root.append(p);return;}
 const nameWrap=document.createElement("div");nameWrap.className="field";const label=document.createElement("label");label.textContent="Nome";const name=document.createElement("input");name.value=selected.name;name.maxLength=40;name.addEventListener("change",()=>{selected.name=name.value.trim()||"Objeto";renderList();});nameWrap.append(label,name);root.append(nameWrap);
 const colorWrap=document.createElement("div");colorWrap.className="field";const colorLabel=document.createElement("label");colorLabel.textContent="Cor";const color=document.createElement("input");color.type="color";color.value="#"+selected.material.color.getHexString();color.addEventListener("input",()=>selected.material.color.set(color.value));colorWrap.append(colorLabel,color);root.append(colorWrap);
 const pos=document.createElement("p");pos.className="empty";pos.textContent="Posição";root.append(pos);const pg=document.createElement("div");pg.className="triple";["x","y","z"].forEach(a=>pg.append(field(a,"position."+a,selected.position[a])));root.append(pg);
 const size=document.createElement("p");size.className="empty";size.style.marginTop="15px";size.textContent="Tamanho";root.append(size);const sg=document.createElement("div");sg.className="triple";["x","y","z"].forEach(a=>sg.append(field(a,"scale."+a,selected.scale[a])));root.append(sg);
}
function exportData(){return {format:"GOBLOX_GAME",version:1,name:"Meu jogo",objects:objects.map(m=>({name:m.name,type:m.userData.kind,position:{x:m.position.x,y:m.position.y,z:m.position.z},size:(()=>{const b=new THREE.Box3().setFromObject(m);const s=b.getSize(new THREE.Vector3());return {x:s.x,y:s.y,z:s.z};})(),color:"#"+m.material.color.getHexString()})),script:$("script-editor").value};}
function save(){const data=exportData();const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="meu-jogo.gog";a.click();URL.revokeObjectURL(url);status("Projeto .gog exportado!");}
function load(data){if(!data||!Array.isArray(data.objects))throw new Error("Arquivo .gog inválido.");objects.splice(0).forEach(o=>scene.remove(o));counter=0;for(const item of data.objects)addObject(item.type||"Bloco",item);$("script-editor").value=data.script||"";if(!objects.length)select(null);renderList();status("Projeto carregado.");}
function deleteSelected(){if(!selected)return status("Selecione um objeto primeiro.");scene.remove(selected);objects.splice(objects.indexOf(selected),1);selected=null;renderList();renderProperties();status("Objeto excluído.");}
function duplicate(){if(!selected)return status("Selecione um objeto primeiro.");const data={name:selected.name+" cópia",position:{x:selected.position.x+1,y:selected.position.y,z:selected.position.z+1},size:{x:selected.scale.x,y:selected.scale.y,z:selected.scale.z},color:"#"+selected.material.color.getHexString()};addObject(selected.userData.kind,data);}
$("add-part").onclick=()=>addObject("Bloco");
$("add-cylinder").onclick=()=>addObject("Cilindro");
$("add-sphere").onclick=()=>addObject("Esfera");
$("add-spawn").onclick=()=>{const m=addObject("Bloco",{name:"Spawn",size:{x:3,y:.3,z:3},position:{x:0,y:.15,z:0},color:"#22c55e"});m.userData.kind="Spawn";renderList();};
$("delete-object").onclick=deleteSelected;$("duplicate-object").onclick=duplicate;
$("focus-object").onclick=()=>{if(!selected)return status("Selecione um objeto primeiro.");controls.target.copy(selected.position);camera.position.set(selected.position.x+7,selected.position.y+6,selected.position.z+8);controls.update();};
$("save-project").onclick=save;$("open-project").onclick=()=>$("file-input").click();
$("file-input").onchange=async e=>{const file=e.target.files[0];if(!file)return;try{load(JSON.parse(await file.text()));}catch(err){status("Não consegui abrir esse arquivo .gog.");console.error(err);}e.target.value="";};
$("new-project").onclick=()=>{if(objects.length&&!confirm("Começar um projeto novo? Os objetos atuais serão removidos."))return;objects.splice(0).forEach(o=>scene.remove(o));selected=null;$("script-editor").value="";renderList();renderProperties();status("Projeto novo criado.");};
$("tab-script").onclick=()=>{$("script-editor").hidden=false;$("editor-info").hidden=true;$("tab-script").classList.add("active");$("tab-scene").classList.remove("active");};
$("tab-scene").onclick=()=>{$("script-editor").hidden=true;$("editor-info").hidden=false;$("tab-scene").classList.add("active");$("tab-script").classList.remove("active");};
canvas.addEventListener("pointerdown",event=>{const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(objects,false);if(hits.length)select(hits[0].object);});
function animate(){requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}animate();
renderList();renderProperties();
