export interface Settings {
  batchSize: number;
  defaultBump: number;
}
const DEFAULT_SETTINGS: Settings = Object.freeze({
  batchSize: 40,
  defaultBump: 2,
});

/**
 * Service class containing static methods for interacting with settings.
 */
export default class SettingsService {
  /**
   * Retreives a Settings object from browser local storage.
   * @returns Settings object.
   */
  static async getSettings(): Promise<Settings> {
    const { settings } = await chrome.storage.local.get("settings");
    return { ...DEFAULT_SETTINGS, ...settings };
  }

  /**
   * Saves a Settings object into browser local storage.
   * @param settings Settings object to save.
   */
  static async saveSettings(settings: Settings): Promise<void> {
    await chrome.storage.local.set({ settings });
  }
}
