import { saveStash, getStash, getUrl, notify } from "./util.js";

export async function stashAdd() {
  const url = await getUrl();
  const stash = (await getStash()).filter(x => x !== url);
  stash.unshift(url)
  saveStash(stash);
  notify("Add successful!");
}

export async function stashRemove() {
  const url = await getUrl();
  const stash = await getStash();
  saveStash(stash.filter(x => x !== url));
  notify("Remove successful!");
}

export async function stashOpen() {
  const stash = await getStash();
  stash.forEach(url => chrome.tabs.create({ active: false, url }));
  notify("Open successful!");
}

export async function stashImport() {
  const file = document.getElementById("file-picker").files[0];
  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const importedStash = reader.result.split("\n").filter(x => x !== "STASH");
    const newStash = await getStash();
    importedStash.forEach(url => {
      if (!newStash.includes(url)) {
        newStash.push(url);
      }
    });
    saveStash(newStash);
    notify("Import successful!")
  }, false);
  reader.readAsText(file);
}

// Handle export url cleanup
let exportUrl = null;
chrome.downloads.onChanged.addListener(delta => {
  if (exportUrl && delta.state?.current === "complete") {
    URL.revokeObjectURL(exportUrl);
    exportUrl = null;
  }
});

export async function stashExport() {
  const stash = await getStash();
  stash.unshift("STASH");
  const blob = new Blob([stash.join("\n")], { type: "text/plain" });
  exportUrl = URL.createObjectURL(blob);
  chrome.downloads.download({ url: exportUrl, filename: "STASH.txt", saveAs: true });
}
