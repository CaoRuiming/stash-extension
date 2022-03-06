import { create } from './Dom.js';
import {
  stashAddButton,
  stashRemoveButton,
  stashOpenButton,
  stashExportButton,
  fileInput,
  stashImportButton,
  batchNumberInput,
} from './Elements.js';

const body: HTMLElement = document.body;
if (body.id === 'popup-page') {
  [
    stashAddButton,
    stashRemoveButton,
    create('div', { classes: 'hr' }),
    batchNumberInput,
    stashOpenButton,
  ].forEach(x => body.appendChild(x));
} else if (body.id === 'options-page') {
  [
    create('h1', { content: 'Stash Extension Options' }),
    create('div', {
      classes: 'option-card-wrapper', 
      content: [
        create('div', {
          classes: 'option-card', 
          content: [create('h2', { content: 'Import Stash' }), fileInput, stashImportButton],
        }),
        create('div', {
          classes: 'option-card', 
          content: [create('h2', { content: 'Export Stash' }), stashExportButton],
        }),
      ],
    }),
  ].forEach(x => body.appendChild(x));
}
