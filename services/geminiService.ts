
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult, ActionItem, ActionItemStatus, ActionItemUrgency, Topic } from '../types';

const parseJsonResponse = (jsonStr: string): AnalysisResult | null => {
    let contentToParse = jsonStr.trim();
    
    // The model might wrap the JSON in ```json ... ``` and add conversational text.
    // We extract the content within the first available fence.
    const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
    const match = contentToParse.match(fenceRegex);

    if (match && match[1]) {
        contentToParse = match[1].trim();
    }
    
    try {
        const parsed = JSON.parse(contentToParse);
        // Basic validation to ensure the parsed object matches our expected structure.
        if (parsed.topics && parsed.summary && parsed.actionItems) {
            const result: AnalysisResult = {
                ...parsed,
                topics: parsed.topics.map((topic: any): Topic => ({
                    name: topic.name || 'Unnamed Topic',
                    transcriptSections: Array.isArray(topic.transcriptSections) ? topic.transcriptSections : [],
                })),
                actionItems: parsed.actionItems.map((item: Omit<ActionItem, 'id'>, index: number) => ({
                    ...item,
                    id: `action-${Date.now()}-${index}`, // Add a unique ID
                    status: Object.values(ActionItemStatus).includes(item.status) ? item.status : ActionItemStatus.ToDo,
                    urgency: Object.values(ActionItemUrgency).includes(item.urgency) ? item.urgency : ActionItemUrgency.Medium,
                }))
            };
            return result;
        }
        console.error("Parsed JSON does not match expected structure. Object:", parsed);
        return null;
    } catch (e) {
        console.error("Failed to parse JSON response. Content attempted to parse:", contentToParse, "Error:", e);
        return null;
    }
};

export const analyzeTranscript = async (transcript: string, apiKey: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is required.");
  }
  if (!transcript.trim()) {
    throw new Error("Transcript cannot be empty.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Analyze the following meeting transcript and provide a structured JSON output.
    The JSON should have three top-level keys: "topics", "summary", and "actionItems".

    - "topics": An array of objects. Each object must have two keys:
      - "name": A string for the main topic discussed.
      - "transcriptSections": An array of strings, where each string is a direct quote or relevant excerpt from the transcript that pertains to this topic. Extract at least 2-3 relevant sections per topic.
    - "summary": An object with four keys:
      - "overview": A brief paragraph summarizing the meeting.
      - "mainPoints": An array of strings, with each string being a key takeaway or decision.
      - "conclusion": A paragraph summarizing the meeting's conclusion and next steps.
      - "unansweredQuestions": An array of strings for questions that were raised but not answered. Return an empty array if none.
    - "actionItems": An array of objects, where each object represents a task. Each object must have:
      - "task": A string describing the action item.
      - "assignedTo": A string with the name of the person(s) assigned. Use "Unassigned" if not specified.
      - "urgency": A string, must be one of "High", "Medium", or "Low".
      - "status": A string, must be "To Do".

    Transcript:
    ---
    ${transcript}
    ---

    Provide only the raw JSON output without any conversational text or markdown fences.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-04-17",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  const analysis = parseJsonResponse(response.text);
  if (!analysis) {
    throw new Error("Failed to process the transcript. The API returned an unexpected format.");
  }
  return analysis;
};

export const answerQuestion = async (transcript: string, question: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is required.");
  }
  if (!transcript.trim() || !question.trim()) {
    throw new Error("Transcript and question cannot be empty.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Based on the following transcript, please answer the user's question.
    Provide a concise and direct answer based only on the information in the transcript.
    If the answer is not in the transcript, state that the information is not available in the provided text.

    ---
    Transcript:
    ${transcript}
    ---
    Question: ${question}
    ---
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-04-17',
    contents: prompt,
  });

  return response.text;
};
