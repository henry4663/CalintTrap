import { getCurrentNick, logout } from "./authLocal.js";
import { getWallet, saveWallet } from "./economia.js";

const boasVindas = document.getElementById("boasVindas");
const btnPerfil = document.getElementById("btnPerfil");
const btnSair = document.getElementById("btnSair");
const toast = document.getElementById("toast");

const valFbux = document.getElementById("valFbux");
const valMoedas = document.getElementById("valMoedas");

function mostrarToast(msg, tipo = "info") {
  if (!toast) return;

  toast.textContent = msg;
  toast.className = `toast show ${tipo}`;

  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

function carregarEconomia(nick) {
  const wallet = getWallet(nick, { fbux: 50, moedas: 120 });

  if (valFbux) valFbux.textContent = wallet.fbux;
  if (valMoedas) valMoedas.textContent = wallet.moedas;
}

function verificarSessao() {
  const nick = getCurrentNick();

  if (!nick) {
    window.location.href = "lock.html";
    return;
  }

  localStorage.setItem("goblox_player_nick", nick);

  if (boasVindas) {
    boasVindas.textContent = `Olá, ${nick}!`;
  }

  carregarEconomia(nick);
}

if (btnPerfil) {
  btnPerfil.addEventListener("click", () => {
    mostrarToast("Tela de perfil em construção!", "warning");
  });
}

if (btnSair) {
  btnSair.addEventListener("click", () => {
    logout();
  });
}

document.querySelectorAll(".game-card").forEach((card) => {
  card.addEventListener("click", () => {
    const page = card.dataset.page;

    if (!page) {
      mostrarToast("Jogo não disponível ainda.", "warning");
      return;
    }

    if (page === "lock.html") {
      logout();
      return;
    }

    window.location.href = page;
  });
});

verificarSessao();
