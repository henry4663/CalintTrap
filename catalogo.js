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
  mostrarToast.timer = setTimeout(() => { toast.className = "toast"; }, 2500);
}

function getNick() {
  return getCurrentNick() || localStorage.getItem("goblox_player_nick") || "Jogador";
}

function carregarDados() {
  const nick = getNick();
  if (boasVindas) boasVindas.textContent = `Olá, ${nick}!`;

  const keyFbux = `goblox_fbux_${nick}`;
  const keyMoedas = `goblox_moedas_${nick}`;

  let fbux = localStorage.getItem(keyFbux);
  let moedas = localStorage.getItem(keyMoedas);

  if (fbux === null) { fbux = 500; localStorage.setItem(keyFbux, fbux); } // Começa com bom saldo para teste
  if (moedas === null) { moedas = 200; localStorage.setItem(keyMoedas, moedas); }

  valFbux.textContent = fbux;
  valMoedas.textContent = moedas;

  atualizarInterfaceLojaEInventario(nick);
}

window.mudarTab = function(evt, tabName) {
  document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");
};

// COMPRAR ITEM
window.comprarItem = function(idItem, preco, tipoMoeda) {
  const nick = getNick();
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

  // Equipa automaticamente o item recém-comprado
  let equipados = JSON.parse(localStorage.getItem(`goblox_equipados_${nick}`) || "[]");
  if (!equipados.includes(idItem)) equipados.push(idItem);
  localStorage.setItem(`goblox_equipados_${nick}`, JSON.stringify(equipados));

  mostrarToast("Item comprado e equipado com sucesso!", "success");
  atualizarInterfaceLojaEInventario(nick);
};

// EQUIPAR / DESEQUIPAR
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

  // Atualiza botões da Loja
  ['coroa', 'chupeta', 'cabelo_amarelo'].forEach(id => {
    const btn = document.getElementById(`btn_buy_${id}`);
    if (btn) {
      if (inventario.includes(id)) {
        btn.textContent = "Comprado";
        btn.className = "btn-action btn-owned";
        btn.disabled = true;
      }
    }
  });

  // Atualiza lista do Inventário
  const container = document.getElementById("listaInventario");
  if (!container) return;

  if (inventario.length === 0) {
    container.innerHTML = '<span style="color: #888;">Nenhum item comprado ainda. Vá à Loja adquirir acessórios!</span>';
    return;
  }

  const icones = { coroa: '👑', chupeta: 'não exite icone:(', cabelo_amarelo: '👱' };
  
  container.innerHTML = inventario.map(item => {
    const estaEquipado = equipados.includes(item);
    return `
      <div style="background: rgba(0,0,0,0.6); padding: 15px; border-radius: 10px; border: 2px solid ${estaEquipado ? '#7dff83' : '#444'}; text-align: center; min-width: 150px;">
        <div style="font-size: 40px; margin-bottom: 5px;">${icones[item] || '🎁'}</div>
        <div style="color: #fff; font-weight: bold; margin-bottom: 10px; text-transform: uppercase;">${item.replace('_', ' ')}</div>
        <button onclick="alternarEquipamento('${item}')" style="width: 100%; padding: 8px; border: none; border-radius: 6px; background: ${estaEquipado ? '#ff5555' : '#63df70'}; color: #000; font-weight: bold; cursor: pointer;">
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
