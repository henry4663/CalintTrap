import { db, ref, get, toast } from "./firebase.js";

const $ = id => document.getElementById(id);

const user = localStorage.getItem("goblox_user");
if (!user) {
  location.href = "lock.html";
}

async function carregarDados() {
  if (!user) return;
  try {
    $("boasVindas").textContent = `Olá, ${user}!`;
  } catch (e) {}
}
carregarDados();

$("btnSair").onclick = () => {
  localStorage.removeItem("goblox_user");
  location.href = "lock.html";
};

$("btnPerfil").onclick = () => {
  toast("Tela de perfil em construção!");
};

// Função chamada quando clica nos jogos (FPS, Parkour, Esconde)
window.abrirJogo = (nomeJogo) => {
  toast(`${nomeJogo} estará disponível em breve!`, "error");
};
