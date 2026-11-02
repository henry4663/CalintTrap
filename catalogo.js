import { getCurrentNick, logout } from "./authLocal.js";

const boasVindas = document.getElementById("boasVindas");
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

function carregarDados() {
  const nick = getCurrentNick();
  if (!nick) {
    window.location.href = "lock.html";
    return;
  }

  if (boasVindas) boasVindas.textContent = `Olá, ${nick}!`;

  const keyFbux = `goblox_fbux_${nick}`;
  const keyMoedas = `goblox_moedas_${nick}`;

  let fbux = localStorage.getItem(keyFbux);
  let moedas = localStorage.getItem(keyMoedas);

  if (fbux === null) { fbux = 50; localStorage.setItem(keyFbux, fbux); }
  if (moedas === null) { moedas = 120; localStorage.setItem(keyMoedas, moedas); }

  if (valFbux) valFbux.textContent = fbux;
  if (valMoedas) valMoedas.textContent = moedas;

  atualizarInventarioVisual(nick);
}

window.mudarTab = function(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");
};

window.comprarItem = function(idItem, preco, tipoMoeda) {
  const nick = getCurrentNick();
  const keyFbux = `goblox_fbux_${nick}`;
  const keyMoedas = `goblox_moedas_${nick}`;
  const keyInventario = `goblox_inventario_${nick}`;

  let saldoFbux = parseInt(localStorage.getItem(keyFbux) || 0);
  let saldoMoedas = parseInt(localStorage.getItem(keyMoedas) || 0);
  let inventario = JSON.parse(localStorage.getItem(keyInventario) || "[]");

  if (inventario.includes(idItem)) {
    mostrarToast("Você já possui este item!", "warning");
    return;
  }

  if (tipoMoeda === 'fbux') {
    if (saldoFbux < preco) {
      mostrarToast("FBUX insuficientes!", "danger");
      return;
    }
    saldoFbux -= preco;
    localStorage.setItem(keyFbux, saldoFbux);
    valFbux.textContent = saldoFbux;
  } else if (tipoMoeda === 'moedas') {
    if (saldoMoedas < preco) {
      mostrarToast("Moedas insuficientes!", "danger");
      return;
    }
    saldoMoedas -= preco;
    localStorage.setItem(keyMoedas, saldoMoedas);
    valMoedas.textContent = saldoMoedas;
  }

  inventario.push(idItem);
  localStorage.setItem(keyInventario, JSON.stringify(inventario));
  mostrarToast("Item comprado com sucesso!", "success");
  atualizarInventarioVisual(nick);
};

function atualizarInventarioVisual(nick) {
  const keyInventario = `goblox_inventario_${nick}`;
  let inventario = JSON.parse(localStorage.getItem(keyInventario) || "[]");
  const container = document.getElementById("listaInventario");
  if (!container) return;

  if (inventario.length === 0) {
    container.innerHTML = '<span style="color: #888;">Nenhum item comprado ainda.</span>';
    return;
  }

  const icones = { coroa: '👑', chupeta: 'não exite emogi:(', cabelo_amarelo: '👱' };
  container.innerHTML = inventario.map(item => `
    <div style="background: rgba(0,0,0,0.5); padding: 10px 15px; border-radius: 8px; border: 1px solid #4ade80;">
      ${icones[item] || '🎁'} ${item.toUpperCase()}
    </div>
  `).join('');
}

if (btnSair) {
  btnSair.addEventListener("click", () => logout());
}

carregarDados();
