import { db, ref, get, set } from "./firebase.js";
import { getCurrentNick } from "./authLocal.js";

const nick = getCurrentNick();
const $ = id => document.getElementById(id);
const keyOf = name => encodeURIComponent(String(name).trim().toLowerCase()).replace(/\./g, "%2E");
const myKey = keyOf(nick || "");
const avatarDefault = name => "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(name);

function make(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
async function playerInfo(username) {
  const snap = await get(ref(db, "profiles/" + keyOf(username)));
  const data = snap.exists() ? snap.val() : {};
  const ban = data.ban;
  const suspended = Boolean(ban?.active && (ban.permanent || Number(ban.until) > Date.now()));
  let avatar = avatarDefault(username);
  try {
    const url = new URL(data.avatarUrl || "");
    if (url.protocol === "https:" || url.protocol === "http:") avatar = url.href;
  } catch {}
  return { username, displayName: String(data.displayName || username), avatar, suspended, ban };
}
function makePlayerCard(player, action) {
  const card = make("div", "flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-gray-50");
  const img = make("img", "w-12 h-12 rounded-full object-cover bg-gray-200");
  img.src = player.avatar; img.alt = "Avatar";
  const info = make("div", "min-w-0 flex-1");
  info.append(make("p", "font-bold text-gray-900 truncate", player.displayName));
  info.append(make("p", "text-xs text-gray-500 truncate", "@" + player.username));
  if (player.suspended) {
    const badge = make("span", "inline-block mt-1 text-[10px] font-black tracking-wide rounded-md px-2 py-1 bg-red-100 text-red-700", "⛔ CONTA SUSPENSA");
    info.append(badge);
  }
  const link = make("a", "text-xs font-semibold text-red-600 hover:underline", "Ver perfil");
  link.href = "perfil.html?user=" + encodeURIComponent(player.username);
  info.append(link);
  card.append(img, info);
  const actions = make("div", "flex flex-col gap-2");
  if (action) actions.append(action);
  card.append(actions);
  return card;
}
function actionButton(label, action, username) {
  const button = make("button", "text-xs font-bold rounded-lg px-3 py-2 bg-red-600 hover:bg-red-700 text-white whitespace-nowrap", label);
  button.type = "button";
  button.dataset.friendAction = action;
  button.dataset.friendUser = username;
  return button;
}
function showMessage(box, message) {
  box.replaceChildren(make("p", "text-sm text-gray-500", message));
}
async function acceptRequest(username) {
  const otherKey = keyOf(username);
  const requestRef = ref(db, "friendRequests/" + myKey + "/" + otherKey);
  const request = await get(requestRef);
  if (!request.exists()) throw new Error("Essa solicitação não está mais disponível.");
  const now = Date.now();
  await Promise.all([
    set(ref(db, "friends/" + myKey + "/" + otherKey), { username, since: now }),
    set(ref(db, "friends/" + otherKey + "/" + myKey), { username: nick, since: now }),
    set(requestRef, null),
    set(ref(db, "friendRequests/" + otherKey + "/" + myKey), null)
  ]);
}
async function refreshLists() {
  const incomingBox = $("friend-incoming");
  const friendsBox = $("friend-list");
  try {
    const [incomingSnap, friendsSnap] = await Promise.all([
      get(ref(db, "friendRequests/" + myKey)),
      get(ref(db, "friends/" + myKey))
    ]);
    const incoming = incomingSnap.exists() ? incomingSnap.val() : {};
    const friends = friendsSnap.exists() ? friendsSnap.val() : {};
    incomingBox.replaceChildren();
    friendsBox.replaceChildren();
    for (const [key, request] of Object.entries(incoming)) {
      const username = request.username || key;
      const player = await playerInfo(username);
      incomingBox.append(makePlayerCard(player, actionButton("Aceitar", "accept", username)));
    }
    for (const [key, data] of Object.entries(friends)) {
      const username = data.username || key;
      friendsBox.append(makePlayerCard(await playerInfo(username), make("span", "text-xs font-bold text-green-700", "Amigo")));
    }
    if (!incomingBox.children.length) showMessage(incomingBox, "Nenhuma solicitação recebida.");
    if (!friendsBox.children.length) showMessage(friendsBox, "Você ainda não tem amigos adicionados.");
  } catch (error) {
    console.error(error);
    showMessage(incomingBox, "Não foi possível carregar solicitações. Confira as regras do Firebase.");
    showMessage(friendsBox, "Não foi possível carregar amigos.");
  }
}
async function searchPlayers() {
  const term = $("friend-search").value.trim().toLowerCase();
  const results = $("friend-search-results");
  const status = $("friend-search-status");
  results.replaceChildren();
  if (term.length < 2) { status.textContent = "Digite pelo menos 2 caracteres."; return; }
  status.textContent = "Procurando jogadores...";
  try {
    const snap = await get(ref(db, "users"));
    const users = snap.exists() ? snap.val() : {};
    const matches = Object.keys(users).filter(name => name.toLowerCase().includes(term) && name.toLowerCase() !== nick.toLowerCase()).slice(0, 20);
    if (!matches.length) { status.textContent = "Nenhum jogador encontrado com esse nome."; return; }
    for (const username of matches) {
      const targetKey = keyOf(username);
      const [friendSnap, sentSnap, receivedSnap] = await Promise.all([
        get(ref(db, "friends/" + myKey + "/" + targetKey)),
        get(ref(db, "friendRequests/" + myKey + "/" + targetKey)),
        get(ref(db, "friendRequests/" + targetKey + "/" + myKey))
      ]);
      let action;
      if (friendSnap.exists()) action = make("span", "text-xs font-bold text-green-700", "Já é amigo");
      else if (sentSnap.exists()) action = make("span", "text-xs text-gray-500", "Enviado");
      else if (receivedSnap.exists()) action = actionButton("Aceitar", "accept", username);
      else action = actionButton("Adicionar", "send", username);
      results.append(makePlayerCard(await playerInfo(username), action));
    }
    status.textContent = matches.length + " jogador(es) encontrado(s).";
  } catch (error) {
    console.error(error);
    status.textContent = "Erro ao consultar o Firebase. Confira as regras do banco.";
  }
}
export function initFriendsTab() {
  if (!nick || !$("friends-panel")) return;
  const panel = $("friends-panel");
  const games = $("games-grid").closest("section");
  const banner = document.querySelector("main > div.bg-gradient-to-r");
  $("friends-tab").addEventListener("click", () => {
    panel.classList.remove("hidden"); games.classList.add("hidden"); banner?.classList.add("hidden"); refreshLists();
  });
  const home = document.querySelector("aside nav a");
  home?.addEventListener("click", () => { panel.classList.add("hidden"); games.classList.remove("hidden"); banner?.classList.remove("hidden"); });
  $("friend-search-btn").addEventListener("click", searchPlayers);
  $("friend-search").addEventListener("keydown", event => { if (event.key === "Enter") searchPlayers(); });
  $("friend-search-results").addEventListener("click", async event => {
    const button = event.target.closest("button[data-friend-action]");
    if (!button) return;
    const username = button.dataset.friendUser;
    button.disabled = true;
    try {
      if (button.dataset.friendAction === "accept") {
        await acceptRequest(username);
        await searchPlayers();
        await refreshLists();
      } else {
        const account = await get(ref(db, "users/" + username));
        if (!account.exists()) throw new Error("Essa conta não existe mais.");
        const existing = await get(ref(db, "friends/" + myKey + "/" + keyOf(username)));
        if (existing.exists()) throw new Error("Vocês já são amigos.");
        await set(ref(db, "friendRequests/" + keyOf(username) + "/" + myKey), {
          username: nick, createdAt: Date.now(), status: "pending"
        });
        button.textContent = "Enviado";
      }
    } catch (error) {
      console.error(error); alert(error.message || "Não foi possível concluir.");
      button.disabled = false;
    }
  });
  $("friend-incoming").addEventListener("click", async event => {
    const button = event.target.closest("button[data-friend-action='accept']");
    if (!button) return;
    button.disabled = true;
    try { await acceptRequest(button.dataset.friendUser); await refreshLists(); }
    catch (error) { alert(error.message || "Erro ao aceitar solicitação."); button.disabled = false; }
  });
}
