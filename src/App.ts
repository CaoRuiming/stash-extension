import { create } from './Dom.js';
import {
  stashAddButton,
  stashRemoveButton,
  stashOpenButton,
  stashExportButton,
  fileInput,
  stashImportButton,
  batchNumberInput,
  stashBumpInput,
  stashBumpButton,
  stashClearButton,
} from './Elements.js';
import StashService from './StashService.js';

const body: HTMLElement = document.body;
if (body.id === 'popup-page') {
  [
    stashAddButton,
    stashRemoveButton,
    create('div', { classes: 'hr' }),
    stashBumpInput,
    stashBumpButton,
    create('div', { classes: 'hr' }),
    batchNumberInput,
    stashOpenButton,
  ].forEach(x => body.appendChild(x));
} else if (body.id === 'options-page') {
  [
    create('h1', { content: 'Stash Extension Options' }),
    create('div', {
      classes: 'option-cards-wrapper', 
      content: [
        create('div', {
          classes: 'option-card', 
          content: [create('h2', { content: 'Import Stash' }), fileInput, stashImportButton],
        }),
        create('div', {
          classes: 'option-card', 
          content: [create('h2', { content: 'Export Stash' }), stashExportButton],
        }),
        create('div', {
          classes: 'option-card', 
          content: [create('h2', { content: 'Clear Stash' }), stashClearButton],
        }),
      ],
    }),
  ].forEach(x => body.appendChild(x));
  (async () => console.info('Current Stash', await StashService.getStash()))();
}
