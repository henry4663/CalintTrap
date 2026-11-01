import { getCurrentNick, logout } from "./authLocal.js";

const nick = getCurrentNick();
if (!nick) {
  location.href = "lock.html";
}

document.getElementById("boasVindas").textContent = `Olá, ${nick}!`;
