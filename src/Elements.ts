import { create } from "./Dom.js";
import SettingsService, { Settings } from "./SettingsService.js";
import StashService from "./StashService.js";
import { getUrl, notify } from "./Util.js";

export const stashAddComponent: HTMLButtonElement = create("button", {
  content: "Stash Add",
  onClick: async () => StashService.stashAdd(await getUrl()),
});

export const stashRemoveComponent: HTMLButtonElement = create("button", {
  content: "Stash Remove",
  onClick: async () => StashService.stashRemove(await getUrl()),
});

export const stashBumpComponent: HTMLElement = (() => {
  const stashBumpInput: HTMLInputElement = create("input", {
    attributes: { "type": "number", "step": "1", "placeholder": "Amount to bump" },
    onCreate: async input => {
      input.value = (await SettingsService.getSettings()).defaultBump.toString();
    },
  });
  const stashBumpButton: HTMLButtonElement = create("button", {
    content: "Stash Bump",
    onClick: async () => {
      StashService.stashBump(await getUrl(), parseInt(stashBumpInput.value) || 0);
    },
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
  onClick: StashService.stashExport,
});

export const stashClearComponent: HTMLButtonElement = create("button", {
  content: "Stash Clear",
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

export const stashBumpAmountComponent: HTMLElement = (() => {
  const stashBumpAmountInput: HTMLInputElement = create("input", {
    attributes: {
      "type": "number",
      "min": "1",
      "step": "1",
      "placeholder": "Default bump amount",
    },
    onCreate: async input => {
      input.value = (await SettingsService.getSettings()).defaultBump.toString();
    },
  });
  const stashBumpAmountButton: HTMLButtonElement = create("button", {
    content: "Set Default Stash Bump Amount",
    onClick: async () => {
      const settings: Settings = await SettingsService.getSettings();
      const newBumpAmount = parseInt(stashBumpAmountInput.value);
      if (!newBumpAmount) {
        notify("Invalid bump amount provided.");
      } else {
        await SettingsService.saveSettings({ ...settings, defaultBump: newBumpAmount });
        notify("Default bump amount updated!");
      }
    },
  });
  return create("div", { content: [stashBumpAmountInput, stashBumpAmountButton] });
})();
