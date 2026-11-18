const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gobloxMinecraft", Object.freeze({
  launch: () => ipcRenderer.invoke("goblox:minecraft:launch")
}));
