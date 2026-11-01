// Este arquivo exporta a instância do Firebase para os outros usarem
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue, remove }
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU.firebaseapp.com",
  databaseURL: "https://SEU-default-rtdb.firebaseio.com",
  projectId: "SEU",
  storageBucket: "SEU.appspot.com",
  messagingSenderId: "SEU",
  appId: "SEU"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export { ref, set, get, update, onValue, remove };

// Helper: toast global
export function toast(msg, tipo = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + tipo;
  setTimeout(() => t.className = "toast " + tipo, 2500);
}
