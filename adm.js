import { db } from "./firebase.js";
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getCurrentNick } from "./authLocal.js";

const toast = document.getElementById("toast");
const tbody = document.getElementById("listaJogadoresOnline");

function mostrarToast(msg, tipo = "info") {
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${tipo}`;
  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => { toast.className = "toast"; }, 2500);
}

// --- VERIFICAÇÃO DE ADMINISTRADOR ---
const nickAtual = getCurrentNick() || localStorage.getItem("goblox_player_nick");

// Se não estiver logado ou o nick não for o autorizado, bloqueia e manda para o lobby
if (nickAtual !== "henryDEV777") {
  alert("Acesso negado! Apenas o administrador henryDEV777 pode aceder a este painel.");
  window.location.href = "lobby.html";
}
// ------------------------------------

// Ouve os jogadores conectados na sala do Parkour
const serverRef = ref(db, "parkour_jogadores");

onValue(serverRef, (snapshot) => {
  const data = snapshot.val() || {};
  
  const chaves = Object.keys(data);
  if (chaves.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">Nenhum jogador online no momento.</td></tr>`;
    return;
  }

  tbody.innerHTML = chaves.map(id => {
    const p = data[id];
    const nome = p.nome || "Jogador Anónimo";
    const posX = p.x !== undefined ? p.x : 0;
    const posY = p.y !== undefined ? p.y : 0;
    const posZ = p.z !== undefined ? p.z : 0;

    return `
      <tr>
        <td><span class="badge-online">ONLINE</span></td>
        <td><strong>${nome}</strong></td>
        <td style="color: #94a3b8; font-size: 0.85rem;">${id}</td>
        <td>X: ${posX} | Y: ${posY} | Z: ${posZ}</td>
        <td>
          <button class="btn-kick" onclick="expulsarJogador('${id}', '${nome}')">Expulsar</button>
        </td>
      </tr>
    `;
  }).join('');
});

// Função global para expulsar o jogador
window.expulsarJogador = function(idSessao, nomeJogador) {
  if (confirm(`Tens a certeza que queres expulsar o jogador ${nomeJogador}?`)) {
    const jogadorRef = ref(db, `parkour_jogadores/${idSessao}`);
    remove(jogadorRef)
      .then(() => {
        mostrarToast(`Jogador ${nomeJogador} foi expulso com sucesso!`, "success");
      })
      .catch((err) => {
        mostrarToast(`Erro ao expulsar: ${err.message}`, "danger");
      });
  }
};
