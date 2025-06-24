import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import wav from "wav";
import { Router } from "express";
import { Main } from "../../../config/google";

import * as fs from 'fs/promises'; 



const router = Router()

router.post("/interview", async (req, res) => {
 
  const userText = req.body.name;

  const AIText = await Main(userText);


  console.log(AIText)

  async function saveWaveFile(
    filename: any,
    pcmData: any,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ) {
    return new Promise((resolve, reject) => {
      const writer = new wav.FileWriter(filename, {
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });

      writer.on("finish", resolve);
      writer.on("error", reject);

      writer.write(pcmData);

      writer.end();
    });
  }

  async function TTS() {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const aiQustions = await AIText;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [
        {
          parts: [
            {
              text: `${aiQustions}`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" },
          },
        },
      },
    });

     console.log("response", response)

    const data: any = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;



    const audioBuffer = Buffer.from(data, "base64");
    console.log("Base64 data length:", data.length);
    console.log("Decoded buffer length:", audioBuffer);
    const fileName = "out.wav";

    await saveWaveFile(fileName, audioBuffer);


    const fullWavFileBuffer = await fs.readFile(fileName);

    
    const base64Audio = fullWavFileBuffer.toString("base64");



    console.log("base64Audio is" + base64Audio.length)

    await fs.unlink(fileName);

       return base64Audio;
  }


   const AiAudio = await TTS()




  res.json({
    message: "hello world",
   //AIText: AIText,  
   AIAudio: AiAudio,
  });
});

export { router };
