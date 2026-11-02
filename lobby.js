import { getCurrentNick, logout } from "./authLocal.js";

const boasVindas = document.getElementById("boasVindas");
const btnPerfil = document.getElementById("btnPerfil");
const btnSair = document.getElementById("btnSair");
const toast = document.getElementById("toast");

// Elementos dos mostradores de Moedas e FBUX
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

// Carrega as moedas e FBUX da conta / plataforma
function carregarEconomia(nick) {
  // Tenta carregar do localStorage (salvo com a chave do nick do jogador)
  const keyFbux = `goblox_fbux_${nick}`;
  const keyMoedas = `goblox_moedas_${nick}`;

  // Se não existir valor salvo ainda, inicializa com um valor padrão (ex: 50 FBUX e 120 Moedas)
  let fbux = localStorage.getItem(keyFbux);
  let moedas = localStorage.getItem(keyMoedas);

  if (fbux === null) {
    fbux = 50;
    localStorage.setItem(keyFbux, fbux);
  }
  if (moedas === null) {
    moedas = 120;
    localStorage.setItem(keyMoedas, moedas);
  }

  // Atualiza os elementos na tela
  if (valFbux) valFbux.textContent = fbux;
  if (valMoedas) valMoedas.textContent = moedas;
}

function verificarSessao() {
  const nick = getCurrentNick();

  if (!nick) {
    window.location.href = "lock.html";
    return;
  }

  // Garante que o nick ativo fica salvo no localStorage global para o personagem.js utilizar
  localStorage.setItem("goblox_player_nick", nick);

  if (boasVindas) {
    boasVindas.textContent = `Olá, ${nick}!`;
  }

  // Carrega a economia da conta
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

// Inicializa a verificação de sessão e economia
verificarSessao();
