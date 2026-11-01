const ACCOUNTS_KEY = "goblox_accounts";
const SESSION_KEY = "goblox_session";

function normalizeNick(nick) {
  return String(nick || "").trim().toLowerCase();
}

function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 250000,
      hash: "SHA-256"
    },
    keyMaterial,
    256
  );

  return Array.from(new Uint8Array(bits));
}

export async function createAccount(nick, password) {
  const cleanNick = String(nick || "").trim();

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanNick)) {
    throw new Error("Nick inválido. Use 3 a 20 letras, números ou _.");
  }

  if (String(password || "").length < 6) {
    throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  }

  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  const key = normalizeNick(cleanNick);

  if (accounts[key]) {
    throw new Error("Este nick já existe.");
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  accounts[key] = {
    nick: cleanNick,
    passwordHash: passwordHash,
    salt: Array.from(salt),
    createdAt: Date.now()
  };

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  setSession(cleanNick);

  return { nick: cleanNick };
}

export async function loginAccount(nick, password) {
  const cleanNick = String(nick || "").trim();
  const key = normalizeNick(cleanNick);

  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  const account = accounts[key];

  if (!account) {
    throw new Error("Nick não encontrado.");
  }

  const salt = new Uint8Array(account.salt);
  const passwordHash = await hashPassword(password, salt);
  const currentHash = Array.from(passwordHash);

  if (JSON.stringify(currentHash) !== JSON.stringify(account.passwordHash)) {
    throw new Error("Senha incorreta.");
  }

  setSession(cleanNick);
  return { nick: cleanNick };
}

export function setSession(nick) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    nick: String(nick).trim(),
    loggedAt: Date.now()
  }));
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

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "lock.html";
}

export function getCurrentNick() {
  const session = getSession();
  return session ? session.nick : null;
}
