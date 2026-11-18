const { app, BrowserWindow, shell, ipcMain, dialog } = require("electron");
const { spawn, execFile } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const https = require("node:https");
const http = require("node:http");

const APP_URL = "https://henry4663.github.io/CalintTrap/";
const VERSION_DIR = () => app.isPackaged
  ? path.join(process.resourcesPath, "1.1")
  : path.resolve(__dirname, "../1.1");
const DATA_DIR = () => path.join(app.getPath("userData"), "minecraft-1.1");
const LIB_DIR = () => path.join(DATA_DIR(), "libraries");
const ASSET_DIR = () => path.join(DATA_DIR(), "assets");

function requestBuffer(url, redirects = 5) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    client.get(url, response => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location && redirects > 0) {
        response.resume();
        return resolve(requestBuffer(new URL(response.headers.location, url).toString(), redirects - 1));
      }
      if (response.statusCode !== 200) {
        response.resume();
        return reject(new Error("Download falhou (" + response.statusCode + "): " + url));
      }
      const chunks = [];
      response.on("data", chunk => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadFile(url, destination) {
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  try {
    const stat = await fs.promises.stat(destination);
    if (stat.size > 0) return destination;
  } catch {}
  const data = await requestBuffer(url);
  const temporary = destination + ".download";
  await fs.promises.writeFile(temporary, data);
  await fs.promises.rename(temporary, destination);
  return destination;
}

function findJava() {
  return new Promise(resolve => {
    const command = process.platform === "win32" ? "where.exe" : "which";
    execFile(command, ["java"], { windowsHide: true }, (error, stdout) => {
      const candidates = [
        process.env.JAVA_HOME && path.join(process.env.JAVA_HOME, "bin", process.platform === "win32" ? "java.exe" : "java"),
        ...String(stdout || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean)
      ].filter(Boolean);
      let index = 0;
      const checkNext = () => {
        if (index >= candidates.length) return resolve(null);
        const candidate = candidates[index++];
        execFile(candidate, ["-version"], { windowsHide: true }, (versionError, versionOut, versionErr) => {
          const versionText = String(versionOut || "") + String(versionErr || "");
          if (!versionError && /version "1\.8|version "8(?:[+\.\-"])/i.test(versionText)) return resolve(candidate);
          checkNext();
        });
      };
      if (error && candidates.length === 0) return resolve(null);
      checkNext();
    });
  });
}

async function prepareMinecraft() {
  const versionDir = VERSION_DIR();
  const manifestPath = path.join(versionDir, "1.1.json");
  const clientJar = path.join(versionDir, "1.1.jar");
  const nativeDir = path.join(versionDir, "natives");
  const manifest = JSON.parse(await fs.promises.readFile(manifestPath, "utf8"));
  await fs.promises.access(clientJar);
  await fs.promises.mkdir(LIB_DIR(), { recursive: true });

  const classpath = [clientJar];
  for (const library of manifest.libraries || []) {
    const rules = library.rules;
    if (rules && !rules.some(rule => rule.action === "allow" && (!rule.os || rule.os.name === "windows"))) continue;
    const artifact = library.downloads && library.downloads.artifact;
    if (!artifact) continue;
    const target = path.join(LIB_DIR(), artifact.path);
    await downloadFile(artifact.url, target);
    classpath.push(target);
  }

  const index = manifest.assetIndex;
  const indexPath = path.join(ASSET_DIR(), "indexes", index.id + ".json");
  await downloadFile(index.url, indexPath);
  const assetIndex = JSON.parse(await fs.promises.readFile(indexPath, "utf8"));
  const assetEntries = Object.entries(assetIndex.objects || {});
  let nextAsset = 0;
  const workers = Array.from({ length: 12 }, async () => {
    while (nextAsset < assetEntries.length) {
      const [assetName, asset] = assetEntries[nextAsset++];
      const hash = asset.hash;
      const objectPath = path.join(ASSET_DIR(), "objects", hash.slice(0, 2), hash);
      await downloadFile("https://resources.download.minecraft.net/" + hash.slice(0, 2) + "/" + hash, objectPath);
      if (assetIndex.virtual) {
        const legacyPath = path.join(ASSET_DIR(), "virtual", assetIndex.virtual === true ? "legacy" : assetIndex.virtual, ...assetName.split("/"));
        await fs.promises.mkdir(path.dirname(legacyPath), { recursive: true });
        try { await fs.promises.access(legacyPath); } catch { await fs.promises.copyFile(objectPath, legacyPath); }
      }
    }
  });
  await Promise.all(workers);

  return { manifest, classpath, nativeDir, assetDir: ASSET_DIR(), gameDir: path.join(DATA_DIR(), "game") };
}

ipcMain.handle("goblox:minecraft:launch", async event => {
  if (process.platform !== "win32") {
    throw new Error("A integração inicial do Minecraft 1.1 está preparada para Windows.");
  }
  const java = await findJava();
  if (!java) throw new Error("Java não encontrado. Instale o Java 8 (64 bits) e abra o Goblox novamente.");
  const prepared = await prepareMinecraft();
  await fs.promises.mkdir(prepared.gameDir, { recursive: true });
  const args = [
    "-Djava.library.path=" + prepared.nativeDir,
    "-Dorg.lwjgl.librarypath=" + prepared.nativeDir,
    "-cp", prepared.classpath.join(path.delimiter),
    prepared.manifest.mainClass || "net.minecraft.launchwrapper.Launch",
    "GobloxPlayer", "-", "--gameDir", prepared.gameDir,
    "--assetsDir", prepared.assetDir, "--assetIndex", prepared.manifest.assets || "pre-1.6"
  ];
  const child = spawn(java, args, {
    cwd: prepared.gameDir,
    detached: true,
    stdio: "ignore",
    windowsHide: false
  });

  await new Promise((resolve, reject) => {
    child.once("spawn", resolve);
    child.once("error", reject);
  });

  child.once("exit", code => {
    if (code && code !== 0) {
      dialog.showErrorBox(
        "Minecraft 1.1",
        "O Java fechou o Minecraft com código " + code + ". Confira se o Java 8 é de 64 bits e se a pasta 1.1 está completa."
      );
    }
  });
  child.unref();
  return { ok: true, message: "Minecraft 1.1 iniciado. Aguarde a janela do jogo aparecer." };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#090014",
    title: "Goblox",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadURL(APP_URL);
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https://") || url.startsWith("http://")) shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
