
import { db } from "./firebase.js";

import {
  ref,
  get,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const ACCOUNTS_KEY = "goblox_accounts";
const SESSION_KEY = "goblox_session";
const PLAYER_NICK_KEY = "goblox_player_nick";

function normalizeNick(nick) {
  return String(nick || "").trim().toLowerCase();
}

// ============================================
// CONTAS
// ============================================

export function getAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

// ============================================
// VERIFICAR BANIMENTO
// ============================================

export async function verificarBan(nick) {
  const cleanNick = String(nick || "").trim();
  const key = normalizeNick(cleanNick);

  try {
    // Primeiro procura pelo nick normalizado.
    let banRef = ref(db, `bans/${key}`);
    let snapshot = await get(banRef);

    // Compatibilidade com banimentos antigos
    // que foram salvos com letras maiúsculas.
    if (!snapshot.exists() && cleanNick !== key) {
      banRef = ref(db, `bans/${cleanNick}`);
      snapshot = await get(banRef);
    }

    if (!snapshot.exists()) {
      return null;
    }

    const ban = snapshot.val();

    // Verificar ban temporário
    if (
      ban.tipo === "temporario" &&
      Number(ban.expiraEm) > 0 &&
      Date.now() >= Number(ban.expiraEm)
    ) {
      await remove(banRef);
      return null;
    }

    return {
      motivo: ban.motivo || "Violação das regras.",
      tipo: ban.tipo || "permanente",
      expiraEm: ban.expiraEm || null
    };

  } catch (error) {
    console.error("Erro ao verificar banimento:", error);

    throw new Error(
      "Não foi possível verificar os banimentos. Tente novamente."
    );
  }
}

// ============================================
// CADASTRO
// ============================================

export function createAccount(nick, password) {
  const cleanNick = String(nick || "").trim();

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanNick)) {
    throw new Error("Nick inválido. Use 3 a 20 letras, números ou _.");
  }

  if (String(password || "").length < 6) {
    throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  }

  const accounts = getAccounts();
  const key = normalizeNick(cleanNick);

  if (accounts[key]) {
    throw new Error("Este nick já existe.");
  }

  accounts[key] = {
    nick: cleanNick,
    password: String(password),
    createdAt: Date.now()
  };

  saveAccounts(accounts);
  setSession(cleanNick);

  return { nick: cleanNick };
}

// ============================================
// LOGIN COM VERIFICAÇÃO DE BAN
// ============================================

export async function loginAccount(nick, password) {
  const cleanNick = String(nick || "").trim();
  const key = normalizeNick(cleanNick);

  const accounts = getAccounts();
  const account = accounts[key];

  if (!account) {
    throw new Error("Nick não encontrado.");
  }

  if (account.password !== String(password)) {
    throw new Error("Senha incorreta.");
  }

  // CONSULTA O FIREBASE ANTES DE ENTRAR
  const ban = await verificarBan(cleanNick);

  if (ban) {
    if (ban.tipo === "temporario") {
      const restante = Math.max(
        1,
        Math.ceil((ban.expiraEm - Date.now()) / 60000)
      );

      throw new Error(
        `VOCÊ ESTÁ BANIDO! Motivo: ${ban.motivo}. Tempo restante: ${restante} minutos.`
      );
    }

    throw new Error(
      `VOCÊ ESTÁ BANIDO PERMANENTEMENTE! Motivo: ${ban.motivo}`
    );
  }

  setSession(cleanNick);

  return { nick: cleanNick };
}

// ============================================
// SESSÃO
// ============================================

export function setSession(nick) {
  const safeNick = String(nick).trim();

  localStorage.setItem(SESSION_KEY, JSON.stringify({
    nick: safeNick,
    loggedAt: Date.now()
  }));

  localStorage.setItem(PLAYER_NICK_KEY, safeNick);
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PLAYER_NICK_KEY);
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);

  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getCurrentNick() {
  const session = getSession();

  return session
    ? session.nick
    : localStorage.getItem(PLAYER_NICK_KEY) || null;
}

// ============================================
// SAIR
// ============================================

export function logout() {
  clearSession();

  if (window.location) {
    window.location.replace("lock.html");
  }
}
