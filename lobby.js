import { getCurrentNick, logout } from "./authLocal.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const boasVindas = $("#boasVindas");
const btnSair = $("#btnSair");
const btnPerfil = $("#btnPerfil");
const toast = $("#toast");

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
    return null;
  }

  if (boasVindas) {
    boasVindas.textContent = `Olá, ${nick}!`;
  }

  return nick;
}

function configurarEventos() {
  btnSair?.addEventListener("click", () => {
    logout();
  });

  btnPerfil?.addEventListener("click", () => {
    mostrarToast("Tela de perfil em construção!", "info");
  });

  $$(".game-card").forEach((card) => {
    card.addEventListener("click", () => {
      const nome = card.dataset.game || "Jogo";
      mostrarToast(`${nome} em desenvolvimento!`, "warning");
    });
  });
}

window.abrirJogo = (nomeJogo) => {
  mostrarToast(`${nomeJogo} estará disponível em breve!`, "warning");
};

document.addEventListener("DOMContentLoaded", () => {
  verificarSessao();
  configurarEventos();
});
