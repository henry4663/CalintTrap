import { db, ref, get, set } from "./firebase.js";
import { getCurrentNick } from "./authLocal.js";
const $ = id => document.getElementById(id);
const nickLogado = getCurrentNick();
const nickAlvo = (new URLSearchParams(location.search).get("user") || nickLogado || "").trim();
const souDono = Boolean(nickLogado && nickAlvo && nickLogado.toLowerCase() === nickAlvo.toLowerCase());
function profileKey(username){return encodeURIComponent(String(username).trim().toLowerCase()).replace(/\./g,"%2E");}
function avatarPadrao(username){return "https://api.dicebear.com/7.x/bottts/svg?seed="+encodeURIComponent(username);}
function mensagem(texto,erro=false){$("profile-message").textContent=texto;$("profile-message").classList.toggle("error",erro);}
function imagemSegura(url,username){const valor=String(url||"").trim();if(!valor)return avatarPadrao(username);try{const parsed=new URL(valor);return ["https:","http:"].includes(parsed.protocol)?parsed.href:avatarPadrao(username);}catch{return avatarPadrao(username);}}
async function carregarPerfil(){
 if(!nickAlvo){location.href="index.html";return;}
 $("edit-panel").hidden=!souDono;$("profile-username").textContent="@"+nickAlvo;$("profile-avatar").src=avatarPadrao(nickAlvo);
 try{
  const snapshot=await get(ref(db,"profiles/"+profileKey(nickAlvo)));const dados=snapshot.exists()?snapshot.val():{};
  $("profile-title").textContent=String(dados.displayName||nickAlvo).slice(0,24);
  const usernameLine=$("profile-username");
  usernameLine.replaceChildren();
  usernameLine.style.cssText="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px";
  const roleConfig={
   verified:{label:"VERIFICADO",color:"#38bdf8",background:"#082f49",border:"#0ea5e9"},
   influencer:{label:"INFLUENCIADOR",color:"#c084fc",background:"#3b0764",border:"#a855f7"}
  };
  const role=roleConfig[dados.role];
  if(role){
   const roleTag=document.createElement("span");
   roleTag.textContent=role.label;
   roleTag.style.cssText="display:inline-flex;align-items:center;padding:4px 8px;border-radius:6px;font-size:10px;font-weight:900;letter-spacing:.7px;color:"+role.color+";background:"+role.background+";border:1px solid "+role.border;
   usernameLine.appendChild(roleTag);
  }
  const nickTag=document.createElement("span");
  nickTag.textContent="@"+nickAlvo;
  nickTag.style.cssText="font-weight:800;color:"+(role?role.color:"#aab2c8")+";";
  usernameLine.appendChild(nickTag);
  $("profile-bio").textContent=String(dados.bio||"Este jogador ainda não escreveu uma biografia.");
  $("profile-avatar").src=imagemSegura(dados.avatarUrl,nickAlvo);
  $("profile-created").textContent=dados.createdAt?new Date(dados.createdAt).toLocaleDateString("pt-BR"):"Membro";
  if(souDono){$("display-name").value=dados.displayName||nickAlvo;$("bio-input").value=dados.bio||"";$("avatar-url").value=dados.avatarUrl||"";$("bio-count").textContent=$("bio-input").value.length;}
  if(!souDono)$("profile-status").textContent="Jogador";
 }catch(error){console.error(error);$("profile-title").textContent=nickAlvo;$("profile-bio").textContent="Não foi possível carregar os dados deste perfil.";mensagem("Erro ao conectar com o Firebase.",true);}
}
$("bio-input").addEventListener("input",()=>$("bio-count").textContent=$("bio-input").value.length);
$("profile-form").addEventListener("submit",async event=>{
 event.preventDefault();if(!souDono)return;
 const displayName=$("display-name").value.trim(),bio=$("bio-input").value.trim(),avatarUrl=$("avatar-url").value.trim();
 if(displayName.length<2)return mensagem("O nome precisa ter pelo menos 2 caracteres.",true);
 if(avatarUrl&&!/^https?:\/\//i.test(avatarUrl))return mensagem("A URL precisa começar com http:// ou https://.",true);
 const button=$("save-profile");button.disabled=true;button.textContent="Salvando...";
 try{
  const caminho=ref(db,"profiles/"+profileKey(nickLogado));const atual=await get(caminho);const dadosAtuais=atual.exists()?atual.val():{};
  await set(caminho,{...dadosAtuais,displayName:displayName.slice(0,24),bio:bio.slice(0,160),avatarUrl:avatarUrl.slice(0,500),createdAt:dadosAtuais.createdAt||Date.now(),updatedAt:Date.now()});
  $("profile-title").textContent=displayName;$("profile-bio").textContent=bio||"Este jogador ainda não escreveu uma biografia.";$("profile-avatar").src=imagemSegura(avatarUrl,nickLogado);$("profile-created").textContent=new Date(dadosAtuais.createdAt||Date.now()).toLocaleDateString("pt-BR");mensagem("Perfil salvo com sucesso!");
 }catch(error){console.error(error);mensagem("Não foi possível salvar. Verifique as regras do Firebase.",true);}
 finally{button.disabled=false;button.textContent="Salvar alterações";}
});
carregarPerfil();