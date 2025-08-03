
export const SCORING_RUBRIC = `
Scoring Criteria (1-5 scale, 1=Poor, 5=Excellent):
1.  **Relevance:** How directly and accurately does the answer address the question?
2.  **Clarity & Conciseness:** Is the answer easy to understand and free of unnecessary information?
3.  **Depth of Knowledge:** Does the candidate demonstrate sufficient understanding of the topic?
4.  **Problem-Solving (if applicable):** Does the candidate provide a logical and effective approach to the problem? (Score N/A if not a problem-solving question)
5.  **Communication Quality:** Overall fluency, structure, and professionalism of the response.

Provide a JSON object with scores for each criterion and a brief explanation. Also, extract any key skills mentioned.
`;

export const EXPECTED_SCORE_JSON_FORMAT = `
{
    "relevance_score": number,
    "relevance_explanation": "string",
    "clarity_conciseness_score": number,
    "clarity_conciseness_explanation": "string",
    "depth_knowledge_score": number,
    "depth_knowledge_explanation": "string",
    "problem_solving_score": number | "N/A",
    "problem_solving_explanation": "string",
    "communication_quality_score": number,
    "communication_quality_explanation": "string",
    "key_skills_mentioned": string[],
    "overall_summary": "string"
}
`
