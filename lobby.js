import { getCurrentNick, logout } from "./authLocal.js";

const boasVindas = document.getElementById("boasVindas");
const btnPerfil = document.getElementById("btnPerfil");
const btnSair = document.getElementById("btnSair");
const toast = document.getElementById("toast");

function mostrarToast(msg, tipo = "info") {
  if (!toast) return;

  toast.textContent = msg;
  toast.className = `toast show ${tipo}`;

  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

function verificarSessao() {
  const nick = getCurrentNick();

  if (!nick) {
    window.location.href = "lock.html";
    return;
  }

  boasVindas.textContent = `Olá, ${nick}!`;
}

btnPerfil.addEventListener("click", () => {
  mostrarToast("Tela de perfil em construção!", "warning");
});

btnSair.addEventListener("click", () => {
  logout();
});

document.querySelectorAll(".game-card").forEach((card) => {
  card.addEventListener("click", () => {
    const page = card.dataset.page;

    if (!page) {
      mostrarToast("Jogo não disponível ainda.", "warning");
      return;
    }

    window.location.href = page;
  });
});

verificarSessao();
