// src/services/geminiLiveService.ts
import { GoogleGenAI, Modality } from "@google/genai";
import { Prompt } from "../config/prompt";

const GEMINI_LIVE_MODEL = "gemini-2.5-flash-preview-native-audio-dialog";

export class GeminiLiveService {
    private ai: GoogleGenAI;
    private liveConfig: { responseModalities: Modality[]; systemInstruction: string };

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
        this.liveConfig = {
            responseModalities: [Modality.AUDIO, Modality.TEXT],
            systemInstruction: Prompt,
        };
    }

    public async connect(callbacks: any): Promise<any> {
        return this.ai.live.connect({
            model: GEMINI_LIVE_MODEL,
            callbacks: callbacks,
            config: this.liveConfig,
        });
    }
}