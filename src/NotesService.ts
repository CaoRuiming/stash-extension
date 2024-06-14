import StashService, { Stash } from "./StashService.js";

/**
 * Mapping from stashed URL to corresponding note.
 */
export type Notes = Record<string, string | undefined>;

/**
 * Key all persistent data is stored under for this service.
 */
const BROWSER_STORAGE_KEY = "stashNotesData";

/**
 * Service class containing static methods for interacting with Stash notes.
 */
export default class NotesService {
  /**
   * Saves a given Notes mapping into browser local storage. This will overwrite
   * the existing saved Notes object, if one exists. Notes for URLs not present
   * in the Stash will automatically get pruned.
   * @param notes Notes object to save into persistent browser storage.
   */
  static async saveNotes(notes: Notes): Promise<void> {
    await chrome.storage.local.set({
      [BROWSER_STORAGE_KEY]: await NotesService.cleanNotes(notes),
    });
  }

  /**
   * Gets extension Stash notes data that is saved in browser local storage. If
   * the notes data is not initialized, this method initializes it (but does not
   * save it). Notes for URLs not present in the Stash will automatically be
   * excluded.
   * @returns Notes saved for Stash.
   */
  static async getNotes(): Promise<Notes> {
    const { [BROWSER_STORAGE_KEY]: notes = {} } =
      await chrome.storage.local.get(BROWSER_STORAGE_KEY);
    return await NotesService.cleanNotes(notes);
  }

  /**
   * Given a Notes objects, creates a new one excluding notes for URLs not
   * present in the Stash.
   * @param notes Notes to clean.
   * @param stash Stash to use to clean provided notes with. If not provided,
   * uses the Stash saved in the browser.
   * @returns Notes with entries corresponding to URLs outside of Stash
   * excluded.
   */
  static async cleanNotes(notes: Notes, stash?: Stash): Promise<Notes> {
    const stashUrls = stash || (await StashService.getStashData()).stash;
    const result: Notes = {};
    Object.entries(notes).forEach(([url, note]) => {
      if (stashUrls.includes(url)) {
        result[url] = note;
      }
    });
    return result;
  }
}
