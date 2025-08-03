import "dotenv/config";
import { GoogleGenAI, Modality } from "@google/genai";
import * as fs from "node:fs";
import { Router } from "express";
import * as pkg from "wavefile";
import { Prompt } from "../../../config/prompt";
import { WebSocketServer, WebSocket } from "ws";
import { webmToPCM } from "../../../lib/createRawPcm";

const WaveFile = pkg.WaveFile;
const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY_TTS });

const model = "gemini-2.5-flash-preview-native-audio-dialog";

const config = {
  responseModalities: [Modality.AUDIO],
  systemInstruction: `${Prompt}`,
};

// Interface to extend WebSocket with session-specific data
interface WebSocketWithSession extends WebSocket {
  geminiSession?: any;
  responseQueue?: any[]; // Queue for raw messages from Gemini API
  currentTurnAudioChunks?: Buffer[]; // To store audio chunks for the current turn
  turnCompletePromiseResolve?: (value: any) => void; // To resolve when a turn is complete
}

export function wsListener(wss: WebSocketServer) {
  wss.on("connection", (socket: WebSocketWithSession) => {
    console.log("New WebSocket connection established.");

    socket.responseQueue = []; // Initialize response queue for this socket
    socket.currentTurnAudioChunks = []; // Initialize audio chunks array for this socket

    // Function to wait for messages from the session's response queue
    async function waitMessage(queue: any[]): Promise<any> {
      let message = undefined;
      while (!message) {
        message = queue.shift();
        if (!message) {
          await new Promise((resolve) => setTimeout(resolve, 100)); // Wait a bit before checking again
        }
      }
      return message;
    }

    // Connect to Gemini Live once per WebSocket connection
    ai.live.connect({
      model: model,
      callbacks: {
        onopen: function () {
          console.debug("Gemini Live session opened for this WebSocket.");
        },
        onmessage: function (message) {
          if (socket.responseQueue) {
            socket.responseQueue.push(message);

            // If there's audio data, add it to the current turn's chunks
            if (message.data) {
              const audioBuffer = Buffer.from(message.data, "base64");
              socket.currentTurnAudioChunks?.push(audioBuffer);
              // Optionally, stream this audio back to the client immediately
              socket.send(audioBuffer);
            }

            // Check for turn completion
            if (message.serverContent && message.serverContent.turnComplete) {
              console.debug("--- Turn Complete Flag Received ---");
              // Resolve the promise if waiting for turn completion
              if (socket.turnCompletePromiseResolve) {
                socket.turnCompletePromiseResolve(true);
                socket.turnCompletePromiseResolve = undefined; // Reset for next turn
              }
            }
          }
        },
        onerror: function (e) {
          console.error("Gemini Live session error:", e.message);
        },
        onclose: function (e) {
          console.debug("Gemini Live session closed:", e.reason);
          delete socket.geminiSession;
          delete socket.responseQueue;
          delete socket.currentTurnAudioChunks;
          delete socket.turnCompletePromiseResolve;
        },
      },
      config: config,
    })
      .then((session) => {
        socket.geminiSession = session;
        console.log("Gemini Live session connected and stored on socket.");
      })
      .catch((error) => {
        console.error("Failed to connect to Gemini Live:", error);
        socket.close();
      });

    socket.on("message", async (message: Buffer) => {
      try {
        if (!socket.geminiSession) {
          console.warn(
            "Gemini Live session not yet established for this socket. Dropping message."
          );
          return;
        }

        const pcmBuffer = await webmToPCM(message);
        const rawPcmBuffer = pcmBuffer;
        console.log(
          `Sending ${rawPcmBuffer.length} bytes of PCM audio to Gemini Live.`
        );

        const base64Audio = rawPcmBuffer.toString("base64");

        // Clear previous turn's audio chunks and prepare for the new turn
        socket.currentTurnAudioChunks = [];

        // Create a promise that resolves when the turn is complete
        const turnCompletePromise = new Promise((resolve) => {
          socket.turnCompletePromiseResolve = resolve;
        });

        socket.geminiSession.sendRealtimeInput({
          audio: {
            data: base64Audio,
            mimeType: "audio/pcm;rate=16000",
          },
        });
        console.log("Audio input sent to Gemini Live.");

        // Wait for the turn to complete
        await turnCompletePromise;
        console.log("Turn completed. Saving audio...");

        // Combine all audio chunks for this turn
        if (socket.currentTurnAudioChunks && socket.currentTurnAudioChunks.length > 0) {
          // Flatten the array of Buffers into a single Buffer
          const combinedBuffer = Buffer.concat(socket.currentTurnAudioChunks);

          // Convert combined Buffer to Int16Array for WaveFile
          const audioInt16 = new Int16Array(
            combinedBuffer.buffer,
            combinedBuffer.byteOffset,
            combinedBuffer.byteLength / Int16Array.BYTES_PER_ELEMENT
          );

          // Create a new WaveFile instance
          const wf = new WaveFile();
          // Gemini Live Native Audio output is 24kHz, 16-bit, mono (1 channel)
          wf.fromScratch(1, 24000, "16", audioInt16);

          // Generate a unique filename (e.g., using a timestamp)
          const filename = `out.wav`;
          fs.writeFileSync(filename, wf.toBuffer());
          console.log(`Saved Gemini response to ${filename}`);
        } else {
          console.warn("No audio chunks received for this turn to save.");
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
      }
    });

    socket.on("close", () => {
      console.log("WebSocket connection closed.");
      if (
        socket.geminiSession &&
        typeof socket.geminiSession.close === "function"
      ) {
        socket.geminiSession.close();
      }
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      if (
        socket.geminiSession &&
        typeof socket.geminiSession.close === "function"
      ) {
        socket.geminiSession.close();
      }
    });
  });
}

export { router };