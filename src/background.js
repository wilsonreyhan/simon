import OpenAI from "openai";

let openai;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.type == "OPENAI_API_KEY_CHECK") {
    chrome.storage.local.get(["OPENAI_API_KEY"], (result) => {
      const success = handleAPIKey(
        result.OPENAI_API_KEY,
        sendResponse,
        request.type
      );
    });
  } else if (request.type == "SET_API_KEY") {
    handleAPIKey(request.key, sendResponse, request.type);
  } else if (request.type == "GENERATE_AI_RESPONSE") {
    handleAIResponse(request.prompt, sendResponse);
  }
  return true;
});

// handle OpenAI API Key.
// Returns true if API connection is successful, otherwise false.
async function handleAPIKey(key, sendResponse, type) {
  const OPENAI_API_KEY = key;

  if (!OPENAI_API_KEY) {
    console.error("Sending Missing Key response.");
    sendResponse({
      type: type,
      data: { success: false, report: "MISSING_KEY" },
    });
    return false;
  }

  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });

  try {
    console.log("Testing connection");
    await testConnection();
    console.log("SUCCESSFUL_API_CONNECTION");
    chrome.storage.local.set({ OPENAI_API_KEY: OPENAI_API_KEY });
    sendResponse({
      type: type,
      data: { success: true, report: "SUCCESSFUL_API_CONNECTION" },
    });
    return true;
  } catch (error) {
    console.error("INVALID_CREDENTIALS");
    sendResponse({
      type: type,
      data: { success: false, report: "INVALID_CREDENTIALS" },
    });
    return false;
  }
}

// Handle successful and unsuccessful AI response
function handleAIResponse(prompt, sendResponse) {
  generateAIResponse(prompt)
    .then((response) => sendResponse({ success: true, data: response }))
    .catch((error) => sendResponse({ success: false, data: error.message }));
}

// returns AI response to given prompt
async function generateAIResponse(prompt) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-4o-mini",
  });
  return chatCompletion;
}
// tests AI connection
async function testConnection() {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: "user", content: "Respond: 'This is a connection test'" },
    ],
    model: "gpt-4o-mini",
  });
  return chatCompletion;
}
