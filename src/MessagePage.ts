/**
 * Tiny script to write the message specified in the url's query params onto
 * the document's title and body. This file is referenced in messagePage.html.
 */
const message: string =
  new URLSearchParams(window.location.search).get("message") || "???";
document
  .getElementById("message")
  ?.appendChild(document.createTextNode(message));
document.title = message;
