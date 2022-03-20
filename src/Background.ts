import SettingsService from "./SettingsService.js";
import StashService from "./StashService.js";
import { notify, getUrl, errorToString } from "./Util.js";

/**
 * Listen for and handle keyboard shortcuts.
 */
chrome.commands.onCommand.addListener(async (command: string) => {
  const url: string = await getUrl();
  switch (command) {
    case "add": {
      try {
        await StashService.stashAdd(url);
      } catch (error) {
        notify("Add failed: ", errorToString(error));
        break;
      }
      notify("Add successful!");
      break;
    }

    case "remove": {
      try {
        await StashService.stashRemove(url);
      } catch (error) {
        notify("Remove failed: ", errorToString(error));
        break;
      }
      notify("Remove successful!");
      break;
    }

    case "bump": {
      let bumpAmount: number | undefined;
      try {
        bumpAmount= (await SettingsService.getSettings()).defaultBump;
        await StashService.stashBump(url, bumpAmount);
      } catch (error) {
        notify("Bump failed: ", errorToString(error));
        return;
      }
      notify("Successfully bumped item by ", bumpAmount.toString());
      break;
    }

    default:
      break;
  }
});
