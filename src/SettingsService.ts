export interface Settings {
  batchSize: number;
  defaultBump: number;
}
const DEFAULT_SETTINGS: Settings = Object.freeze({
  batchSize: 40,
  defaultBump: 2,
});

/**
 * Key all persistent data is stored under for this service.
 */
const BROWSER_STORAGE_KEY = "settings";

/**
 * Service class containing static methods for interacting with settings.
 */
export default class SettingsService {
  /**
   * Retreives a Settings object from browser local storage.
   * @returns Settings object.
   */
  static async getSettings(): Promise<Settings> {
    const { settings } = await chrome.storage.local.get(BROWSER_STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  /**
   * Saves a Settings object into browser local storage.
   * @param settings Settings object to save.
   */
  static async saveSettings(settings: Settings): Promise<void> {
    await chrome.storage.local.set({ [BROWSER_STORAGE_KEY]: settings });
  }
}
