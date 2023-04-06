import SettingsService from "./SettingsService.js";
import {
  downloadBlob,
  getTextFromFile,
  isUrl,
  getMessagePageUrl,
  sanitizeUrl,
  deduplicate,
} from "./Util.js";

/**
 * Format of a Stash.
 */
export type Stash = string[];

/**
 * Extension data saved in persistent browser storage.
 */
export interface StashData {
  /**
   * The most up to date Stash.
   */
  stash: Stash;
  /**
   * The version of Stash that the Stash Open action opens. This might not be
   * up to date with all user-initiated mutations.
   */
  openedStash: Stash;
}
/**
 * Interface of the input used for StashService.updateStashData(). Essentially
 * the same as StashData but with all fields set to be optional.
 */
export interface StashDataUpdate {
  stash?: Stash;
  openedStash?: Stash;
}

/**
 * Service class containing static methods for interacting with the Stash.
 */
export default class StashService {
  /**
   * Saves a given StashData object into browser local storage. This will
   * overwrite the existing saved StashData object, if one exists.
   * @param stashData StashData object to save into persistent browser storage.
   */
  private static async saveStashData(stashData: StashData): Promise<void> {
    await chrome.storage.local.set({ stashData });
  }

  /**
   * Convenience function for updating and saving a subset of the fields of
   * StashData.
   * @param stashDataUpdate Object including fields and values to update.
   * @returns The newly updated StashData (already saved to browser storage).
   */
  static async updateStashData(
    stashDataUpdate: StashDataUpdate
  ): Promise<StashData> {
    const oldStashData: StashData = await StashService.getStashData();
    const newStashData: StashData = { ...oldStashData, ...stashDataUpdate };
    await StashService.saveStashData(newStashData);
    return newStashData;
  }

  /**
   * Gets extension stash data that is saved in browser local storage. If any
   * field in the stash data is not initialized, this method initializes it (but
   * does not save it).
   * @returns A StashData object.
   */
  static async getStashData(): Promise<StashData> {
    const { stashData = {} } = await chrome.storage.local.get("stashData");
    const { stash, openedStash } = stashData;
    return {
      ...stashData,
      stash: Array.isArray(stash) ? stash : [],
      openedStash: Array.isArray(openedStash) ? openedStash : [],
    };
  }

  /**
   * Adds the URL of the active tab in the current window to the top of
   * the Stash.
   * @param url URL to add to the top/beginning of the Stash.
   */
  static async stashAdd(url: string): Promise<void> {
    if (!isUrl(url)) {
      throw new Error("Could not add url because it was invalid.");
    }
    const { stash: oldStash } = await StashService.getStashData();
    const newStash: Stash = oldStash.filter((x) => x !== url);
    newStash.unshift(url);
    await StashService.updateStashData({ stash: newStash });
  }

  /**
   * Bumps the position of the specified url in the Stash up (towards the
   * beginning) or down (towards the end). Does nothing if the given URL is not
   * already present in the Stash. A more positive bumpAmount pushes the given
   * URL closer towards the top/beginning of the Stash. The opposite is true for
   * more negative values of bumpAmount. The value of the bumped URL index will
   * be clamped between 0 and the last index of the Stash.
   * @param url URL to change the position of in the Stash.
   * @param bumpAmount Number of indices to adjust the position of url.
   */
  static async stashBump(url: string, bumpAmount: number): Promise<void> {
    const { stash } = await StashService.getStashData();
    const oldIndex: number = stash.indexOf(url);
    if (oldIndex < 0) {
      throw new Error(
        "Could not bump a url because it was not present in the Stash."
      );
    } else {
      const newIndex = Math.min(
        Math.max(oldIndex - bumpAmount, 0),
        stash.length - 1
      );
      stash.splice(oldIndex, 1); // remove url from old position
      stash.splice(newIndex, 0, url); // insert url into new position
      await StashService.updateStashData({ stash });
    }
  }

  /**
   * Removes the URL of the active tab in the current window to the Stash.
   * Throws error if the current URL is not already in the Stash.
   * @param url URL to remove from the Stash, if present.
   */
  static async stashRemove(url: string): Promise<void> {
    const { stash: oldStash } = await StashService.getStashData();
    if (!oldStash.includes(url)) {
      throw new Error(
        "Could not remove a url because it was not present in the Stash."
      );
    }
    const newStash: Stash = oldStash.filter((x) => x !== url);
    await StashService.updateStashData({ stash: newStash });
  }

  /**
   * Given a batch number, opens subset of the URLs in the Stash. If no batch
   * number is specified, this method opens all urls in the Stash. If the batch
   * number is 1 or not provided, this method copies the most recent version of
   * the Stash for its own reference before opening anything. This copy will be
   * the version of the Stash that is opened for all other batches. Invalid
   * entries are always skipped by this method.
   * @param batch Batch number to open from the Stash.
   */
  static async stashOpen(batch?: number): Promise<void> {
    let stash: Stash;
    if (!batch || batch === 1) {
      // If the beginning of the Stash is being opened, set openedStash to be
      // the same as stash.
      const oldStashData: StashData = await StashService.getStashData();
      ({ stash } = await StashService.updateStashData({
        openedStash: oldStashData.stash,
      }));
    } else {
      ({ openedStash: stash } = await StashService.getStashData());
    }

    let urlsToOpen: string[];
    if (batch && batch > 0) {
      const batchSize: number = (await SettingsService.getSettings()).batchSize;
      urlsToOpen = stash
        .slice((batch - 1) * batchSize, batch * batchSize)
        .filter(isUrl);
      if (urlsToOpen.length > 0) {
        // if there are URLs to open, append a special page at the end to mark
        // the end of the batch or Stash.
        urlsToOpen.push(getMessagePageUrl(`End of Batch ${batch}`));
        if (stash.length < batch * batchSize) {
          urlsToOpen.push(getMessagePageUrl("End of Stash"));
        }
      }
    } else {
      urlsToOpen = stash.filter(isUrl);
    }

    if (urlsToOpen.length === 0) {
      throw new Error("Found no URLs to open.");
    } else {
      await Promise.all(
        urlsToOpen.map((url) => chrome.tabs.create({ active: false, url }))
      );
    }
  }

  /**
   * Reads a user-provided text file and overwrites the current Stash with the
   * contents of the import. Expects the imported text file to contain URLs
   * separated by newlines. Invalid URLs are ignored.
   * @param file Text file containing newline-separated urls to import.
   */
  static async stashImport(file: File): Promise<void> {
    const fileContent: string = await getTextFromFile(file);
    const importedStash: Stash = deduplicate(
      fileContent.split("\n").filter(isUrl).map(sanitizeUrl)
    );
    if (importedStash.length > 0) {
      await StashService.updateStashData({
        stash: importedStash,
        openedStash: importedStash.slice(0),
      });
    } else {
      throw new Error("Import was empty");
    }
  }

  /**
   * Downloads the current Stash as a text file.
   */
  static async stashExport(): Promise<void> {
    const { stash } = await StashService.getStashData();
    stash.unshift("STASH");
    const blob: Blob = new Blob([stash.join("\n")], { type: "text/plain" });
    await downloadBlob(blob);
  }

  /**
   * Clears all Stash items.
   */
  static async stashClear(): Promise<void> {
    await StashService.updateStashData({ stash: [], openedStash: [] });
  }
}
