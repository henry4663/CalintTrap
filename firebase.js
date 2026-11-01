import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    get,
    update,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
    getAuth,
    createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
    signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    updateProfile as firebaseUpdateProfile,
    signOut as firebaseSignOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDX8URTIoGsagCpTpOYXUthhsyAz6AbrFc",
    authDomain: "goblox-61b88.firebaseapp.com",
    databaseURL: "https://goblox-61b88-default-rtdb.firebaseio.com",
    projectId: "goblox-61b88",
    storageBucket: "goblox-61b88.firebasestorage.app",
    messagingSenderId: "112050040041",
    appId: "1:112050040041:web:1777dcc3fd0909d5655478"
};

function hasValidFirebaseConfig(config) {
    return Boolean(
        config &&
        typeof config.apiKey === "string" && config.apiKey.trim() &&
        typeof config.projectId === "string" && config.projectId.trim() &&
        typeof config.appId === "string" && config.appId.trim()
    );
}

let app = null;
let database = null;
let auth = null;

if (hasValidFirebaseConfig(firebaseConfig)) {
    try {
        app = initializeApp(firebaseConfig);
        database = getDatabase(app);
        auth = getAuth(app);
    } catch (error) {
        console.error("Falha ao inicializar Firebase:", error);
    }
} else {
    console.warn("Firebase não configurado. Atualize o objeto firebaseConfig em firebase.js.");
}

function ensureFirebaseReady() {
    if (!app || !database || !auth) {
        throw new Error("Firebase não está configurado corretamente. Verifique o arquivo firebase.js e a configuração do projeto no Firebase Console.");
    }
}

export const db = database;
export { auth };

export function createUserWithEmailAndPassword(...args) {
    ensureFirebaseReady();
    return firebaseCreateUserWithEmailAndPassword(auth, ...args);
}

export function signInWithEmailAndPassword(...args) {
    ensureFirebaseReady();
    return firebaseSignInWithEmailAndPassword(auth, ...args);
}

export function onAuthStateChanged(...args) {
    ensureFirebaseReady();
    return firebaseOnAuthStateChanged(auth, ...args);
}

export function updateProfile(...args) {
    ensureFirebaseReady();
    return firebaseUpdateProfile(...args);
}

export function signOut(...args) {
    ensureFirebaseReady();
    return firebaseSignOut(auth, ...args);
}

export {
    ref,
    set,
    get,
    update,
    onValue,
    remove
};

export function toast(msg, tipo = "") {
    const t = document.getElementById("toast");

    if (!t) return;

    const normalizedType = String(tipo).trim().toLowerCase();
    const safeTipo =
        normalizedType === "sucesso" || normalizedType === "success"
            ? "success"
            : normalizedType === "erro" || normalizedType === "error"
                ? "error"
                : normalizedType === "aviso" || normalizedType === "warning"
                    ? "warning"
                    : normalizedType;

    t.textContent = msg;
    t.className = `toast show ${safeTipo}`.trim();

    setTimeout(() => {
        t.className = `toast ${safeTipo}`.trim();
    }, 2500);
}
