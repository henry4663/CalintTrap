import { getCurrentNick, logout } from "./authLocal.js";
import { saveJsonToFile, loadJsonFromFile } from "./saveFile.js";

const boasVindas = document.getElementById("boasVindas");
const btnSair = document.getElementById("btnSair");
const btnPerfil = document.getElementById("btnPerfil");
const btnSalvarDados = document.getElementById("btnSalvarDados");
const toast = document.getElementById("toast");
const inputSave = document.getElementById("inputSave");

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

function salvarDadosDoJogo() {
  const nick = getCurrentNick();

  const saveData = {
    nick: nick || "Jogador",
    vida: 100,
    moedas: 120,
    nivel: 1,
    inventario: [
      { id: "pocao", nome: "Poção" },
      { id: "espada", nome: "Espada" }
    ],
    posicao: { x: 0, y: 2, z: 0 }
  };

  saveJsonToFile(saveData, `${(nick || "save").toLowerCase()}.fxkey`)
    .then(() => {
      mostrarToast("Save salvo com sucesso!", "success");
    })
    .catch(() => {
      mostrarToast("Erro ao salvar o save.", "error");
    });
}

async function carregarDadosDoArquivo(file) {
  if (!file) return;

  try {
    const data = await loadJsonFromFile(file);

    if (!data) {
      throw new Error("Arquivo inválido");
    }

    console.log("Dados carregados:", data);
    mostrarToast("Save carregado com sucesso!", "success");
  } catch {
    mostrarToast("Arquivo inválido ou corrompido.", "error");
  }
}

function configurarEventos() {
  btnSair?.addEventListener("click", () => {
    logout();
  });

  btnPerfil?.addEventListener("click", () => {
    mostrarToast("Tela de perfil em construção!", "info");
  });

  btnSalvarDados?.addEventListener("click", () => {
    salvarDadosDoJogo();
  });

  inputSave?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    carregarDadosDoArquivo(file);
  });

  document.querySelectorAll(".game-card").forEach((card) => {
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
