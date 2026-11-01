import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from "./firebase.js";

const form = document.getElementById("authForm");
const loginUsername = document.getElementById("loginUsername");
const username = document.getElementById("username");
const password = document.getElementById("password");

const nameGroup = document.getElementById("nameGroup");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");
const switchMode = document.getElementById("switchMode");
const switchText = document.getElementById("switchText");

let registerMode = false;
let loading = false;

// Identificador interno. Não é um endereço de e-mail real.
function usernameToInternalId(name) {
    return name.trim().toLowerCase() + "@accounts.goblox.invalid";
}

function showMessage(text, success = false) {
    message.textContent = text;
    message.style.color = success ? "#55ee99" : "#ff5555";
}

switchMode.addEventListener("click", () => {
    registerMode = !registerMode;

    nameGroup.hidden = !registerMode;
    loginUsername.parentElement.querySelector("label").textContent =
        "Usuário";

    loginUsername.required = !registerMode;
    username.required = registerMode;

    submitButton.textContent = registerMode
        ? "CRIAR CONTA"
        : "ENTRAR";

    switchText.textContent = registerMode
        ? "Já possui uma conta?"
        : "Não tem uma conta?";

    switchMode.textContent = registerMode
        ? "Entrar"
        : "Criar conta";

    message.textContent = "";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (loading) return;

    const name = registerMode
        ? username.value.trim()
        : loginUsername.value.trim();

    const pass = password.value;

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
        showMessage("Use de 3 a 20 caracteres: letras, números ou _.");
        return;
    }

    if (pass.length < 6) {
        showMessage("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    loading = true;
    submitButton.disabled = true;
    submitButton.textContent = "AGUARDE...";

    try {
        const internalId = usernameToInternalId(name);

        if (registerMode) {
            const result = await createUserWithEmailAndPassword(
                auth,
                internalId,
                pass
            );

            await updateProfile(result.user, {
                displayName: name
            });

            showMessage("Conta criada com sucesso!", true);

        } else {
            await signInWithEmailAndPassword(
                auth,
                internalId,
                pass
            );

            showMessage("Login realizado!", true);
        }

        window.location.replace("index.html");

    } catch (error) {
        const errors = {
            "auth/email-already-in-use": "Esse usuário já existe.",
            "auth/invalid-credential": "Usuário ou senha incorretos.",
            "auth/weak-password": "Senha muito fraca.",
            "auth/network-request-failed": "Erro de conexão.",
            "auth/operation-not-allowed": "Ative Email/Senha no Firebase."
        };

        showMessage(errors[error.code] || "Erro ao acessar sua conta.");

    } finally {
        loading = false;
        submitButton.disabled = false;
        submitButton.textContent = registerMode
            ? "CRIAR CONTA"
            : "ENTRAR";
    }
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.replace("index.html");
    }
});
