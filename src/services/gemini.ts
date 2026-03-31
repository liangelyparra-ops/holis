import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GameCard {
  category: string;
  content: string;
  emoji: string;
}

export async function generateCardsFromText(text: string): Promise<GameCard[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Analyze the following text and generate a list of fun, provocative, or interesting party game cards. 
              The cards should be in Spanish. 
              Each card must have a category (e.g., "ACTUAR", "CONFESIÓN", "RETO", "VERDAD"), 
              the content of the card, and a relevant emoji.
              
              Text to analyze:
              ${text}
              
              Return the result as a JSON array of objects with properties: category, content, emoji.`
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING },
              content: { type: Type.STRING },
              emoji: { type: Type.STRING },
            },
            required: ["category", "content", "emoji"],
          },
        },
      },
    });

    const result = JSON.parse(response.text || "[]");
    return result;
  } catch (error) {
    console.error("Error generating cards:", error);
    return [];
  }
}
