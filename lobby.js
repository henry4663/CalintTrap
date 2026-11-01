import { db, ref, get, toast, auth, signOut } from "./firebase.js";

const $ = id => document.getElementById(id);

const user = localStorage.getItem("goblox_user");
if (!user) {
  location.href = "lock.html";
}

async function carregarDados() {
  if (!user) return;
  try {
    $("boasVindas").textContent = `Olá, ${user}!`;
  } catch (e) {
    console.warn("Não foi possível atualizar o nome do usuário.", e);
  }
}
carregarDados();

$("btnSair").onclick = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Erro ao sair da sessão:", e);
  } finally {
    localStorage.removeItem("goblox_user");
    location.href = "lock.html";
  }
};

$("btnPerfil").onclick = () => {
  toast("Tela de perfil em construção!", "sucesso");
};

// Função chamada quando clica nos jogos (FPS, Parkour, Esconde)
window.abrirJogo = (nomeJogo) => {
  toast(`${nomeJogo} estará disponível em breve!`, "error");
};
