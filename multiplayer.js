// multiplayer.js
import { database } from './firebase.js'; // Ajuste o caminho se necessário para o seu firebase.js
import { ref, set, onValue, remove, onDisconnect } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { criarPersonagem } from './personagem.js';

export function iniciarMultiplayer(scene, playerLocalId) {
    const outrosJogadores = {};
    const meuId = 'player_' + Math.random().toString(36).substr(2, 9);
    
    // Referência para a sala de jogo no Firebase
    const jogadorRef = ref(database, 'jogadores/' + meuId);
    const todosJogadoresRef = ref(database, 'jogadores');

    // Define que ao desconectar (fechar a aba), o jogador some do servidor
    set(jogadorRef, { x: 0, y: 0.5, z: 0 });
    onDisconnect(jogadorRef).remove();

    // Função para atualizar a nossa posição no Firebase
    function atualizarPosicao(x, y, z) {
        set(jogadorRef, { x, y, z });
    }

    // Fica escutando os outros jogadores em tempo real
    onValue(todosJogadoresRef, (snapshot) => {
        const data = snapshot.val() || {};

        // Remove jogadores que saíram
        for (let id in outrosJogadores) {
            if (!data[id]) {
                scene.remove(outrosJogadores[id].mesh);
                delete outrosJogadores[id];
            }
        }

        // Atualiza ou cria os outros jogadores
        for (let id in data) {
            if (id === meuId) continue; // Ignora a si mesmo

            let pos = data[id];

            if (!outrosJogadores[id]) {
                // Cria o boneco do outro jogador usando a tua função de personagem
                const meshOutro = criarPersonagem();
                scene.add(meshOutro);
                outrosJogadores[id] = { mesh: meshOutro };
            }

            // Atualiza a posição do outro jogador na tela
            outrosJogadores[id].mesh.position.set(pos.x, pos.y, pos.z);
        }
    });

    return { atualizarPosicao };
}
