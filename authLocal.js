const ACCOUNTS_KEY = "goblox_accounts";
const SESSION_KEY = "goblox_session";

function normalizeNick(nick) {
  return String(nick || "").trim().toLowerCase();
}

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

export function loginAccount(nick, password) {
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

export function getCurrentNick() {
  const session = getSession();
  return session ? session.nick : null;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
  if (window.location) {
    window.location.href = "lock.html";
  }
}
