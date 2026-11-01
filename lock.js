import { createAccount, loginAccount, getSession } from "./authLocal.js";

const form = document.getElementById("authForm");
const usernameInput = document.getElementById("username");
const loginUsernameInput = document.getElementById("loginUsername");
const passwordInput = document.getElementById("password");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");
const switchModeButton = document.getElementById("switchMode");
const switchText = document.getElementById("switchText");
const nameGroup = document.getElementById("nameGroup");

let registerMode = false;
let loading = false;

const LOBBY = "./lobby.html";

function showMessage(text, success = false) {
  message.textContent = text;
  message.style.color = success ? "#55ee99" : "#ff5555";
}

function setLoading(value) {
  loading = value;
  submitButton.disabled = value;
  submitButton.textContent = value ? "AGUARDE..." : registerMode ? "CRIAR CONTA" : "ENTRAR";
}

function getUsernameValue() {
  return String((registerMode ? usernameInput.value : loginUsernameInput.value) || "").trim();
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

switchModeButton.addEventListener("click", () => {
  if (loading) return;

  registerMode = !registerMode;

  nameGroup.hidden = !registerMode;
  usernameInput.required = registerMode;
  loginUsernameInput.required = !registerMode;

  submitButton.textContent = registerMode ? "CRIAR CONTA" : "ENTRAR";
  switchText.textContent = registerMode ? "Já possui uma conta?" : "Não tem uma conta?";
  switchModeButton.textContent = registerMode ? "Entrar" : "Criar conta";
  message.textContent = "";
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (loading) return;

  const nick = getUsernameValue();
  const password = String(passwordInput.value || "").trim();

  if (!isValidUsername(nick)) {
    showMessage("Nick inválido. Use 3 a 20 letras, números ou _.");
    return;
  }

  if (password.length < 6) {
    showMessage("Senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  setLoading(true);

  try {
    if (registerMode) {
      await createAccount(nick, password);
      showMessage("Conta criada com sucesso!", true);

      setTimeout(() => {
        window.location.assign(LOBBY);
      }, 500);

      return;
    }

    await loginAccount(nick, password);
    showMessage("Login realizado com sucesso!", true);

    setTimeout(() => {
      window.location.assign(LOBBY);
    }, 500);

  } catch (error) {
    showMessage(error.message || "Erro ao autenticar.");
  } finally {
    setLoading(false);
  }
});

const session = getSession();
if (session && session.nick) {
  window.location.replace(LOBBY);
}
