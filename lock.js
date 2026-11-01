import { db, ref, set, get, toast } from "./firebase.js";

const $ = id => document.getElementById(id);

// --- FUNÇÕES ---
async function fazerLogin() {
  const u = $("inUser").value.trim();
  const p = $("inPass").value;
  const m = $("msgLogin");

  if (!u || !p) {
    m.textContent = "Preencha usuário e senha.";
    return;
  }

  m.textContent = "Verificando...";
  m.style.color = "var(--muted)";

  try {
    const snap = await get(ref(db, "users/" + u));
    if (!snap.exists() || snap.val().pass !== p) {
      m.style.color = "var(--danger)";
      m.textContent = "Usuário ou senha incorretos";
      return;
    }

    localStorage.setItem("goblox_user", u);
    m.style.color = "var(--success)";
    m.textContent = "Logado! Redirecionando...";
    
    setTimeout(() => {
      window.location.replace("lobby.html");
    }, 800);

  } catch (e) {
    m.style.color = "var(--danger)";
    m.textContent = "Erro no banco. Verifique o console.";
    console.error("Erro no Firebase:", e);
  }
}

async function fazerRegistro() {
  const u = $("inUser").value.trim();
  const p = $("inPass").value;
  const m = $("msgLogin");

  if (!u || u.length < 3) { m.textContent = "Usuário precisa ter 3+ caracteres"; return; }
  if (p.length < 4) { m.textContent = "Senha precisa ter 4+ caracteres"; return; }

  m.textContent = "Criando conta...";
  m.style.color = "var(--muted)";

  try {
    const snap = await get(ref(db, "users/" + u));
    if (snap.exists()) { 
      m.style.color = "var(--danger)";
      m.textContent = "Esse usuário já existe"; 
      return; 
    }

    await set(ref(db, "users/" + u), {
      pass: p, criado: Date.now(), bio: "", avatar: "", jogos: 0, vitorias: 0, nivel: 1
    });

    m.style.color = "var(--success)";
    m.textContent = "Conta criada! Clique em Entrar.";
    toast("Conta criada com sucesso!", "success");
  } catch (e) {
    m.style.color = "var(--danger)";
    m.textContent = "Erro ao criar conta. Verifique o console.";
    console.error("Erro no Firebase:", e);
  }
}

// --- ESPERA O HTML CARREGAR E CONECTA OS BOTÕES ---
document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = $("btnLogin");
  const btnRegistrar = $("btnRegistrar");
  const inPass = $("inPass");

  if (btnLogin) btnLogin.addEventListener("click", fazerLogin);
  if (btnRegistrar) btnRegistrar.addEventListener("click", fazerRegistro);
  
  if (inPass) {
    inPass.addEventListener("keydown", e => {
      if (e.key === "Enter") fazerLogin();
    });
  }
});

// Se já estiver logado, vai pro lobby
if (localStorage.getItem("goblox_user")) {
  window.location.replace("lobby.html");
}
