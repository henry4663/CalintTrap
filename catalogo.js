import { getCurrentNick, logout } from "./authLocal.js";
import { getWallet, saveWallet, debitarWallet } from "./economia.js";
import { db } from "./firebase.js";
import { ref, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
  mostrarToast.timer = setTimeout(() => { toast.className = "toast"; }, 2500);
}

function getNick() {
  return getCurrentNick() || localStorage.getItem("goblox_player_nick") || "Jogador";
}

function carregarDados() {
  const nick = getNick();
  if (boasVindas) boasVindas.textContent = `Olá, ${nick}!`;

  const wallet = getWallet(nick, { fbux: 500, moedas: 200 });

  valFbux.textContent = wallet.fbux;
  valMoedas.textContent = wallet.moedas;

  atualizarInterfaceLojaEInventario(nick);
}

window.mudarTab = function(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");
};

window.comprarItem = function(idItem, preco, tipoMoeda) {
  const nick = getNick();
  const keyInventario = `goblox_inventario_${nick}`;

  let inventario = JSON.parse(localStorage.getItem(keyInventario) || "[]");

  if (inventario.includes(idItem)) {
    mostrarToast("Você já possui este item!", "warning");
    return;
  }

  const custo = tipoMoeda === 'fbux' ? { fbux: Number(preco) } : { moedas: Number(preco) };
  const debito = debitarWallet(nick, custo);

  if (!debito.ok) {
    mostrarToast(tipoMoeda === 'fbux' ? "FBUX insuficientes!" : "Moedas insuficientes!", "danger");
    return;
  }

  inventario.push(idItem);
  localStorage.setItem(keyInventario, JSON.stringify(inventario));

  let equipados = JSON.parse(localStorage.getItem(`goblox_equipados_${nick}`) || "[]");
  if (!equipados.includes(idItem)) equipados.push(idItem);
  localStorage.setItem(`goblox_equipados_${nick}`, JSON.stringify(equipados));

  valFbux.textContent = debito.wallet.fbux;
  valMoedas.textContent = debito.wallet.moedas;

  mostrarToast("Item comprado e equipado!", "success");
  atualizarInterfaceLojaEInventario(nick);
};

window.alternarEquipamento = function(idItem) {
  const nick = getNick();
  const keyEquipados = `goblox_equipados_${nick}`;
  let equipados = JSON.parse(localStorage.getItem(keyEquipados) || "[]");

  const index = equipados.indexOf(idItem);
  if (index > -1) {
    equipados.splice(index, 1);
    mostrarToast("Item desequipado.", "info");
  } else {
    equipados.push(idItem);
    mostrarToast("Item equipado com sucesso!", "success");
  }

  localStorage.setItem(keyEquipados, JSON.stringify(equipados));
  atualizarInterfaceLojaEInventario(nick);
};

function atualizarInterfaceLojaEInventario(nick) {
  const keyInventario = `goblox_inventario_${nick}`;
  const keyEquipados = `goblox_equipados_${nick}`;

  let inventario = JSON.parse(localStorage.getItem(keyInventario) || "[]");
  let equipados = JSON.parse(localStorage.getItem(keyEquipados) || "[]");

  ['coroa', 'chupeta', 'cabelo_amarelo'].forEach(id => {
    const btn = document.getElementById(`btn_buy_${id}`);
    if (btn && inventario.includes(id)) {
      btn.textContent = "Comprado";
      btn.className = "btn-action btn-owned";
      btn.disabled = true;
    }
  });

  const container = document.getElementById("listaInventario");
  if (!container) return;

  if (inventario.length === 0) {
    container.innerHTML = '<span style="color: #888;">Nenhum item comprado ainda.</span>';
    return;
  }

  const icones = { coroa: '👑', chupeta: '', cabelo_amarelo: '👱' };

  container.innerHTML = inventario.map(item => {
    const estaEquipado = equipados.includes(item);
    return `
      <div style="background: rgba(0,0,0,0.6); padding: 15px; border-radius: 10px; border: 2px solid ${estaEquipado ? '#7dff83' : '#444'}; text-align: center; min-width: 150px;">
        <div style="font-size: 40px; margin-bottom: 5px;">${icones[item] || '🎁'}</div>
        <div style="color: #fff; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">${item.replace('_', ' ')}</div>
        <button onclick="alternarEquipamento('${item}')" style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: ${estaEquipado ? '#ff5555' : '#63df70'}; color: #000; font-weight: 700;">
          ${estaEquipado ? 'Desequipar' : 'Equipar'}
        </button>
      </div>
    `;
  }).join('');
}

if (btnSair) {
  btnSair.addEventListener("click", () => logout());
}

carregarDados();
