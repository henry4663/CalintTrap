
import { db, ref, get, toast } from "./firebase.js";

const $ = id => document.getElementById(id);

/* ===== VERIFICA LOGIN ===== */
const user = localStorage.getItem("goblox_user");
if (!user) {
  location.href = "lock.html"; // Manda pro login se não estiver logado
}

/* ===== PREENCHE OS DADOS DO USUÁRIO ===== */
async function carregarDados() {
  if (!user) return;
  
  try {
    const snap = await get(ref(db, "users/" + user));
    if (snap.exists()) {
      $("boasVindas").textContent = `Olá, ${user}!`;
    }
  } catch (e) {
    console.warn("Firebase não configurado ou offline.");
    $("boasVindas").textContent = `Olá, ${user}!`;
  }
}
carregarDados();

/* ===== AÇÕES ===== */
$("btnSair").onclick = () => {
  localStorage.removeItem("goblox_user");
  location.href = "lock.html";
};

$("btnPerfil").onclick = () => {
  // Por enquanto só mostra um aviso, na Parte 3 fazemos a tela de perfil
  toast("Tela de perfil em construção!");
};

window.emBreve = () => {
  toast("Esse jogo chega na próxima atualização!", "error");
};
