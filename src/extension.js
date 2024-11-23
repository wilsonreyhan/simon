"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
  if (!window._gmailjs) {
    return;
  }

  clearInterval(loaderId);
  startExtension(window._gmailjs);
}, 100);

// for future referece, if we want to print ai reponses
// console.log("AI Response: " + response.data.choices[0].message.content);

let apiCheck;

// logs messages sent from extension context in webpage
window.addEventListener("message", function (event) {
  const response = event.data.response;
  if (event.data.type == "FROM_EXTENSION_TO_WEBPAGE") {
    logMessages(event.data.response);
    if (response.type == "OPENAI_API_KEY_CHECK") {
      apiCheck = response.data;
    }
  }
});

// launch extension
function startExtension(gmail) {
  window.gmail = gmail;

  gmail.observe.on("load", () => {
    intialAPICheck();
  });

  gmail.observe.on("view_email", (domEmail) => {
    // vars for future reference
    const threadData = gmail.new.get.thread_data(domEmail);
    const threadEmails = threadData.emails;
  });

  gmail.observe.on("compose", (compose) => {
    addSimonButton(gmail, compose);
  });
}

// initialize API Key verification process
function intialAPICheck() {
  window.postMessage(
    {
      type: "FROM_WEBPAGE_TO_EXTENSION",
      message: {
        type: "OPENAI_API_KEY_CHECK",
      },
    },
    "*"
  );
}

// given a key, send key to background to be set
function setAPIKey(key) {
  window.postMessage(
    {
      type: "FROM_WEBPAGE_TO_EXTENSION",
      message: {
        type: "SET_API_KEY",
        key: key,
      },
    },
    "*"
  );
}

// add Simon button to gmail compose window
function addSimonButton(gmail, compose) {
  const parrotUrl = document.getElementById("extension-url-container").dataset
    .parrotUrl;

  gmail.tools.add_compose_button(
    compose,
    `<img src="${parrotUrl}" style="width: 20px; height: 20px;" alt="Parrot Icon" />`,
    async () => {
      keyCheckLoop();
    },
    ""
  );
}
// log messages
function logMessages(message) {
  if (message.success) {
    console.log(message);
  } else {
    console.error("Error: ", message.data);
  }
}

// based on background.js response, prompt user for key
function promptForKey(data) {
  let key;
  if (data.report == "MISSING_KEY") {
    key = prompt("Please enter your Open AI API Key to utilize Simon!");
  } else if (data.report == "INVALID_CREDENTIALS") {
    key = prompt("The API Key you entered invalid. Please enter a valid key!");
  }
  key = stripQuotation(key);
  console.log(key);
  return key;
}

// loop until valid key is entered or user cancels
async function keyCheckLoop() {
  while (!apiCheck.success) {
    const key = promptForKey(apiCheck);
    if (!key) {
      return;
    }
    await setAPIKeyAndWait(key);
  }
}

// async API Key setting function. set key and
// return promise which listens to background.js response
function setAPIKeyAndWait(key) {
  setAPIKey(key);
  return new Promise((resolve) => {
    // listen for response
    window.addEventListener("message", function listener(event) {
      const response = event.data.response;
      console.log("setAPIKeyAndWait received response: ", response);
      if (
        event.data.type == "FROM_EXTENSION_TO_WEBPAGE" &&
        response.type == "SET_API_KEY"
      ) {
        apiCheck = response.data;
        this.window.removeEventListener("message", listener);
        resolve();
      }
    });
  });
}

// strip key ""
function stripQuotation(key) {
  key = key.replace(/^["'](.*)["']$/, "$1");
  return key;
}
