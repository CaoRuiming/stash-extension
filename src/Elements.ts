import { create } from "./Dom.js";
import SettingsService, { Settings } from "./SettingsService.js";
import StashService from "./StashService.js";
import { getUrl, notify, errorToString } from "./Util.js";

export const stashAddComponent: HTMLButtonElement = create("button", {
  content: "Stash Add",
  attributes: { "title": "Add current tab to the Stash" },
  onClick: async () => {
    try {
      await StashService.stashAdd(await getUrl());
    } catch (error) {
      notify("Add failed: ", errorToString(error));
      return;
    }
    notify("Add successful!");
  },
});

export const stashRemoveComponent: HTMLButtonElement = create("button", {
  content: "Stash Remove",
  attributes: { "title": "Remove current tab from the Stash" },
  onClick: async () => {
    try {
      await StashService.stashRemove(await getUrl());
    } catch (error) {
      notify("Remove failed: ", errorToString(error));
      return;
    }
    notify("Remove successful!");
  },
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
    attributes: {
      "title": "Bump current tab towards the front of the Stash (if positive)",
    },
    onClick: async () => {
      try {
        await StashService.stashBump(await getUrl(), parseInt(stashBumpInput.value) || 0);
      } catch (error) {
        notify("Bump failed: ", errorToString(error));
        return;
      }
      notify("Bump successful!");
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
    attributes: { "title": "Open a subset/batch of the URLs in the Stash" },
    onClick: async () => {
      try {
        await StashService.stashOpen(parseInt(batchNumberInput.value));
      } catch (error) {
        notify("Open failed: ", errorToString(error));
        return;
      }
      notify("Open successful!");
    },
  });
  return create("div", { content: [batchNumberInput, stashOpenButton] });
})();

export const stashImportComponent: HTMLElement = (() => {
  const fileInput: HTMLInputElement = create("input", {
    attributes: { "type": "file" },
  });
  const stashImportButton: HTMLButtonElement = create("button", {
    content: "Stash Import",
    attributes: { "title": "Replace the current stash with the selected file" },
    onClick: async () => {
      const file: (File | undefined) = fileInput?.files?.[0];
      if (file) {
        try {
          await StashService.stashImport(file);
        } catch (error) {
          notify("Import failed: ", errorToString(error));
          return;
        }
        notify("Import successful!");
      } else {
        alert("Please select a file to import.");
      }
    },
  });
  return create("div", { content: [fileInput, stashImportButton] });
})();

export const stashExportComponent: HTMLButtonElement = create("button", {
  content: "Stash Export",
  attributes: { "title": "Export the current stash as a text file" },
  onClick: async () => {
    try {
      await StashService.stashExport();
    } catch (error) {
      notify("Export failed: ", errorToString(error));
    }
  },
});

export const stashClearComponent: HTMLButtonElement = create("button", {
  content: "Stash Clear",
  attributes: { "title": "Export the current Stash and then empty it" },
  onClick: async () => {
    try {
      await StashService.stashExport();
      await StashService.saveStash([]);
    } catch (error) {
      notify("Clear failed: ", errorToString(error));
      return;
    }
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
    attributes: { "title": "Set the batch size used by Batch Open" },
    onClick: async () => {
      const settings: Settings = await SettingsService.getSettings();
      const newBatchSize = parseInt(stashBatchSizeInput.value);
      if (!newBatchSize || newBatchSize < 1) {
        alert("Invalid batch size provided.");
      } else {
        try {
          await SettingsService.saveSettings({ ...settings, batchSize: newBatchSize });
        } catch (error) {
          notify("Batch size update failed: ", errorToString(error));
          return;
        }
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
    attributes: { "title": "Set the default bump amount used by Stash Bump" },
    onClick: async () => {
      const settings: Settings = await SettingsService.getSettings();
      const newBumpAmount = parseInt(stashBumpAmountInput.value);
      if (!newBumpAmount) {
        alert("Invalid bump amount provided.");
      } else {
        try {
          await SettingsService.saveSettings({ ...settings, defaultBump: newBumpAmount });
        } catch (error) {
          notify("Bump amount update failed: ", errorToString(error));
          return;
        }
        notify("Default bump amount updated!");
      }
    },
  });
  return create("div", { content: [stashBumpAmountInput, stashBumpAmountButton] });
})();
