"use strict";

// message relay to communicate between webpage and background contexts
window.addEventListener("message", function (event) {
  if (event.data.type == "FROM_WEBPAGE_TO_EXTENSION") {
    console.log("Injector received message:", event.data);
    mediate(event.data.message);
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

// create a hidden element to store our parrot URL
function storeParrot() {
  const urlContainer = document.createElement("div");
  urlContainer.id = "extension-url-container";
  urlContainer.dataset.parrotUrl = chrome.runtime.getURL(
    "images/transparent_parrot.png"
  );
  urlContainer.style.display = "none";
  (document.body || document.head || document.documentElement).appendChild(
    urlContainer
  );
}

function mediate(receivedMessage) {
  chrome.runtime.sendMessage(receivedMessage, (response) => {
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

storeParrot();
addScript("dist/gmailJsLoader.js");
addScript("dist/extension.js");
