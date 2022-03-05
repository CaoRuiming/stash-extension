import { Stash } from "./types.js";
import { saveStash, getStash, getUrl, notify, getTextFromFile, isUrl } from "./util.js";

export async function stashAdd(): Promise<void> {
  const url: string = await getUrl();
  const stash: Stash = (await getStash()).filter(x => x !== url);
  stash.unshift(url)
  saveStash(stash);
  notify("Add successful!");
}

export async function stashRemove(): Promise<void> {
  const url: string = await getUrl();
  const stash: Stash = await getStash();
  saveStash(stash.filter(x => x !== url));
  notify("Remove successful!");
}

export async function stashOpen(): Promise<void> {
  const stash: Stash = await getStash();
  stash.forEach(url => chrome.tabs.create({ active: false, url }));
  notify("Open successful!");
}

export async function stashImport(): Promise<void> {
  const filePicker = <HTMLInputElement | null> document.getElementById("file-picker");
  const file: (File | undefined) = filePicker?.files?.[0];
  if (file) {
    const fileContent: string = await getTextFromFile(file);
    const importedStash: Stash = fileContent.split("\n").filter(isUrl);
    if (importedStash.length > 0) {
      saveStash(importedStash);
      notify("Import successful!");
    } else {
      notify("Import failed: empty import");
    }
  }
}

// Handle export url cleanup
let exportUrl: (string | null) = null;
chrome.downloads.onChanged.addListener(delta => {
  if (exportUrl && delta.state?.current === "complete") {
    URL.revokeObjectURL(exportUrl);
    exportUrl = null;
  }
});

export async function stashExport(): Promise<void> {
  const stash: Stash = await getStash();
  stash.unshift("STASH");
  const blob: Blob = new Blob([stash.join("\n")], { type: "text/plain" });
  exportUrl = URL.createObjectURL(blob);
  chrome.downloads.download({ url: exportUrl, filename: "STASH.txt", saveAs: true });
}
