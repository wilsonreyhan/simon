import OpenAI from "openai";

let openai;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == "OPENAI_API_KEY_CHECK") {
    console.log("Background received request:", request);
    chrome.storage.local.get(["OPENAI_API_KEY"], (result) => {
      const OPENAI_API_KEY = result.OPENAI_API_KEY;
      if (!OPENAI_API_KEY) {
        console.error("Sending Missing Key response.");
        sendResponse({ success: false, data: "MISSING_KEY" });
        return true;
      }
      openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
      });
      try {
        testConnection();
        console.log("SUCCESSFUL_API_CONNECTION");
        sendResponse({ success: true, data: "SUCCESSFUL_API_CONNECTION" });
      } catch (error) {
        console.error("INVALID_CREDENTIALS");
        sendResponse({ success: false, data: "INVALID_CREDENTIALS" });
      }
    });
    return true;
  }
});

async function generateAIResponse(prompt) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o-mini",
  });
  return chatCompletion;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type == "GENERATE_AI_RESPONSE") {
    console.log("Background received request:", request);
    generateAIResponse(request.prompt)
      .then((response) => sendResponse({ success: true, data: response }))
      .catch((error) => sendResponse({ success: false, data: error.message }));
    return true;
  }
});

async function testConnection() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "user", content: "Respond: 'This is a connection test'" },
    ],
    model: "gpt-4o-mini",
  });
  return chatCompletion;
}
