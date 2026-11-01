import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDX8URTIoGsagCpTpOYXUthhsyAz6AbrFc",
  authDomain: "goblox-61b88.firebaseapp.com",
  // ADICIONE ESTA LINHA ABAIXO:
  databaseURL: "https://goblox-61b88-default-rtdb.firebaseio.com",
  projectId: "goblox-61b88",
  storageBucket: "goblox-61b88.firebasestorage.app",
  messagingSenderId: "112050040041",
  appId: "1:112050040041:web:1777dcc3fd0909d5655478",
  measurementId: "G-45E2G7FVW3"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export { ref, set, get, update, onValue, remove };

export function toast(msg, tipo = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className = "toast show " + tipo;
  setTimeout(() => t.className = "toast " + tipo, 2500);
}
