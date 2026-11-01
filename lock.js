import { db, ref, set, get, toast } from "./firebase.js";

const $ = id => document.getElementById(id);

// Se já estiver logado, pula direto para o lobby
if (localStorage.getItem("goblox_user")) {
  window.location.replace("lobby.html");
}

async function registrar() {
  const u = $("inUser").value.trim();
  const p = $("inPass").value;
  const m = $("msgLogin");

  if (!u || u.length < 3) { m.textContent = "Usuário precisa ter 3+ caracteres"; return; }
  if (p.length < 4) { m.textContent = "Senha precisa ter 4+ caracteres"; return; }

  try {
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
  } catch (e) {
    m.style.color = "var(--danger)";
    m.textContent = "Erro ao criar conta. Verifique o Firebase.";
    console.error(e);
  }
}

async function login() {
  const u = $("inUser").value.trim();
  const p = $("inPass").value;
  const m = $("msgLogin");

  try {
    const snap = await get(ref(db, "users/" + u));
    if (!snap.exists() || snap.val().pass !== p) {
      m.style.color = "var(--danger)";
      m.textContent = "Usuário ou senha incorretos";
      return;
    }

    // Salva o usuário no navegador
    localStorage.setItem("goblox_user", u);
    toast("Bem-vindo, " + u + "!", "success");
    
    // FORÇA a ida para o lobby depois de 1 segundo
    setTimeout(() => {
      window.location.href = "lobby.html";
    }, 1000);

  } catch (e) {
    m.style.color = "var(--danger)";
    m.textContent = "Erro de conexão com o banco.";
    console.error(e);
  }
}

// Adiciona os eventos aos botões
$("btnLogin").onclick = login;
$("btnRegistrar").onclick = registrar;

// Permite apertar Enter para logar
$("inPass").addEventListener("keydown", e => {
  if (e.key === "Enter") login();
});
