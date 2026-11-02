import { getCurrentNick } from "./authLocal.js";
import { db } from "./firebase.js";
import { ref, set, onDisconnect, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

export function iniciarClienteGoblox(onPlayersUpdate) {
  // 1. Pega o nick único do jogador logado nesta sessão
  const nickLocal = getCurrentNick() || localStorage.getItem("goblox_player_nick") || "Jogador_" + Math.floor(Math.random() * 1000);
  localStorage.setItem("goblox_player_nick", nickLocal);

  // 2. Gera um ID único para esta aba/conexão do jogador
  const clientId = "client_" + Math.random().toString(36).substring(2, 11);

  // 3. Referência no Firebase para este cliente específico
  const meuPlayerRef = ref(db, `forest_players/${clientId}`);
  onDisconnect(meuPlayerRef).remove();

  // 4. Pega os itens/skins equipados no localStorage deste jogador
  function getMeusItensEquipados() {
    try {
      return JSON.parse(localStorage.getItem(`goblox_equipados_${nickLocal}`)) || [];
    } catch (e) {
      return [];
    }
  }

  // 5. Função para enviar a posição, nick e skin atual para o Firebase
  function sincronizarPosicao(x, y, z) {
    set(meuPlayerRef, {
      id: clientId,
      nome: nickLocal,
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      z: Number(z.toFixed(2)),
      itens: getMeusItensEquipados()
    }).catch(() => {});
  }

  // 6. Ouve todos os jogadores conectados no servidor Firebase
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
