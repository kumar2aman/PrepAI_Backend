// import "dotenv/config";
// import { GoogleGenAI } from "@google/genai";

// import { Router } from "express";
// import { Main } from "../../../config/google";

// import * as fs from "fs/promises";
// import { saveWaveFile } from "../../../lib/saveWavFile";

// const router = Router();

// router.get("/interview", async (req, res) => {
//   const userText = req.body.name;

//   const AIText = await Main(userText);

//   console.log(AIText);

//   async function TTS() {

//     const startTime  = Date.now();
//     const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//     const aiQustions = await AIText;

//     console.log(`--- Starting TTS for text: "${aiQustions?.substring(0, 50)}..."`);

//     const apiCallStart = Date.now();

//     const response = await ai.models.generateContent({
//       model: "gemini-2.5-flash-preview-tts",
//       contents: [
//         {
//           parts: [
//             {
//              text: `hello `,
//             },
//           ],
//         },
//       ],
//       config: {
//         responseModalities: ["AUDIO"],
//         speechConfig: {
//           voiceConfig: {
//             prebuiltVoiceConfig: { voiceName: "Kore" },
//           },
//         },
//       },
//     });

//     const apiCallEnd = Date.now();

//     console.log(`1. Gemini API call time: ${apiCallEnd - apiCallStart}ms`);

//     const data: any =
//       response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

//     const audioBuffer = Buffer.from(data, "base64");
//     console.log("Base64 data length:", data.length);
//     console.log("Decoded buffer length:", audioBuffer);

//     const saveFileStart = Date.now();
//     const fileName = "out.wav";

//     await saveWaveFile(fileName, audioBuffer);

//     const saveFileEnd = Date.now();

//     console.log(`2. saveWaveFile time: ${saveFileEnd - saveFileStart}ms`);

//     const readFileStart = Date.now();

//     const fullWavFileBuffer = await fs.readFile(fileName);

//     const readFileEnd = Date.now();

//     console.log(`3. fs.readFile time: ${readFileEnd - readFileStart}ms`);
//     console.log(`   Read full WAV file buffer length: ${fullWavFileBuffer.length}`);


   
//     const encodeStart = Date.now();
//     const base64Audio = fullWavFileBuffer.toString("base64");
//     const encodeEnd = Date.now();
//     console.log(`4. Base64 encoding time: ${encodeEnd - encodeStart}ms`);
//     console.log(`   Final Base64Audio string length: ${base64Audio.length}`);

//     console.log(`   Read full WAV file buffer length: ${fullWavFileBuffer.length}`);



//     await fs.unlink(fileName);

//     const totalEndTime = Date.now();

//     console.log(`--- Total TTS function execution time: ${totalEndTime - startTime}ms ---`);

//     return base64Audio;
//   }

//   const AiAudio = await TTS();

//   res.json({
//     message: "hello world",
//     //AIText: AIText,
//     AIAudio: AiAudio,
//   });
// });

// export { router };
