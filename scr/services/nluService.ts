
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SCORING_RUBRIC, EXPECTED_SCORE_JSON_FORMAT } from "../config/scoringRubric";

export class NluService {
    private ai: GoogleGenerativeAI;
    private nluModel: string;

    constructor(apiKey: string, modelName: string = "gemini-pro") {
        //@ts-ignore
        this.ai = new GoogleGenerativeAI({ apiKey});
        this.nluModel = modelName;
    }

    public async scoreCandidateAnswer(
        question: string,
        candidateAnswer: string,
        history: { role: string; parts: { text: string }[] }[]
    ): Promise<any> {
       const nluModelInstance = this.ai.getGenerativeModel({ model: this.nluModel });

        const prompt = `
        You are an AI interviewer evaluating a candidate's response.
        Here is the interview question: "${question}"
        Here is the candidate's transcribed response: "${candidateAnswer}"

        Consider the conversation history for context, but focus on evaluating the immediate response to the last question.
        Conversation History:
        ${history.map(turn => `${turn.role}: ${turn.parts.map(p => p.text).join('')}`).join('\n')}

        ${SCORING_RUBRIC}

        Expected JSON Output Format:
        ${EXPECTED_SCORE_JSON_FORMAT}
        `;

        try {
            const result = await nluModelInstance.generateContent(prompt);
            const responseText = result.response.text();
            console.log("Raw NLU model response:", responseText);

            let jsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
            const parsedScore = JSON.parse(jsonString);
            return parsedScore;
        } catch (error) {
            console.error("Error during NLU scoring:", error);
            console.error("Problematic candidate answer:", candidateAnswer);
            console.error("Problematic question:", question);
            return {
                error: "Failed to score answer",
                details: error instanceof Error ? error.message : String(error),
                rawAnswer: candidateAnswer,
                question: question
            };
        }
    }
}