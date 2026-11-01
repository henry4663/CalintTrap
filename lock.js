import {
  auth,
  db,
  ref,
  set,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from "./firebase.js";

const form = document.getElementById("authForm");
const usernameInput = document.getElementById("username");
const loginUsernameInput = document.getElementById("loginUsername");
const passwordInput = document.getElementById("password");

const nameGroup = document.getElementById("nameGroup");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");
const switchModeButton = document.getElementById("switchMode");
const switchText = document.getElementById("switchText");

let registerMode = false;
let loading = false;

const LOBBY = "./lobby.html";

function toFirebaseEmail(username) {
  return `${String(username).trim().toLowerCase()}@goblox-login.com`;
}

function showMessage(text, success = false) {
  message.textContent = text;
  message.style.color = success ? "#55ee99" : "#ff5555";
}

function setLoading(value) {
  loading = value;
  submitButton.disabled = value;
  submitButton.textContent = value
    ? "AGUARDE..."
    : registerMode ? "CRIAR CONTA" : "ENTRAR";
}

function getUsernameValue() {
  const raw = registerMode ? usernameInput.value : loginUsernameInput.value;
  return String(raw || "").trim();
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function isFirebaseReady() {
  if (!auth || !db) {
    showMessage("Firebase não está disponível. Verifique a configuração do projeto.");
    return false;
  }

  return true;
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

  if (loading || !isFirebaseReady()) return;

  const username = getUsernameValue();
  const password = String(passwordInput.value || "").trim();

  if (!isValidUsername(username)) {
    showMessage("Usuário inválido. Use 3 a 20 letras, números ou _.");
    return;
  }

  if (password.length < 6) {
    showMessage("Senha precisa ter pelo menos 6 caracteres.");
    return;
  }

  setLoading(true);

  try {
    const email = toFirebaseEmail(username);

    if (registerMode) {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      if (result?.user) {
        await updateProfile(result.user, { displayName: username });
      }

      await set(ref(db, `users/${username.toLowerCase()}`), {
        username,
        uid: result.user.uid,
        createdAt: Date.now()
      });

      localStorage.setItem("goblox_user", username);
      showMessage("Conta criada com sucesso!", true);
    } else {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userName = result.user.displayName || username;
      localStorage.setItem("goblox_user", userName);
      showMessage("Login realizado com sucesso!", true);
    }

    setTimeout(() => {
      window.location.assign(LOBBY);
    }, 500);
  } catch (error) {
    const map = {
      "auth/email-already-in-use": "Usuário já cadastrado.",
      "auth/invalid-credential": "Usuário ou senha incorretos.",
      "auth/weak-password": "Senha muito fraca.",
      "auth/network-request-failed": "Erro de internet. Verifique sua conexão.",
      "auth/operation-not-allowed": "Ative o Email/Password no Firebase.",
      "auth/user-not-found": "Usuário não encontrado.",
      "auth/too-many-requests": "Muitas tentativas. Tente mais tarde."
    };

    showMessage(map[error?.code] || (error?.message || "Erro ao autenticar."));
  } finally {
    setLoading(false);
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const userName = user.displayName || (user.email || "").split("@")[0] || "Jogador";
  localStorage.setItem("goblox_user", userName);

  if (!loading) {
    window.location.replace(LOBBY);
  }
});
