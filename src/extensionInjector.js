"use strict";

// create a hidden element to store our image URL
const urlContainer = document.createElement("div");
urlContainer.id = "extension-url-container";
urlContainer.dataset.parrotUrl = chrome.runtime.getURL(
  "images/transparent_parrot.png"
);
urlContainer.style.display = "none";
(document.body || document.head || document.documentElement).appendChild(
  urlContainer
);

// message relay to communicate between webpage and extension/background contexts
window.addEventListener("message", function (event) {
  if (event.data.type == "FROM_WEBPAGE_TO_EXTENSION") {
    console.log("Injector received message:", event.data);
    chrome.runtime.sendMessage(event.data.message, (response) => {
      console.log(response);
      window.postMessage(
        {
          type: "FROM_EXTENSION_TO_WEBPAGE",
          response: response,
        },
        "*"
      );
    });
  }
});

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
