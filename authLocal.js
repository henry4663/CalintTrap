import { db } from "./firebase.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Retorna o nickname atual salvo localmente
export function getCurrentNick() {
  return localStorage.getItem("goblox_player_nick") || localStorage.getItem("goblox_logged_user") || null;
}

// Inicia a sessão e redireciona para o lobby
export function iniciarSessao(username) {
  console.log("Iniciando sessão para:", username);
  localStorage.setItem("goblox_player_nick", username);
  localStorage.setItem("goblox_logged_user", username);
  window.location.href = "lobby.html";
}

// Faz o logout do jogador
export function logout() {
  localStorage.removeItem("goblox_player_nick");
  localStorage.removeItem("goblox_logged_user");
  window.location.href = "index.html";
}

// Alterna a visibilidade da senha
export function togglePassword() {
  const password = document.getElementById("password");
  if (password) {
    password.type = password.type === "password" ? "text" : "password";
  }
}

// Processa a tentativa de login
export async function realizarLogin(username, password) {
  if (!username || !password) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    console.log("A procurar utilizador no Firebase:", username);
    const userRef = ref(db, `users/${username}`);
    const userSnap = await get(userRef);

    // Se a conta não existir, oferece criação rápida
    if (!userSnap.exists()) {
      console.log("Utilizador não encontrado. A perguntar para criar...");
      if (confirm(`A conta "${username}" não existe. Deseja criá-la agora com esta senha?`)) {
        await criarConta(username, password);
      }
      return;
    }

    // Valida a senha
    const dadosConta = userSnap.val();
    console.log("Dados encontrados:", dadosConta);

    if (dadosConta.senha !== password) {
      alert("Senha incorreta!");
      return;
    }

    const profileKey = encodeURIComponent(String(username).trim().toLowerCase()).replace(/\./g, "%2E");
    const profileSnap = await get(ref(db, "profiles/" + profileKey + "/ban"));
    if (profileSnap.exists()) {
      const ban = profileSnap.val();
      const active = ban.active && (ban.permanent || Number(ban.until) > Date.now());
      if (active) {
        alert("Conta suspensa.\nMotivo: " + (ban.reason || "Não informado") + (ban.permanent ? "\nDuração: permanente" : "\nAté: " + new Date(Number(ban.until)).toLocaleString("pt-BR")));
        return;
      }
    }
    iniciarSessao(username);
  } catch (err) {
    console.error("Erro detalhado no login:", err);
    alert("Erro ao conectar com o servidor. Verifique o F12 (Console).");
  }
}

// Cria uma nova conta diretamente no Firebase
export async function criarConta(username, password) {
  if (!username || !password) {
    alert("Digite um Usuário e uma Senha nos campos para criar a conta!");
    return;
  }

  try {
    console.log("A criar conta no Firebase para:", username);
    const userRef = ref(db, `users/${username}`);
    const userSnap = await get(userRef);

    if (userSnap.exists()) {
      alert("Este usuário já existe! Basta clicar em 'Entrar'.");
      return;
    }

    await set(userRef, {
      senha: password,
      fbux: 500,
      moedas: 200,
      criadoEm: Date.now()
    });

    localStorage.setItem(`goblox_fbux_${username}`, 500);
    localStorage.setItem(`goblox_moedas_${username}`, 200);

    alert("Conta criada com sucesso! Entrando...");
    iniciarSessao(username);
  } catch (err) {
    console.error("Erro detalhado ao criar conta:", err);
    alert("Erro ao criar conta no servidor. Verifique o F12 (Console).");
  }
}
