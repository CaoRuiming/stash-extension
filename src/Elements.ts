import { create } from "./Dom.js";
import ImportExportService from "./ImportExportService.js";
import NotesService from "./NotesService.js";
import SettingsService, { Settings } from "./SettingsService.js";
import StashService from "./StashService.js";
import { getUrl, notify, errorToString } from "./Util.js";

export const stashAddComponent: HTMLButtonElement = create("button", {
  content: "Stash Add",
  attributes: { title: "Add current tab to the Stash" },
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
  attributes: { title: "Remove current tab from the Stash" },
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
    attributes: { type: "number", step: "1", placeholder: "Amount to bump" },
    onCreate: async (input) => {
      input.value = (
        await SettingsService.getSettings()
      ).defaultBump.toString();
    },
  });
  const stashBumpButton: HTMLButtonElement = create("button", {
    content: "Stash Bump",
    attributes: {
      title: "Bump current tab towards the front of the Stash (if positive)",
    },
    onClick: async () => {
      const bumpAmount: number = parseInt(stashBumpInput.value) || 0;
      try {
        await StashService.stashBump(await getUrl(), bumpAmount);
      } catch (error) {
        notify("Bump failed: ", errorToString(error));
        return;
      }
      notify("Successfully bumped item by ", bumpAmount.toString());
    },
  });
  return create("div", { content: [stashBumpInput, stashBumpButton] });
})();

export const stashOpenComponent: HTMLElement = (() => {
  const batchNumberInput: HTMLInputElement = create("input", {
    attributes: {
      type: "number",
      min: "1",
      step: "1",
      placeholder: "Batch to open",
    },
  });
  const stashOpenButton: HTMLButtonElement = create("button", {
    content: "Stash Open",
    attributes: { title: "Open a subset/batch of the URLs in the Stash" },
    onClick: async () => {
      const batch: number = parseInt(batchNumberInput.value);
      try {
        await StashService.stashOpen(batch);
      } catch (error) {
        notify("Open failed: ", errorToString(error));
        return;
      }
      if (batch) {
        notify("Successfully opened batch #", batch.toString());
      } else {
        notify("Open successful!");
      }
    },
  });
  return create("div", { content: [batchNumberInput, stashOpenButton] });
})();

export const stashNoteComponent: HTMLElement = (() => {
  const stashNoteInput: HTMLTextAreaElement = create("textarea", {
    attributes: { type: "number", step: "1", placeholder: "Notes", rows: "3" },
    onCreate: async (textarea) => {
      const notes = await NotesService.getNotes();
      const url = await getUrl();
      textarea.value = notes[url] ?? "";
    },
  });
  const stashNoteButton: HTMLButtonElement = create("button", {
    content: "Stash Note",
    attributes: {
      title: "Save given text as note for current URL",
    },
    onClick: async () => {
      const url = await getUrl();
      const { stash } = await StashService.getStashData();
      if (!stash.includes(url)) {
        notify("Failed to save note: URL not found in Stash");
        return;
      }

      const notes = await NotesService.getNotes();
      notes[url] = stashNoteInput.value;
      try {
        await NotesService.saveNotes(notes);
      } catch (error) {
        notify("Failed to save note: ", errorToString(error));
        return;
      }
      notify("Successfully saved note");
    },
  });
  return create("div", { content: [stashNoteInput, stashNoteButton] });
})();

export const stashSettingsComponent: HTMLButtonElement = create("button", {
  content: "Stash Options",
  attributes: { title: "Open the options page for Stash" },
  onClick: () => {
    chrome.tabs.create({ active: true, url: "/html/options.html" });
  },
});

export const stashImportComponent: HTMLElement = (() => {
  const fileInput: HTMLInputElement = create("input", {
    attributes: { type: "file" },
  });
  const stashImportButton: HTMLButtonElement = create("button", {
    content: "Stash Import",
    attributes: { title: "Replace the current stash with the selected file" },
    onClick: async () => {
      const file: File | undefined = fileInput?.files?.[0];
      if (file) {
        try {
          await ImportExportService.importStash(file);
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
  attributes: { title: "Export the current stash as a text file" },
  onClick: async () => {
    try {
      await ImportExportService.exportStash();
    } catch (error) {
      notify("Export failed: ", errorToString(error));
    }
  },
});

export const stashClearComponent: HTMLButtonElement = create("button", {
  content: "Stash Clear",
  attributes: { title: "Export the current Stash and then empty it" },
  onClick: async () => {
    try {
      await ImportExportService.exportStash();
      await StashService.stashClear();
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
      type: "number",
      min: "1",
      step: "1",
      placeholder: "Batch size",
    },
    onCreate: async (input) => {
      input.value = (await SettingsService.getSettings()).batchSize.toString();
    },
  });
  const stashBatchSizeButton: HTMLButtonElement = create("button", {
    content: "Set Stash Batch Size",
    attributes: { title: "Set the batch size used by Batch Open" },
    onClick: async () => {
      const settings: Settings = await SettingsService.getSettings();
      const newBatchSize = parseInt(stashBatchSizeInput.value);
      if (!newBatchSize || newBatchSize < 1) {
        alert("Invalid batch size provided.");
      } else {
        try {
          await SettingsService.saveSettings({
            ...settings,
            batchSize: newBatchSize,
          });
        } catch (error) {
          notify("Batch size update failed: ", errorToString(error));
          return;
        }
        notify("Batch size updated!");
      }
    },
  });
  return create("div", {
    content: [stashBatchSizeInput, stashBatchSizeButton],
  });
})();

export const stashBumpAmountComponent: HTMLElement = (() => {
  const stashBumpAmountInput: HTMLInputElement = create("input", {
    attributes: {
      type: "number",
      min: "1",
      step: "1",
      placeholder: "Default bump amount",
    },
    onCreate: async (input) => {
      input.value = (
        await SettingsService.getSettings()
      ).defaultBump.toString();
    },
  });
  const stashBumpAmountButton: HTMLButtonElement = create("button", {
    content: "Set Default Stash Bump Amount",
    attributes: { title: "Set the default bump amount used by Stash Bump" },
    onClick: async () => {
      const settings: Settings = await SettingsService.getSettings();
      const newBumpAmount = parseInt(stashBumpAmountInput.value);
      if (!newBumpAmount) {
        alert("Invalid bump amount provided.");
      } else {
        try {
          await SettingsService.saveSettings({
            ...settings,
            defaultBump: newBumpAmount,
          });
        } catch (error) {
          notify("Bump amount update failed: ", errorToString(error));
          return;
        }
        notify("Default bump amount updated!");
      }
    },
  });
  return create("div", {
    content: [stashBumpAmountInput, stashBumpAmountButton],
  });
})();
