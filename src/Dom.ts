import { arrify } from './Util.js';

interface CreateElementOptions {
  id?: string;
  /**
   * Style class(es) for the element. No whitespace allowed.
   */
  classes?: string | string[];
  /**
   * Child nodes for the HTML element
   */
  content?: (Node | string) | (Node | string)[];
  onClick?: () => void;
  attributes?: Record<string, string>;
}

/**
 * Creates an HTML elements with the given parameters.
 * @param tag Tag for the HTML element.
 * @param options Options to set additional properties for the HTML element.
 * @returns HTML element configured according to the given parameters.
 */
export function create<K extends keyof HTMLElementTagNameMap>(
  tag: K, 
  options: CreateElementOptions = {}
): HTMLElementTagNameMap[K] {
  const element: HTMLElementTagNameMap[K] = document.createElement(tag);
  const { id, classes, content, onClick, attributes } = options;

  if (content) {
    arrify(content)
      .map(x => typeof x === 'string' ? document.createTextNode(x) : x)
      .forEach(x => element.appendChild(x));
  }
  if (id) { element.setAttribute('id', id); }
  if (classes) { element.classList.add(...arrify(classes)); }
  if (onClick) { element.addEventListener('click', onClick); }
  if (attributes) {
    Object.entries(attributes).forEach(([k, v]) => element.setAttribute(k, v));
  }

  return element;
}