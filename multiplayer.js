import { db as database } from './firebase.js';
import {
  ref,
  set,
  onValue,
  onDisconnect,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { criarPersonagem } from './personagem.js';

export function iniciarMultiplayer({
  scene,
  roomKey = 'fps_sala_1',
  playerIdPrefix = 'player_fps',
  getLocalState,
  getPlayerColor = () => 0x7c3aed
}) {
  if (!scene || typeof getLocalState !== 'function') {
    throw new Error('iniciarMultiplayer precisa de scene e getLocalState.');
  }

  const outrosJogadores = new Map();
  const meuId = `${playerIdPrefix}_${Math.random().toString(36).slice(2, 9)}`;

  const playerRef = ref(database, `rooms/${roomKey}/players/${meuId}`);
  const playersRef = ref(database, `rooms/${roomKey}/players`);

  function removerJogadorLocal() {
    remove(playerRef).catch(() => {});
  }

  onDisconnect(playerRef).remove();
  window.addEventListener('beforeunload', removerJogadorLocal);
  window.addEventListener('pagehide', removerJogadorLocal);

  function sincronizarLocal() {
    const estado = getLocalState();

    if (!estado || typeof estado.x !== 'number') return;

    const payload = {
      x: Number(estado.x.toFixed(2)),
      y: Number(estado.y.toFixed(2)),
      z: Number(estado.z.toFixed(2)),
      rotY: Number((estado.rotY ?? 0).toFixed(2)),
      vida: Number((estado.vida ?? 100).toFixed(2)),
      atualizadoEm: Date.now()
    };

    set(playerRef, payload).catch(() => {});
  }

  onValue(playersRef, (snapshot) => {
    const data = snapshot.val() || {};

    for (const [id, entry] of outrosJogadores.entries()) {
      if (!data[id]) {
        if (entry.mesh) scene.remove(entry.mesh);
        outrosJogadores.delete(id);
      }
    }

    for (const [id, jogador] of Object.entries(data)) {
      if (id === meuId) continue;
      if (!jogador || typeof jogador.x !== 'number') continue;

      if (!outrosJogadores.has(id)) {
        const mesh = criarPersonagem(getPlayerColor(id));
        scene.add(mesh);
        outrosJogadores.set(id, {
          mesh,
          vida: jogador.vida || 100
        });
      }

      const estado = outrosJogadores.get(id);
      if (!estado || !estado.mesh) continue;

      estado.mesh.position.set(jogador.x, jogador.y, jogador.z);

      if (typeof jogador.rotY === 'number') {
        estado.mesh.rotation.y = jogador.rotY;
      }

      estado.vida = jogador.vida || 100;
    }
  });

  return {
    meuId,
    roomKey,
    sincronizarLocal,
    removerJogadorLocal,
    outrosJogadores
  };
}
