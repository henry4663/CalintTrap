import { db, ref, set, get, toast } from "./firebase.js";

const $ = id => document.getElementById(id);

/* Se já está logado, vai direto pro lobby */
if (localStorage.getItem("goblox_user")) {
  location.href = "lobby.html";
}

async function registrar() {
  const u = $("inUser").value.trim();
  const p = $("inPass").value;
  const m = $("msgLogin");

  if (!u || u.length < 3) { m.textContent = "Usuário precisa ter 3+ caracteres"; return; }
  if (p.length < 4) { m.textContent = "Senha precisa ter 4+ caracteres"; return; }

  const snap = await get(ref(db, "users/" + u));
  if (snap.exists()) { m.textContent = "Esse usuário já existe"; return; }

  await set(ref(db, "users/" + u), {
    pass: p,
    criado: Date.now(),
    bio: "",
    avatar: "",
    jogos: 0,
    vitorias: 0,
    nivel: 1
  });

  m.style.color = "var(--success)";
  m.textContent = "Conta criada! Faça login.";
  toast("Conta criada com sucesso!", "success");
}

async function login() {
  const u = $("inUser").value.trim();
  const p = $("inPass").value;
  const m = $("msgLogin");

  const snap = await get(ref(db, "users/" + u));
  if (!snap.exists() || snap.val().pass !== p) {
    m.style.color = "var(--danger)";
    m.textContent = "Usuário ou senha incorretos";
    return;
  }

  localStorage.setItem("goblox_user", u);
  toast("Bem-vindo, " + u + "!", "success");
  setTimeout(() => location.href = "lobby.html", 600);
}

$("btnLogin").onclick = login;
$("btnRegistrar").onclick = registrar;

/* Enter também faz login */
$("inPass").addEventListener("keydown", e => {
  if (e.key === "Enter") login();
});
