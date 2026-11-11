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
  const ban=dados.ban;
  const banAtivo=Boolean(ban?.active && (ban.permanent || Number(ban.until)>Date.now()));
  if (banAtivo) {
   const suspended=document.createElement("div");
   suspended.style.cssText="margin:18px 0;padding:16px;border:1px solid #ef4444;background:#450a0a;color:#fecaca;border-radius:12px";
   const heading=document.createElement("strong");heading.textContent="⛔ CONTA SUSPENSA";
   const reason=document.createElement("p");reason.style.marginTop="8px";reason.textContent="Motivo: "+String(ban.reason||"Não informado");
   const until=document.createElement("p");until.style.marginTop="6px";until.textContent=ban.permanent?"Duração: permanente":"Suspensão até: "+new Date(Number(ban.until)).toLocaleString("pt-BR");
   suspended.append(heading,reason,until);
   document.querySelector(".profile-card")?.appendChild(suspended);
   $("profile-status").textContent="Suspenso";
  }
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
  const custom=dados.catalogEquipped||{};
  const themeStyles={theme_neon:"linear-gradient(115deg,#5522c8,#242b62 60%,#087d9e)",theme_ocean:"linear-gradient(115deg,#075985,#0e7490)",theme_fire:"linear-gradient(115deg,#9a3412,#7f1d1d)",theme_nature:"linear-gradient(115deg,#166534,#365314)"};
  const nameColors={name_white:"#ffffff",name_purple:"#c4b5fd",name_cyan:"#67e8f9",name_gold:"#fcd34d"};
  const frameColors={frame_purple:"#a78bfa",frame_gold:"#fbbf24",frame_cyan:"#22d3ee",frame_red:"#fb7185"};
  const cover=document.querySelector(".cover");
  if(cover&&themeStyles[custom.theme])cover.style.background=themeStyles[custom.theme];
  if(nameColors[custom.name])$("profile-title").style.color=nameColors[custom.name];
  if(frameColors[custom.frame])$("profile-avatar").style.borderColor=frameColors[custom.frame];
$("profile-created").textContent=dados.createdAt?new Date(dados.createdAt).toLocaleDateString("pt-BR"):"Membro";
  if(souDono){$("display-name").value=dados.displayName||nickAlvo;$("bio-input").value=dados.bio||"";$("avatar-url").value=dados.avatarUrl||"";$("bio-count").textContent=$("bio-input").value.length;}
  if(!souDono && !banAtivo)$("profile-status").textContent="Jogador";
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