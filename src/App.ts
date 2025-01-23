import { create } from "./Dom.js";
import {
  stashAddComponent,
  stashRemoveComponent,
  stashExportComponent,
  stashClearComponent,
  stashOpenComponent,
  stashBumpComponent,
  stashImportComponent,
  stashBatchSizeComponent,
  stashBumpAmountComponent,
  stashSettingsComponent,
  stashNoteComponent,
} from "./Elements.js";
import StashService from "./StashService.js";

const body: HTMLElement = document.body;
if (body.id === "popup-page") {
  [
    stashAddComponent,
    stashRemoveComponent,
    create("div", { classes: "hr" }),
    stashBumpComponent,
    create("div", { classes: "hr" }),
    stashOpenComponent,
    create("div", { classes: "hr" }),
    stashNoteComponent,
    create("div", { classes: "hr" }),
    stashSettingsComponent,
  ].forEach((x) => body.appendChild(x));
} else if (body.id === "options-page") {
  [
    create("h1", { content: "Stash Extension Options" }),
    create("div", {
      classes: "option-cards-wrapper",
      content: [
        create("div", {
          classes: "option-card",
          content: [
            create("h2", { content: "Import Stash" }),
            stashImportComponent,
          ],
        }),
        create("div", {
          classes: "option-card",
          content: [
            create("h2", { content: "Export Stash" }),
            stashExportComponent,
          ],
        }),
        create("div", {
          classes: "option-card",
          content: [
            create("h2", { content: "Clear Stash" }),
            stashClearComponent,
          ],
        }),
        create("div", {
          classes: "option-card",
          content: [
            create("h2", { content: "Set Stash Batch Size" }),
            stashBatchSizeComponent,
          ],
        }),
        create("div", {
          classes: "option-card",
          content: [
            create("h2", { content: "Set Default Bump Amount" }),
            stashBumpAmountComponent,
          ],
        }),
      ],
    }),
  ].forEach((x) => body.appendChild(x));
  (async () =>
    console.info("Current StashData", await StashService.getStashData()))();
  (window as any).StashService = StashService;
  (window as any).clearExtensionData = () => {
    // Clear all extension data for debugging purposes.
    chrome.storage.local.clear();
  };
}
