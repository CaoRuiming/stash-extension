import { getUrl, notify, downloadBlob, getTextFromFile, isUrl, getBatchEndUrl } from './Util.js';

/**
 * Format of a Stash.
 */
export type Stash = string[];

/**
 * Service class containing static methods for interacting with the Stash.
 */
export default class StashService {
  /**
   * Saves a given Stash into browser local storage. This will overwrite the
   * existing saved Stash, if it exists.
   * @param stash Stash to save into persistent browser local storage.
   */
  static async saveStash(stash: Stash): Promise<void> {
    await chrome.storage.local.set({ stash });
  }

  /**
   * Gets the stash that is saved in browser local storage. If no Stash if found,
   * returns a new empty Stash wrapped in a Promise.
   * @returns A Stash wrapped in a Promise.
   */
  static async getStash(): Promise<Stash> {
    const { stash } = await chrome.storage.local.get('stash');
    return Array.isArray(stash) ? stash : [];
  }

  /**
   * Adds the URL of the active tab in the current window to the top of the Stash.
   */
  static async stashAdd(): Promise<void> {
    const url: string = await getUrl();
    const stash: Stash = (await StashService.getStash()).filter(x => x !== url);
    stash.unshift(url);
    StashService.saveStash(stash);
    notify('Add successful!');
  }

  /**
   * Removes the URL of the active tab in the current window to the Stash. Does
   * nothing if the current URL is not already in the Stash.
   * 
   * This method actually "blanks out" the removed url so that the indices of 
   * the other urls in the Stash are not impacted. stashOpen will automatically 
   * skip Stash items and periodically remove empty items from the Stash.
   */
  static async stashRemove(): Promise<void> {
    const url: string = await getUrl();
    const stash: Stash = await StashService.getStash();
    // "Blank out" the removed url so that the indices of the other urls in the
    // Stash are not impacted. stashOpen will automatically skip Stash items
    // that are not URLs.
    StashService.saveStash(stash.map(x => x === url ? "" : x));
    notify('Remove successful!');
  }

  /**
   * Given a batch number, opens subset of the URLs in the Stash. If no batch
   * number is specified, this method opens all urls in the Stash. If the batch
   * number is 1, this method first cleans up the Stash by removing invalid
   * entries (which could have been introduced by stashRemove). Invalid entries
   * are always skipped by this method.
   * @param batch Batch number to open from the Stash.
   */
  static async stashOpen(batch?: number): Promise<void> {
    if (!batch || batch === 1) {
      const stash: Stash = await StashService.getStash();
      await StashService.saveStash(stash.filter(isUrl));
    }

    const stash: Stash = await StashService.getStash();
  
    let urlsToOpen: string[];
    if (batch && batch > 0) {
      const batchSize: number = 50;
      urlsToOpen = stash
        .slice((batch - 1) * batchSize, batch * batchSize)
        .filter(isUrl);
      if (urlsToOpen.length > 0) {
        // if there are URLs to open, append a special page at the end to mark
        // the end of the batch.
        urlsToOpen.push(getBatchEndUrl(batch));
      }
    } else {
      urlsToOpen = stash.filter(isUrl);
    }

    if (urlsToOpen.length === 0) {
      notify('Found no URLs to open.');
    } else {
      urlsToOpen.forEach(url => chrome.tabs.create({ active: false, url }));
      notify('Open successful!');
    }
  }

  /**
   * Reads a user-provided text file and overwrites the current Stash with the
   * contents of the import.
   */
  static async stashImport(inputElement: HTMLInputElement): Promise<void> {
    const file: (File | undefined) = inputElement?.files?.[0];
    if (file) {
      const fileContent: string = await getTextFromFile(file);
      const importedStash: Stash = fileContent.split('\n').filter(isUrl);
      if (importedStash.length > 0) {
        StashService.saveStash(importedStash);
        notify('Import successful!');
      } else {
        notify('Import failed: empty import');
      }
    }
  }

  /**
   * Downloads the current Stash as a text file.
   */
  static async stashExport(): Promise<void> {
    const stash: Stash = (await StashService.getStash()).filter(isUrl);
    stash.unshift('STASH');
    const blob: Blob = new Blob([stash.join('\n')], { type: 'text/plain' });
    downloadBlob(blob);
  }
}
