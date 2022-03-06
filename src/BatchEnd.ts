/**
 * Tiny script to write the batch number specified in the url's query params
 * onto the document's title and body.
 */
 const batch = new URLSearchParams(window.location.search).get("batch") || "???";
 document.getElementById("batch")?.appendChild(document.createTextNode(batch));
 document.title = "End of Batch " + batch;
