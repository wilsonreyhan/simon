"use strict";

// loader-code: wait until gmailjs has finished loading, before triggering actual extensiode-code.
const loaderId = setInterval(() => {
  if (!window._gmailjs) {
    return;
  }

  clearInterval(loaderId);
  startExtension(window._gmailjs);
}, 100);

/* // parse HTML code to Text
function htmlToText(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  return doc.body.textContent.trim();
} */

window.addEventListener("message", function (event) {
  if (event.data.type == "FROM_EXTENSION_TO_WEBPAGE") {
    const response = event.data.response;
    if (response.success) {
      // for printing chat responses
      // console.log("AI Response: " + response.data.choices[0].message.content);

      // for API Key testing
      console.log(response);
    } else {
      console.log("Error: ", response.data);
    }
  }
});

function startExtension(gmail) {
  console.log("Extension loading...");
  window.gmail = gmail;

  gmail.observe.on("load", () => {
    const userEmail = gmail.get.user_email();
    console.log("Hello, " + userEmail + ". This is Simon talking!");
    window.postMessage(
      {
        type: "FROM_WEBPAGE_TO_EXTENSION",
        message: {
          type: "OPENAI_API_KEY_CHECK",
        },
      },
      "*"
    );

    gmail.observe.on("view_email", (domEmail) => {
      console.log("Looking at email:", domEmail);
      const threadData = gmail.new.get.thread_data(domEmail);
      const threadEmails = threadData.emails;
      // const text = htmlToText(emailData.content_html);
      console.log("Thread data:", threadData);
      console.log("Thread Emails: ", threadEmails);
    });

    gmail.observe.on("compose", (compose) => {
      console.log("New compose window is opened!", compose);
      console.log("Compose Ref", gmail.dom.compose());

      const parrotUrl = document.getElementById("extension-url-container")
        .dataset.parrotUrl;

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
    });
  });
}
