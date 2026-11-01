```javascript
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
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// CONFIGURAÇÃO ORIGINAL DO GOBLOX
const firebaseConfig = {
    apiKey: "AIzaSyDX8URTIoGsagCpTpOYXUthhsyAz6AbrFc",
    authDomain: "goblox-61b88.firebaseapp.com",
    databaseURL: "https://goblox-61b88-default-rtdb.firebaseio.com",
    projectId: "goblox-61b88",
    storageBucket: "goblox-61b88.firebasestorage.app",
    messagingSenderId: "112050040041",
    appId: "1:112050040041:web:1777dcc3fd0909d5655478"
};

// INICIALIZAÇÃO
const app = initializeApp(firebaseConfig);

// BANCO DE DADOS
export const db = getDatabase(app);

// AUTENTICAÇÃO
export const auth = getAuth(app);

// EXPORTAÇÕES
export {
    ref,
    set,
    get,
    update,
    onValue,
    remove,

    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    updateProfile,
    signOut
};

// SISTEMA DE NOTIFICAÇÃO
export function toast(msg, tipo = "") {
    const t = document.getElementById("toast");

    if (!t) return;

    t.textContent = msg;
    t.className = "toast show " + tipo;

    setTimeout(() => {
        t.className = "toast " + tipo;
    }, 2500);
}
```
