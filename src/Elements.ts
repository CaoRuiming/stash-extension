import { create } from "./Dom.js";
import SettingsService, { Settings } from "./SettingsService.js";
import StashService from "./StashService.js";
import { getUrl, notify } from "./Util.js";

export const stashAddComponent: HTMLButtonElement = create("button", {
  content: "Stash Add",
  classes: "action-choice",
  onClick: async () => StashService.stashAdd(await getUrl()),
});

export const stashRemoveComponent: HTMLButtonElement = create("button", {
  content: "Stash Remove",
  classes: "action-choice",
  onClick: async () => StashService.stashRemove(await getUrl()),
});

export const stashBumpComponent: HTMLElement = (() => {
  const stashBumpInput: HTMLInputElement = create("input", {
    attributes: { "type": "number", "step": "1", "placeholder": "Amount to bump", "value": "5" },
  });
  const stashBumpButton: HTMLButtonElement = create("button", {
    content: "Stash Bump",
    classes: "action-choice",
    onClick: async () => StashService.stashBump(await getUrl(), parseInt(stashBumpInput.value) || 0),
  });
  return create("div", { content: [stashBumpInput, stashBumpButton] });
})();

export const stashOpenComponent: HTMLElement = (() => {
  const batchNumberInput: HTMLInputElement = create("input", {
    attributes: {
      "type": "number",
      "min": "1",
      "step": "1",
      "placeholder": "Batch to open",
    },
  });
  const stashOpenButton: HTMLButtonElement = create("button", {
    content: "Stash Open",
    classes: "action-choice",
    onClick: () => StashService.stashOpen(parseInt(batchNumberInput.value)),
  });
  return create("div", { content: [batchNumberInput, stashOpenButton] });
})();

export const stashImportComponent: HTMLElement = (() => {
  const fileInput: HTMLInputElement = create("input", {
    attributes: { "type": "file" },
  });
  const stashImportButton: HTMLButtonElement = create("button", {
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
  return create("div", { content: [fileInput, stashImportButton] });
})();

export const stashExportComponent: HTMLButtonElement = create("button", {
  content: "Stash Export",
  classes: "action-choice",
  onClick: StashService.stashExport,
});

export const stashClearComponent: HTMLButtonElement = create("button", {
  content: "Stash Clear",
  classes: "action-choice",
  onClick: async () => {
    try {
      await StashService.stashExport();
    } catch (error) {
      notify("Could not clear Stash because export failed.");
      return;
    }
    await StashService.saveStash([]);
    notify("Clear successful!");
  },
});

export const stashBatchSizeComponent: HTMLElement = (() => {
  const stashBatchSizeInput: HTMLInputElement = create("input", {
    attributes: {
      "type": "number",
      "min": "1",
      "step": "1",
      "placeholder": "Batch size",
    },
    onCreate: async input => {
      input.value = (await SettingsService.getSettings()).batchSize.toString();
    },
  });
  const stashBatchSizeButton: HTMLButtonElement = create("button", {
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
  return create("div", { content: [stashBatchSizeInput, stashBatchSizeButton] });
})();
