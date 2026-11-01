// multiplayer.js
import { db as database } from './firebase.js'; // Usa o 'db' exportado pelo teu firebase.js
import { ref, set, onValue, onDisconnect } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { criarPersonagem } from './personagem.js';

export function iniciarMultiplayer(scene) {
    const outrosJogadores = {};
    const meuId = 'player_' + Math.random().toString(36).substr(2, 9);
    
    // Referência limpa para a sala de jogo no Firebase
    const jogadorRef = ref(database, 'jogadores/' + meuId);
    const todosJogadoresRef = ref(database, 'jogadores');

    // Define posição inicial segura
    set(jogadorRef, { x: 0, y: 0.5, z: 0 }).catch(err => console.error("Erro ao iniciar posição:", err));
    onDisconnect(jogadorRef).remove();

    // Função ultra-protegida para atualizar a posição (evita qualquer objeto complexo)
    function atualizarPosicao(x, y, z) {
        // Converte explicitamente para números primitivos para o Firebase nunca crashar
        const posX = Number(x) || 0;
        const posY = Number(y) || 0;
        const posZ = Number(z) || 0;

        set(jogadorRef, {
            x: posX,
            y: posY,
            z: posZ
        }).catch(err => {
            // Silencia ou loga erros pontuais de rede para não travar o loop do jogo
        });
    }

    // Escuta os outros jogadores em tempo real
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
                const meshOutro = criarPersonagem();
                scene.add(meshOutro);
                outrosJogadores[id] = { mesh: meshOutro };
            }

            // Atualiza a posição do outro jogador na tela de forma segura
            if (pos && typeof pos.x === 'number') {
                outrosJogadores[id].mesh.position.set(pos.x, pos.y, pos.z);
            }
        }
    });

    return { atualizarPosicao };
}
