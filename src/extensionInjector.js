"use strict";

// Create a hidden element to store our image URL
const urlContainer = document.createElement("div");
urlContainer.id = "extension-url-container";
urlContainer.dataset.parrotUrl = chrome.runtime.getURL(
  "images/transparent_parrot.png"
);
urlContainer.style.display = "none";
(document.body || document.head || document.documentElement).appendChild(
  urlContainer
);

function addScript(src) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = chrome.runtime.getURL(src);
  (document.body || document.head || document.documentElement).appendChild(
    script
  );
}

addScript("dist/gmailJsLoader.js");
addScript("dist/extension.js");
