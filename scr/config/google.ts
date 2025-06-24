import { GoogleGenerativeAI } from "@google/generative-ai";
import { Prompt } from "./prompt";

import "dotenv/config";


const ai = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`);

const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

const chat = model.startChat({
  history: [], // You can pre-populate history here if you have it
});

export async function Main(text: string) {
  console.log("Chatbot initialized.");
  const history = await chat.getHistory();
  console.log(history);
  if (history.length === 0) {
    const response = await chat.sendMessageStream(Prompt);

    console.log((await response.response).text());

    const firstRes =((await response.response).text());

    return firstRes;
  } else {
    try {
      const result = await chat.sendMessageStream(text);
      console.log("usermessage", text);

      console.log("AI: "); // Prepare for streaming output
      for await (const chunk of result.stream) {
        process.stdout.write(chunk.text()); // Print each chunk as it arrives
      }
      console.log("\n"); // Newline after the AI's complete response

      const AIText = (await result.response).text();

      return AIText;
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
}
