
import { db } from "./firebase.js";
import { ref, update, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Retorna os itens equipados localmente pelo jogador
export function getItensEquipadosLocal() {
  const nick = localStorage.getItem("goblox_player_nick") || "Jogador";
  const keyEquipados = `goblox_equipados_${nick}`;
  try {
    return JSON.parse(localStorage.getItem(keyEquipados)) || [];
  } catch (e) {
    return [];
  }
}

// Salva e sincroniza os itens equipados no localStorage e no Firebase
export async function salvarEquipamento(playerId, novosItens) {
  const nick = localStorage.getItem("goblox_player_nick") || "Jogador";
  const keyEquipados = `goblox_equipados_${nick}`;
  
  // 1. Salva localmente
  localStorage.setItem(keyEquipados, JSON.stringify(novosItens));

  // 2. Envia para o Firebase na conta do jogador
  if (playerId) {
    try {
      const userRef = ref(db, `users/${nick}`);
      await update(userRef, { itensEquipados: novosItens });
    } catch (err) {
      console.error("Erro ao sincronizar skin no Firebase:", err);
    }
  }
}
