import { stashAdd, stashRemove, stashOpen, stashImport, stashExport } from "./stash.js";

document.getElementById("action-add").addEventListener("click", stashAdd);
document.getElementById("action-remove").addEventListener("click", stashRemove);
document.getElementById("action-open").addEventListener("click", stashOpen);
document.getElementById("action-import").addEventListener("click", stashImport);
document.getElementById("action-export").addEventListener("click", stashExport);
