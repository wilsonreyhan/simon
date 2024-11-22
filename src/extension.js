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

// logs messages sent from extension context in webpage
window.addEventListener("message", function (event) {
  if (event.data.type == "FROM_EXTENSION_TO_WEBPAGE") {
    logMessages(event.data.response);
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

// add Simon button to gmail compose window
function addSimonButton(gmail, compose) {
  const parrotUrl = document.getElementById("extension-url-container").dataset
    .parrotUrl;

  gmail.tools.add_compose_button(
    compose,
    `<img src="${parrotUrl}" style="width: 20px; height: 20px;" alt="Parrot Icon" />`,
    async () => {
      window.postMessage(
        {
          type: "FROM_WEBPAGE_TO_EXTENSION",
          message: {
            type: "GENERATE_AI_RESPONSE",
            prompt: "Say this is a test.",
          },
        },
        "*"
      );
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
