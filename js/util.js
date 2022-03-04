export function saveStash(stash) {
  chrome.storage.local.set({ stash });
}

export async function getStash() {
  const { stash } = await chrome.storage.local.get("stash");
  return Array.isArray(stash) ? stash : [];
}

export async function getUrl() {
  const { url } = (await chrome.tabs.query({ currentWindow: true, active: true }))[0];
  return sanitizeUrl(url);
}

export function sanitizeUrl(url) {
  return url.match(/^([^?]*)\??/)[1];
}

export function notify(message) {
  chrome.notifications.create({ type: "basic", title: "Stash", message, iconUrl: "icon.svg" });
}
