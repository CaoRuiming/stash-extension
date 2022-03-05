import { Stash } from "./types.js";

/**
 * Saves a given Stash into browser local storage. This will overwrite the
 * existing saved Stash, if it exists.
 * @param stash Stash to save into persistent browser local storage.
 */
export function saveStash(stash: Stash): void {
  chrome.storage.local.set({ stash });
}

/**
 * Gets the stash that is saved in browser local storage. If no Stash if found,
 * returns a new empty Stash wrapped in a Promise.
 * @returns A Stash wrapped in a Promise.
 */
export async function getStash(): Promise<Stash> {
  const { stash } = await chrome.storage.local.get("stash");
  return Array.isArray(stash) ? stash : [];
}

/**
 * Gets the url of the active tab in the current window. If none is found,
 * returns an empty string wrapped in a Promise.
 * @returns The URL of the current tab wrapped in a Promise.
 */
export async function getUrl(): Promise<string> {
  const { url } = (await chrome.tabs.query({ currentWindow: true, active: true }))[0];
  return sanitizeUrl(url || "");
}

/**
 * Takes in a valid URL and strips out query strings if present.
 * @param url URL to sanitize.
 * @returns Sanitized URL.
 */
export function sanitizeUrl(url: string): string {
  const matches: (RegExpMatchArray | null) = url.match(/^([^?]*)\??/);
  return matches ? matches[1] : "";
}

/**
 * A permissive check for if a given string is a URL. This checks if the string
 * begins with "http://" or "https://".
 * @param str String to check if is a URL.
 * @returns True if str is a url, false otherwise.
 */
export function isUrl(str: string): boolean {
  if (!str) {
    return false;
  }
  const regex: RegExp = /^https?:\/\/.*/;
  return regex.test(str);
}

/**
 * Creates a basic notification with the given message.
 * @param message Message to include in notification.
 */
export function notify(message: string): void {
  chrome.notifications.create({ type: "basic", title: "Stash", message, iconUrl: "icon.svg" });
}

export function getTextFromFile(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve((<string | null> reader.result) || ""), false);
    reader.readAsText(file);
  });
}
