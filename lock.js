

"use strict";

const ACCOUNTS_KEY = "goblox_accounts";
const SESSION_KEY = "goblox_session";

const $ = id => document.getElementById(id);

const games = [
  {title:"Speed Run Arena",creator:"goblox",players:"12.4k",color:"from-sky-500 to-blue-600"},
  {title:"Zombie Escape",creator:"goblox",players:"8.1k",color:"from-emerald-600 to-teal-800"},
  {title:"Pet Paradise",creator:"goblox",players:"25.9k",color:"from-cyan-400 to-blue-500"},
  {title:"City Builder Tycoon",creator:"goblox",players:"5.3k",color:"from-amber-500 to-orange-600"}
];

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function normalizeUsername(name) {
  return String(name || "").trim().toLowerCase();
}

function showMessage(message, success = false) {
  const box = $("auth-message");
  box.textContent = message;
  box.className = "mb-4 rounded-xl p-3 text-sm " +
    (success ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300");
}

function clearMessage() {
  $("auth-message").className = "hidden";
}

function showLoginForm() {
  clearMessage();
  $("signup-form").classList.add("hidden");
  $("login-form").classList.remove("hidden");
}

function showSignupForm() {
  clearMessage();
  $("login-form").classList.add("hidden");
  $("signup-form").classList.remove("hidden");
}

async function hashPassword(password, saltHex) {
  if (!crypto.subtle) {
    throw new Error("Abra o site em HTTPS ou localhost.");
  }

  const salt = saltHex
    ? Uint8Array.from(saltHex.match(/.{1,2}/g).map(x => parseInt(x,16)))
    : crypto.getRandomValues(new Uint8Array(16));

  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password),
    "PBKDF2", false, ["deriveBits"]
  );

  const bits = await crypto.subtle.deriveBits({
    name:"PBKDF2",
    salt,
    iterations:120000,
    hash:"SHA-256"
  },key,256);

  const hash = Array.from(new Uint8Array(bits))
    .map(x => x.toString(16).padStart(2,"0")).join("");

  return {
    salt:Array.from(salt).map(x => x.toString(16).padStart(2,"0")).join(""),
    hash
  };
}

async function handleSignup(e) {
  e.preventDefault();
  clearMessage();

  const username = $("signup-username").value.trim();
  const password = $("signup-password").value;
  const confirm = $("signup-password-confirm").value;
  const key = normalizeUsername(username);

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return showMessage("Nome inválido. Use letras, números ou _.");
  }

  if (password.length < 6) {
    return showMessage("A senha precisa ter 6 caracteres.");
  }

  if (password !== confirm) {
    return showMessage("As senhas não coincidem.");
  }

  const accounts = readAccounts();

  if (accounts[key]) {
    return showMessage("Esse usuário já existe.");
  }

  try {
    const credentials = await hashPassword(password);

    accounts[key] = {
      username,
      salt:credentials.salt,
      passwordHash:credentials.hash,
      createdAt:new Date().toISOString()
    };

    localStorage.setItem(ACCOUNTS_KEY,JSON.stringify(accounts));
    localStorage.setItem(SESSION_KEY,key);

    $("signup-form").reset();
    enterPlatform(username);
  } catch (error) {
    showMessage(error.message);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  clearMessage();

  const key = normalizeUsername($("login-username").value);
  const password = $("login-password").value;
  const account = readAccounts()[key];

  if (!account) {
    return showMessage("Usuário ou senha incorretos.");
  }

  try {
    const credentials = await hashPassword(password,account.salt);

    if (credentials.hash !== account.passwordHash) {
      return showMessage("Usuário ou senha incorretos.");
    }

    localStorage.setItem(SESSION_KEY,key);
    $("login-form").reset();
    enterPlatform(account.username);
  } catch (error) {
    showMessage(error.message);
  }
}

function enterPlatform(username) {
  $("auth-screen").classList.add("hidden");
  $("main-app").classList.remove("hidden");

  $("display-username").textContent = username;
  $("welcome-title").textContent = `Bem-vindo, ${username}!`;

  renderGames();
}

function handleLogout() {
  localStorage.removeItem(SESSION_KEY);
  $("main-app").classList.add("hidden");
  $("auth-screen").classList.remove("hidden");
  showLoginForm();
}

function renderGames(filter = "") {
  const grid = $("games-grid");
  grid.innerHTML = "";

  const filtered = games.filter(game =>
    game.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (!filtered.length) {
    grid.textContent = "Nenhum jogo encontrado.";
    return;
  }

  filtered.forEach(game => {
    const card = document.createElement("article");
    card.className = "overflow-hidden rounded-xl border bg-white shadow";

    const cover = document.createElement("div");
    cover.className = `h-36 bg-gradient-to-br ${game.color} flex items-end p-4 text-xl font-black text-white`;
    cover.textContent = game.title;

    const details = document.createElement("div");
    details.className = "p-4";

    const creator = document.createElement("p");
    creator.className = "text-sm text-slate-500";
    creator.textContent = "Criado por " + game.creator;

    const players = document.createElement("p");
    players.className = "mt-2 text-xs text-slate-500";
    players.textContent = game.players + " jogadores";

    const button = document.createElement("button");
    button.className = "mt-4 w-full rounded-lg bg-red-600 p-3 font-bold text-white";
    button.textContent = "Jogar";
    button.addEventListener("click", () => {
      alert("O sistema de entrada no jogo ainda precisa ser conectado.");
    });

    details.append(creator,players,button);
    card.append(cover,details);
    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded",() => {
  $("login-form").addEventListener("submit",handleLogin);
  $("signup-form").addEventListener("submit",handleSignup);

  $("show-signup").addEventListener("click",showSignupForm);
  $("show-login").addEventListener("click",showLoginForm);
  $("logout-button").addEventListener("click",handleLogout);

  $("search-input").addEventListener("input",e => {
    renderGames(e.target.value);
  });

  const session = localStorage.getItem(SESSION_KEY);
  const account = session ? readAccounts()[session] : null;

  if (account) {
    enterPlatform(account.username);
  } else {
    localStorage.removeItem(SESSION_KEY);
    showLoginForm();
  }
});
