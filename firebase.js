// Este arquivo exporta a instância do Firebase para os outros usarem
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDX8URTIoGsagCpTpOYXUthhsyAz6AbrFc",
  authDomain: "goblox-61b88.firebaseapp.com",
  projectId: "goblox-61b88",
  storageBucket: "goblox-61b88.firebasestorage.app",
  messagingSenderId: "112050040041",
  appId: "1:112050040041:web:1777dcc3fd0909d5655478",
  measurementId: "G-45E2G7FVW3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
