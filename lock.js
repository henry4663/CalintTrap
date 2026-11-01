import {
    auth,
    db,
    ref,
    set,
    get,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile
} from "./firebase.js";

const form = document.getElementById("authForm");
const username = document.getElementById("username");
const loginUsername = document.getElementById("loginUsername");
const password = document.getElementById("password");

const nameGroup = document.getElementById("nameGroup");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitButton");
const switchMode = document.getElementById("switchMode");
const switchText = document.getElementById("switchText");

let registerMode = false;
let loading = false;

const LOBBY = "lobby.html";

function internalEmail(name) {
    return name.toLowerCase() + "@goblox-login.com";
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

// Alternar login e cadastro
switchMode.addEventListener("click", () => {
    if (loading) return;

    registerMode = !registerMode;

    nameGroup.hidden = !registerMode;
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

// Cadastro e login
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (loading) return;

    const name = (registerMode
        ? username.value
        : loginUsername.value).trim();

    const pass = password.value;

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(name)) {
        showMessage("Usuário: 3 a 20 letras, números ou _.");
        return;
    }

    if (pass.length < 6) {
        showMessage("A senha precisa ter pelo menos 6 caracteres.");
        return;
    }

    setLoading(true);

    try {
        const email = internalEmail(name);

        if (registerMode) {
            const result = await createUserWithEmailAndPassword(
                auth,
                email,
                pass
            );

            await updateProfile(result.user, {
                displayName: name
            });

            await set(ref(db, "users/" + name.toLowerCase()), {
                username: name,
                uid: result.user.uid,
                createdAt: Date.now()
            });

            showMessage("Conta criada!", true);

        } else {
            await signInWithEmailAndPassword(
                auth,
                email,
                pass
            );

            showMessage("Bem-vindo ao GOBLOX!", true);
        }

        window.location.replace(LOBBY);

    } catch (error) {
        const errors = {
            "auth/email-already-in-use": "Esse usuário já existe.",
            "auth/invalid-credential": "Usuário ou senha incorretos.",
            "auth/weak-password": "Senha muito fraca.",
            "auth/network-request-failed": "Sem conexão com a internet.",
            "auth/operation-not-allowed": "Ative Email/Password no Firebase.",
            "PERMISSION_DENIED": "Permissão negada no banco de dados."
        };

        showMessage(errors[error.code] || error.message);

    } finally {
        setLoading(false);
    }
});

// Se já estiver conectado, vai direto para o lobby
window.location.href = "lobby.html";
    }
});
