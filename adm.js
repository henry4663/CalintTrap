
// ============================================
// GOBLOX - PAINEL ADMINISTRATIVO
// ADM.JS
// ============================================

import {
  ref,
  onValue,
  remove,
  update,
  set
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import { db } from "./firebase.js";
import { getCurrentNick } from "./authLocal.js";
import { getWallet, saveWallet } from "./economia.js";

// ELEMENTOS
const toast = document.getElementById("toast");
const tbody = document.getElementById("listaJogadoresOnline");
const totalOnlineSpan = document.getElementById("totalOnline");

// ============================================
// NOTIFICAÇÕES
// ============================================

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

// ============================================
// PROTEÇÃO DO PAINEL
// ============================================

const nickAtual =
  getCurrentNick() ||
  localStorage.getItem("goblox_player_nick");

if (
  nickAtual !== "henryDEV777!" &&
  nickAtual !== "henryDEV777"
) {
  alert("Acesso negado! Apenas o administrador pode acessar.");

  window.location.replace("lobby.html");

} else {

// ============================================
// BANIMENTO
// ============================================

window.aplicarBan = async function () {

  const nick = normalizeNick(
    document.getElementById("banPlayerNick").value
  );

  const motivo =
    document.getElementById("banMotivo").value.trim() ||
    "Violação das regras do jogo.";

  const tipo = document.getElementById("banTipo").value;

  const minutos = Number(
    document.getElementById("banTempoMinutos").value
  );

  if (!nick) {
    mostrarToast("Digite o nick do jogador!", "warning");
    return;
  }

  let expiraEm = null;

  if (tipo === "temporario") {

    if (!Number.isFinite(minutos) || minutos <= 0) {
      mostrarToast("Digite um tempo válido!", "warning");
      return;
    }

    expiraEm = Date.now() + minutos * 60000;
  }

  try {

    await set(ref(db, `bans/${nick}`), {
      motivo,
      tipo,
      expiraEm,
      dataBan: Date.now()
    });

    mostrarToast(`Jogador ${nick} banido!`, "success");

    document.getElementById("banPlayerNick").value = "";
    document.getElementById("banMotivo").value = "";

  } catch (err) {
    mostrarToast("Erro ao banir: " + err.message, "danger");
  }
};

// ============================================
// DESBANIR
// ============================================

window.removerBan = async function () {

  const nick = normalizeNick(
    document.getElementById("banPlayerNick").value
  );

  if (!nick) {
    mostrarToast("Digite o nick para desbanir!", "warning");
    return;
  }

  try {

    await remove(ref(db, `bans/${nick}`));

    mostrarToast(`${nick} foi desbanido!`, "success");

    document.getElementById("banPlayerNick").value = "";

  } catch (err) {
    mostrarToast("Erro ao desbanir: " + err.message, "danger");
  }
};

// ============================================
// JOGADORES ONLINE
// ============================================

const serverRef = ref(db, "forest_players");

onValue(serverRef, (snapshot) => {

  const data = snapshot.val() || {};
  const jogadores = Object.entries(data);

  if (totalOnlineSpan) {
    totalOnlineSpan.textContent = jogadores.length;
  }

  if (!tbody) return;

  if (jogadores.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:20px;color:#888">
          Nenhum jogador online.
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = jogadores.map(([id, p]) => {

    const nome = p.nome || "Jogador Anônimo";

    const itens = Array.isArray(p.itens)
      ? p.itens.join(", ")
      : "Sem acessórios";

    const posX = p.x ?? 0;
    const posY = p.y ?? 0;
    const posZ = p.z ?? 0;

    // Evita inserir HTML fornecido diretamente pelo jogador.
    const seguro = valor => String(valor).replace(
      /[&<>"']/g,
      caractere => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[caractere]
    );

    return `
      <tr>
        <td>
          <span class="badge-status status-online">ONLINE</span>
        </td>

        <td>
          <strong style="color:#63df70">
            ${seguro(nome)}
          </strong>
        </td>

        <td>
          <small>${seguro(itens)}</small>
        </td>

        <td>${seguro(id)}</td>

        <td>
          X: ${seguro(posX)} |
          Y: ${seguro(posY)} |
          Z: ${seguro(posZ)}
        </td>

        <td>
          <button
            class="btn-kick"
            onclick="expulsarJogador('${seguro(id)}', '${seguro(nome)}')">
            Expulsar
          </button>
        </td>
      </tr>
    `;

  }).join("");

});

// ============================================
// EXPULSAR JOGADOR
// ============================================

window.expulsarJogador = async function (clientId, nick) {

  if (!confirm(`Deseja expulsar ${nick}?`)) return;

  try {

    await remove(ref(db, `forest_players/${clientId}`));

    mostrarToast(`${nick} foi removido!`, "success");

  } catch (err) {
    mostrarToast("Erro ao expulsar: " + err.message, "danger");
  }
};

// ============================================
// LIMPAR JOGADORES FANTASMAS
// ============================================

window.removerPlayersFantasmas = async function () {

  if (!confirm("Deseja limpar TODOS os registros de forest_players?")) {
    return;
  }

  try {

    await remove(ref(db, "forest_players"));

    mostrarToast("Registros removidos!", "success");

  } catch (err) {
    mostrarToast("Erro: " + err.message, "danger");
  }
};

// ============================================
// DAR FBUX
// ============================================

window.adicionarFbux = async function () {

  const nick = normalizeNick(
    document.getElementById("fbuxPlayerNick").value
  );

  const qtd = Number(
    document.getElementById("fbuxAmount").value
  );

  if (!nick || !Number.isSafeInteger(qtd) || qtd <= 0) {
    mostrarToast("Nick ou quantidade inválida!", "warning");
    return;
  }

  try {

    const walletAtual = getWallet(nick, {
      fbux: 0,
      moedas: 0
    });

    const novoTotal = walletAtual.fbux + qtd;

    if (!Number.isSafeInteger(novoTotal)) {
      mostrarToast("Quantidade excede o limite!", "warning");
      return;
    }

    const novoWallet = {
      fbux: novoTotal,
      moedas: walletAtual.moedas
    };

    saveWallet(nick, novoWallet);

    await update(ref(db, `users/${nick}`), novoWallet);

    mostrarToast(
      `${qtd} FBUX enviados para ${nick}! Total: ${novoTotal}`,
      "success"
    );

    document.getElementById("fbuxAmount").value = "";

  } catch (err) {
    mostrarToast("Erro ao enviar FBUX: " + err.message, "danger");
  }
};

// ============================================
// DAR MOEDAS
// ============================================

window.adicionarMoedas = async function () {

  const nick = normalizeNick(
    document.getElementById("coinsPlayerNick").value
  );

  const qtd = Number(
    document.getElementById("coinsAmount").value
  );

  if (!nick || !Number.isSafeInteger(qtd) || qtd <= 0) {
    mostrarToast("Nick ou quantidade inválida!", "warning");
    return;
  }

  try {

    const walletAtual = getWallet(nick, {
      fbux: 0,
      moedas: 0
    });

    const novoTotal = walletAtual.moedas + qtd;

    if (!Number.isSafeInteger(novoTotal)) {
      mostrarToast("Quantidade excede o limite!", "warning");
      return;
    }

    const novoWallet = {
      fbux: walletAtual.fbux,
      moedas: novoTotal
    };

    saveWallet(nick, novoWallet);

    await update(ref(db, `users/${nick}`), novoWallet);

    mostrarToast(
      `${qtd} moedas enviadas para ${nick}! Total: ${novoTotal}`,
      "success"
    );

    document.getElementById("coinsAmount").value = "";

  } catch (err) {
    mostrarToast("Erro ao enviar moedas: " + err.message, "danger");
  }
};

} // FIM DA PROTEÇÃO DO PAINEL

