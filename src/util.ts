/**
 * Takes an input and guarantees that the output is an array.
 * @param x Item to arrify.
 * @returns x if x is an array, returns an array containing x otherwise.
 */
export function arrify<T>(x: T | T[]): T[] {
  return Array.isArray(x) ? x : [x];
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
 * Returns the absolute URL to the extension's special batch end page that shows
 * the batch number of the Stash batch that was opened.
 * @param batch Batch number that was opened by stashOpen.
 * @returns URL to batch end page.
 */
export function getBatchEndUrl(batch: number): string {
  return "/html/batchEnd.html?batch=" + batch;
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
  return (/^https?:\/\/.*/).test(str);
}

/**
 * Creates a basic notification with the given message.
 * @param message Message to include in notification.
 */
export function notify(message: string): void {
  chrome.notifications.create({ type: "basic", title: "Stash", message, iconUrl: "/icon.svg" });
}

/**
 * Downloads a blob. Returns a void Promise that resolves when the download is
 * complete. Automatically handles url cleanup for the download.
 * @param blob Blob to download.
 * @param filename Suggested name of downloaded file. Defaults to 'Stash.txt'.
 */
export async function downloadBlob(blob: Blob, filename = "Stash.txt"): Promise<void> {
  const url = URL.createObjectURL(blob);
  const params: chrome.downloads.DownloadOptions = { url, filename, saveAs: true };
  await new Promise(resolve => chrome.downloads.download(params, downloadId => {
    chrome.downloads.onChanged.addListener(delta => {
      if (delta.id === downloadId && delta.state?.current === "complete") {
        URL.revokeObjectURL(url);
        resolve(true);
      }
    });
  }));
}

/**
 * Given a File, reads its contents as a string.
 * @param file File to read text from.
 * @returns String wrapped in a Promise.
 */
export function getTextFromFile(file: File): Promise<string> {
  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve((<string | null> reader.result) || ""), false);
    reader.readAsText(file);
  });
}
