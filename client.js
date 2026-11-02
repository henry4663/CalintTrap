import { getCurrentNick } from "./authLocal.js";
import { db } from "./firebase.js";
import { ref, set, onDisconnect, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

export function iniciarClienteGoblox(onPlayersUpdate) {
  const nickLocal = getCurrentNick() || localStorage.getItem("goblox_player_nick") || "Jogador_" + Math.floor(Math.random() * 1000);
  localStorage.setItem("goblox_player_nick", nickLocal);

  // --- VERIFICAÇÃO AUTOMÁTICA DE BANIMENTO ---
  const banRef = ref(db, `bans/${nickLocal}`);
  onValue(banRef, (snapshot) => {
    if (snapshot.exists()) {
      // Jogador foi banido! Redireciona para a tela de ban
      window.location.href = "screenban.html";
    }
  });
  // ------------------------------------------

  const clientId = "client_" + Math.random().toString(36).substring(2, 11);
  const meuPlayerRef = ref(db, `forest_players/${clientId}`);
  onDisconnect(meuPlayerRef).remove();

  function getMeusItensEquipados() {
    try {
      return JSON.parse(localStorage.getItem(`goblox_equipados_${nickLocal}`)) || [];
    } catch (e) {
      return [];
    }
  }

  function sincronizarPosicao(x, y, z, rotY, movendo) {
    set(meuPlayerRef, {
      id: clientId,
      nome: nickLocal,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      z: Number(z.toFixed(2)),
      rotY: Number(rotY.toFixed(2)),
      movendo: !!movendo,
      itens: getMeusItensEquipados()
    }).catch(() => {});
  }

  const allPlayersRef = ref(db, "forest_players");
  onValue(allPlayersRef, (snapshot) => {
    const data = snapshot.val() || {};
    if (onPlayersUpdate) {
      onPlayersUpdate(clientId, data);
    }
  });

  return {
    clientId,
    nickLocal,
    sincronizarPosicao,
    removerDoServidor: () => set(meuPlayerRef, null)
  };
}
