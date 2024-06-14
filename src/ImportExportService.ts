import NotesService, { Notes } from "./NotesService.js";
import StashService, { Stash } from "./StashService.js";
import {
  deduplicate,
  downloadBlob,
  getTextFromFile,
  isUrl,
  sanitizeUrl,
} from "./Util.js";

/**
 * Expected JSON format for Stash export files.
 */
interface StashJson {
  stash?: Stash;
  notes?: Notes;
}

/**
 * Utility class including methods to import and export Stash data.
 */
export default class ImportExportService {
  /**
   * Reads a user-provided file and overwrites the current Stash with the
   * contents of the import. Invalid URLs are ignored.
   * @param file Json file containing urls to import.
   */
  static async importStash(file: File): Promise<void> {
    const fileContent: string = await getTextFromFile(file);
    const importedData: StashJson = JSON.parse(fileContent);
    let { stash: importedStash = [], notes: importedNotes = {} } = importedData;

    // Clean up imported data
    importedStash = deduplicate(importedStash.filter(isUrl).map(sanitizeUrl));
    importedNotes = await NotesService.cleanNotes(importedNotes, importedStash);
    if (importedStash.length < 1) {
      throw new Error("Import was empty");
    }

    await StashService.updateStashData({
      stash: importedStash,
      openedStash: importedStash.slice(0),
    });
    await NotesService.saveNotes(importedNotes);
  }

  /**
   * Downloads the current Stash as a json file.
   */
  static async exportStash(): Promise<void> {
    const { stash } = await StashService.getStashData();
    const notes = await NotesService.getNotes();
    const jsonExport: StashJson = {
      stash,
      notes,
    };
    const blob: Blob = new Blob([JSON.stringify(jsonExport)], {
      type: "application/json",
    });
    await downloadBlob(blob, "Stash.json");
  }
}
