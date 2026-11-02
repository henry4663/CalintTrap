import { db } from "./firebase.js";
import { ref, onValue, remove, update, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getCurrentNick } from "./authLocal.js";
import { getWallet, saveWallet } from "./economia.js";

const toast = document.getElementById("toast");
const tbody = document.getElementById("listaJogadoresOnline");
const totalOnlineSpan = document.getElementById("totalOnline");

function mostrarToast(msg, tipo = "info") {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${tipo}`;
  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}

function normalizeNick(nick) {
  return String(nick || "").trim();
}

// --- RESTRIÇÃO DE ACESSO EXCLUSIVA PARA henryDEV777! ---
const nickAtual = getCurrentNick() || localStorage.getItem("goblox_player_nick");

if (nickAtual !== "henryDEV777!" && nickAtual !== "henryDEV777") {
  alert("Acesso Negado! Apenas a conta henryDEV777! pode acessar este painel.");
  window.location.href = "lobby.html";
}

// --- DETECTAR JOGADORES EM TEMPO REAL (SERVIDORES MULTIPLAYER) ---
const serverRef = ref(db, "forest_players");

onValue(serverRef, (snapshot) => {
  const data = snapshot.val() || {};
  const chaves = Object.keys(data);

  totalOnlineSpan.textContent = chaves.length;

  if (chaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888; padding: 20px;">Nenhum jogador online no momento.</td></tr>`;
    return;
  }

  tbody.innerHTML = chaves.map(id => {
    const p = data[id];
    const nome = p.nome || "Jogador Anônimo";
    const itens = (p.itens && p.itens.length > 0) ? p.itens.join(', ') : "Sem acessórios";
    const posX = p.x !== undefined ? p.x : 0;
    const posY = p.y !== undefined ? p.y : 0;
    const posZ = p.z !== undefined ? p.z : 0;

    return `
      <tr>
        <td><span class="badge-status status-online">ONLINE</span></td>
        <td><strong style="color: #63df70;">${nome}</strong></td>
        <td><small style="color: #cbd5e1;">${itens}</small></td>
        <td style="color: #64748b; font-size: 0.8rem;">${id}</td>
        <td style="font-size: 0.85rem; color: #94a3b8;">X: ${posX} | Y: ${posY} | Z: ${posZ}</td>
        <td>
          <button class="btn-kick" onclick="expulsarJogador('${id}', '${nome}')">Expulsar</button>
        </td>
      </tr>
    `;
  }).join('');
});

// --- FUNÇÃO 1: EXPULSAR JOGADOR (KICK) ---
window.expulsarJogador = function(clientId, nickJogador) {
  if (confirm(`Deseja realmente expulsar o jogador "${nickJogador}" do jogo?`)) {
    const playerRef = ref(db, `forest_players/${clientId}`);
    remove(playerRef)
      .then(() => mostrarToast(`Jogador ${nickJogador} expulso com sucesso!`, "success"))
      .catch(err => mostrarToast(`Erro ao expulsar: ${err.message}`, "danger"));
  }
};

// --- FUNÇÃO 2: REMOVER PLAYERS FANTASMAS (BUGADOS) ---
window.removerPlayersFantasmas = function() {
  if (confirm("Tem certeza que deseja remover todos os players da sala atual?")) {
    remove(ref(db, "forest_players"))
      .then(() => mostrarToast("Todos os jogadores bugados/fantasmas foram removidos!", "success"))
      .catch(err => mostrarToast(`Erro ao limpar sala: ${err.message}`, "danger"));
  }
};

// --- FUNÇÃO 3: DAR FBUX ---
window.adicionarFbux = function() {
  const nick = normalizeNick(document.getElementById("fbuxPlayerNick").value);
  const qtd = Number(document.getElementById("fbuxAmount").value);

  if (!nick || !Number.isFinite(qtd) || qtd <= 0) {
    mostrarToast("Preencha o Nick e uma quantidade válida de FBUX!", "warning");
    return;
  }

  const walletAtual = getWallet(nick, { fbux: 0, moedas: 0 });
  const novoTotal = Math.max(0, Math.floor(walletAtual.fbux + qtd));
  const novoWallet = {
    fbux: novoTotal,
    moedas: walletAtual.moedas
  };

  saveWallet(nick, novoWallet);

  update(ref(db, `users/${nick}`), {
    fbux: novoTotal,
    moedas: novoWallet.moedas
  }).catch(() => {});

  mostrarToast(`Adicionado ${qtd} FBUX para ${nick}! Total: ${novoTotal}`, "success");
  document.getElementById("fbuxAmount").value = "";
};

// --- FUNÇÃO 4: DAR MOEDAS ---
window.adicionarMoedas = function() {
  const nick = normalizeNick(document.getElementById("coinsPlayerNick").value);
  const qtd = Number(document.getElementById("coinsAmount").value);

  if (!nick || !Number.isFinite(qtd) || qtd <= 0) {
    mostrarToast("Preencha o Nick e uma quantidade válida de Moedas!", "warning");
    return;
  }

  const walletAtual = getWallet(nick, { fbux: 0, moedas: 0 });
  const novoTotal = Math.max(0, Math.floor(walletAtual.moedas + qtd));
  const novoWallet = {
    fbux: walletAtual.fbux,
    moedas: novoTotal
  };

  saveWallet(nick, novoWallet);

  update(ref(db, `users/${nick}`), {
    fbux: novoWallet.fbux,
    moedas: novoTotal
  }).catch(() => {});

  mostrarToast(`Adicionado ${qtd} Moedas para ${nick}! Total: ${novoTotal}`, "success");
  document.getElementById("coinsAmount").value = "";
};
