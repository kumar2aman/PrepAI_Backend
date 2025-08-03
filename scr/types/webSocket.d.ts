
import { WebSocket } from "ws";

// Extend WebSocket with custom properties for session management

 export interface WebSocketWithSession extends WebSocket {
    geminiSession?: any;  // GoogleGenAI.live.connect session
    responseQueue?: any[]; // Queue for raw messages from Gemini API
    currentTurnAudioChunks?: Buffer[]; // To store audio chunks for the current turn
    turnCompletePromiseResolve?: (value: any) => void; // To resolve when an AI turn is complete
    currentQuestion?: string; // To store the current question asked by the AI
    currentCandidateAnswerText?: string; // To store the candidate's transcribed answer for the current turn
    conversationHistory: { role: string; parts: { text: string }[] }[]; // Store conversation for context
    interviewScores: { question: string; score: any; rawAnswer: string }[]; // Store scores for each question
    awaitingUserTranscriptionResolve?: (value: string) => void; // Promise resolver for user's full transcription
  }

