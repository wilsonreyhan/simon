import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_API_KEY",
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
