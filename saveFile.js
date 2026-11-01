const DEFAULT_FILENAME = "save.fxkey";

export async function openSaveTarget(filename = DEFAULT_FILENAME) {
  if (!window.showSaveFilePicker) {
    return {
      type: "download",
      filename
    };
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: filename,
      types: [{
        description: "Arquivo de save do jogo",
        accept: {
          "application/json": [".fxkey", ".json"]
        }
      }]
    });

    return {
      type: "picker",
      handle
    };
  } catch {
    return {
      type: "download",
      filename
    };
  }
}

export async function saveJsonToFile(data, filename = DEFAULT_FILENAME) {
  const content = JSON.stringify(data, null, 2);

  const target = await openSaveTarget(filename);

  if (target.type === "picker" && target.handle) {
    const writable = await target.handle.createWritable();
    await writable.write(content);
    await writable.close();
    return target.handle;
  }

  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
  return null;
}

export async function loadJsonFromFile(file) {
  if (!file) return null;

  const text = await file.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
