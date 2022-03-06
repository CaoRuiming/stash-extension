import { create } from "./Dom.js";
import SettingsService, { Settings } from "./SettingsService.js";
import StashService from "./StashService.js";
import { getUrl, notify } from "./Util.js";

export const stashAddButton: HTMLButtonElement = create("button", {
  content: "Stash Add",
  classes: "action-choice",
  onClick: async () => StashService.stashAdd(await getUrl()),
});

export const stashRemoveButton: HTMLButtonElement = create("button", {
  content: "Stash Remove",
  classes: "action-choice",
  onClick: async () => StashService.stashRemove(await getUrl()),
});

export const stashBumpButton: HTMLButtonElement = create("button", {
  content: "Stash Bump",
  classes: "action-choice",
  onClick: async () => StashService.stashBump(await getUrl(), parseInt(stashBumpInput.value) || 0),
});

export const stashOpenButton: HTMLButtonElement = create("button", {
  content: "Stash Open",
  classes: "action-choice",
  onClick: () => StashService.stashOpen(parseInt(batchNumberInput.value)),
});

export const stashImportButton: HTMLButtonElement = create("button", {
  content: "Stash Import",
  classes: "action-choice",
  onClick: () => {
    const file: (File | undefined) = fileInput?.files?.[0];
    if (file) {
      StashService.stashImport(file);
    } else {
      alert("Please select a file to import.");
    }
  },
});

export const stashExportButton: HTMLButtonElement = create("button", {
  content: "Stash Export",
  classes: "action-choice",
  onClick: StashService.stashExport,
});

export const stashBatchSizeButton: HTMLButtonElement = create("button", {
  content: "Set Stash Batch Size",
  classes: "action-choice",
  onClick: async () => {
    const settings: Settings = await SettingsService.getSettings();
    const newBatchSize = parseInt(stashBatchSizeInput.value);
    if (!newBatchSize || newBatchSize < 1) {
      notify("Invalid batch size provided.");
    } else {
      await SettingsService.saveSettings({ ...settings, batchSize: newBatchSize });
      notify("Batch size updated!");
    }
  },
});

export const stashClearButton: HTMLButtonElement = create("button", {
  content: "Stash Clear",
  classes: "action-choice",
  onClick: async () => {
    await StashService.stashExport();
    await StashService.saveStash([]);
    notify("Clear successful!");
  },
});

export const fileInput: HTMLInputElement = create("input", {
  classes: "action-choice",
  attributes: { "type": "file" },
});

export const batchNumberInput: HTMLInputElement = create("input", {
  attributes: { "type": "number", "min": "1", "step": "1", "placeholder": "Batch to open" },
});

export const stashBumpInput: HTMLInputElement = create("input", {
  attributes: { "type": "number", "step": "1", "placeholder": "Amount to bump", "value": "5" },
});

export const stashBatchSizeInput: HTMLInputElement = create("input", {
  attributes: { "type": "number", "min": "1", "step": "1", "placeholder": "Batch size" },
});
(async () => {
  stashBatchSizeInput.value = (await SettingsService.getSettings()).batchSize.toString();
})();
