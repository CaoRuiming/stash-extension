import SettingsService from "./SettingsService.js";
import { downloadBlob, getTextFromFile, isUrl, getBatchEndUrl, sanitizeUrl } from "./Util.js";

/**
 * Format of a Stash.
 */
export type Stash = string[];

/**
 * The ways in which the Stash can be changed.
 */
export enum StashDeltaType {
  ADD = "ADD",
  REMOVE = "REMOVE",
  BUMP = "BUMP"
}

/**
 * An object representing a change made to the Stash. These are accumulated and
 * then applied lazily when necessary.
 */
export interface StashDelta {
  type: StashDeltaType;
  url: string;
  /**
   * Required field when type is BUMP.
   */
  bumpAmount?: number;
}

/**
 * Service class containing static methods for interacting with the Stash. All
 * lazy actions can be applied by calling the updateStash method.
 */
export default class StashService {
  /**
   * Saves a given Stash into browser local storage. This will overwrite the
   * existing saved Stash, if it exists.
   * @param stash Stash to save into persistent browser local storage.
   */
  private static async saveStash(stash: Stash): Promise<void> {
    await chrome.storage.local.set({ stash });
  }

  /**
   * Gets the stash that is saved in browser local storage. If no Stash if found,
   * returns a new empty Stash wrapped in a Promise.
   * @returns A Stash wrapped in a Promise.
   */
  static async getStash(): Promise<Stash> {
    const { stash } = await chrome.storage.local.get("stash");
    return Array.isArray(stash) ? stash : [];
  }

  /**
   * Saves a given array of StashDeltas into browser lcoal storage. This will
   * overwrite the existing array of StashDeltas, if it exists.
   * @param stashDeltas StashDeltas to save into persistent browser storage.
   */
  private static async saveStashDeltas(stashDeltas: StashDelta[]): Promise<void> {
    await chrome.storage.local.set({ stashDeltas });
  }

  /**
   * Gets all queued StashDeltas. Each StashDelta represents a change applied to
   * the Stash.
   * @returns Array of StashDeltas wrapped in a Promise.
   */
  static async getStashDeltas(): Promise<StashDelta[]> {
    const { stashDeltas } = await chrome.storage.local.get("stashDeltas");
    return Array.isArray(stashDeltas) ? stashDeltas : [];
  }

  /**
   * Convenience function for adding and saving a new StashDelta.
   * @param delta StashDelta to add to the queue saved in persistent storage.
   */
  private static async addStashDelta(delta: StashDelta): Promise<void> {
    // Validation step
    if (delta.type === StashDeltaType.BUMP && delta.bumpAmount === undefined) {
      throw new Error("BUMP delta did not include bump amount");
    }
    const stashDeltas: StashDelta[] = await StashService.getStashDeltas();
    stashDeltas.push(delta);
    await StashService.saveStashDeltas(stashDeltas);
  }

  /**
   * Applies a given array of StashDeltas to a given Stash. This method does not
   * mutate its inputs, and returns a new (but unsaved) Stash.
   * @param stash Stash to apply StashDeltas to (this is not mutated).
   * @param stashDeltas StashDeltas to apply to the given Stash.
   * @returns New (but unsaved) Stash made by applying stashDeltas to stash.
   */
  private static applyDeltas(stash: Stash, stashDeltas: StashDelta[]): Stash {
    let result: Stash = stash.slice(0);
    stashDeltas.forEach((delta: StashDelta) => {
      const { type, url } = delta;
      switch (type) {
        case StashDeltaType.ADD: {
          result = result.filter(x => x !== url);
          result.unshift(url);
          break;
        }
        case StashDeltaType.REMOVE: {
          result = result.filter(x => x !== url);
          break;
        }
        case StashDeltaType.BUMP: {
          const oldIndex: number = result.indexOf(url);
          const { bumpAmount } = delta;
          if (oldIndex >= 0 && bumpAmount !== undefined) {
            const newIndex = Math.min(Math.max(oldIndex - bumpAmount, 0), result.length);
            result.splice(oldIndex, 1); // remove url from old position
            result.splice(newIndex, 0, url); // insert url into new position
          }
          break;
        }
        default: {
          throw new Error("Encountered unsupported stash change: " + type);
        }
      }
    });
    return result;
  }

  /**
   * Applies all StashDeltas to the Stash. The new Stash is saved, and all
   * StashDeltas are cleared. If an invalid StashDelta is encountered, it will
   * not be applied but still be cleared at the end.
   */
  static async updateStash(): Promise<void> {
    const stash: Stash = await StashService.getStash();
    const stashDeltas: StashDelta[] = await StashService.getStashDeltas();
    const newStash: Stash = StashService.applyDeltas(stash, stashDeltas);
    // Filter invalid URLs from the Stash and sanitize the remaining entries.
    StashService.saveStash(newStash.filter(isUrl).map(sanitizeUrl));
    StashService.saveStashDeltas([]);
  }

  /**
   * Lazily adds the URL of the active tab in the current window to the top of
   * the Stash.
   * @param url URL to add to the top/beginning of the Stash.
   */
  static async stashAdd(url: string): Promise<void> {
    await StashService.addStashDelta({ type: StashDeltaType.ADD, url });
  }

  /**
   * Lazily bumps the position of the specified url in the Stash up (towards the
   * beginning) or down (towards the end). Does nothing if the given URL is not
   * already present in the Stash. A more positive bumpAmount pushes the given
   * URL closer towards the top/beginning of the Stash. The opposite is true for
   * more negative values of bumpAmount. The value of the bumped URL index will
   * be clamped between 0 and the last index of the Stash.
   * @param url URL to change the position of in the Stash.
   * @param bumpAmount Number of indices to adjust the position of url.
   */
  static async stashBump(url: string, bumpAmount: number): Promise<void> {
    const stash: Stash = await StashService.getStash();
    if (!stash.includes(url)) {
      // Check that url is not going to be added in through a StashDelta before
      // throwing an error.
      const stashDeltas: StashDelta[] = await StashService.getStashDeltas();
      const stashWithDeltas: Stash = StashService.applyDeltas(stash, stashDeltas);
      if (!stashWithDeltas.includes(url)) {
        throw new Error("Could not bump a url because it was not present in the Stash.");
      }
    } else {
      await StashService.addStashDelta({ type: StashDeltaType.BUMP, url, bumpAmount });
    }
  }

  /**
   * Lazily removes the URL of the active tab in the current window to the Stash. Does
   * nothing if the current URL is not already in the Stash.
   * @param url URL to remove from the Stash, if present.
   */
  static async stashRemove(url: string): Promise<void> {
    await StashService.addStashDelta({ type: StashDeltaType.REMOVE, url });
  }

  /**
   * Given a batch number, opens subset of the URLs in the Stash. If no batch
   * number is specified, this method opens all urls in the Stash. If the batch
   * number is 1 or not provided, this method applies all StashDeltas to the
   * Stash (i.e. executes all lazily performed Stash actions) before opening
   * anything. Invalid entries are always skipped by this method.
   * @param batch Batch number to open from the Stash.
   */
  static async stashOpen(batch?: number): Promise<void> {
    if (!batch || batch === 1) {
      await StashService.updateStash();
    }

    const stash: Stash = await StashService.getStash();

    let urlsToOpen: string[];
    if (batch && batch > 0) {
      const batchSize: number = (await SettingsService.getSettings()).batchSize;
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
      throw new Error("Found no URLs to open.");
    } else {
      await Promise.all(urlsToOpen.map(url => chrome.tabs.create({ active: false, url })));
    }
  }

  /**
   * Reads a user-provided text file and overwrites the current Stash with the
   * contents of the import. Expects the imported text file to contain URLs
   * separated by newlines. Invalid URLs are ignored. The import process also
   * clears out all saved StashDeltas.
   * @param file Text file containing newline-separated urls to import.
   */
  static async stashImport(file: File): Promise<void> {
    const fileContent: string = await getTextFromFile(file);
    const importedStash: Stash = fileContent.split("\n").filter(isUrl).map(sanitizeUrl);
    if (importedStash.length > 0) {
      await StashService.saveStash(importedStash);
      await StashService.saveStashDeltas([]);
    } else {
      throw new Error("Import was empty");
    }
  }

  /**
   * Downloads the current Stash as a text file.
   */
  static async stashExport(): Promise<void> {
    await StashService.updateStash();
    const stash: Stash = await StashService.getStash();
    stash.unshift("STASH");
    const blob: Blob = new Blob([stash.join("\n")], { type: "text/plain" });
    await downloadBlob(blob);
  }

  /**
   * Clears all Stash items and StashDeltas.
   */
  static async stashClear(): Promise<void> {
    await StashService.saveStash([]);
    await StashService.saveStashDeltas([]);
  }
}
