
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const parseDomainResponse = (responseText: string): string[] => {
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("No JSON found in response", responseText);
      return [];
    }
    const json = JSON.parse(jsonMatch[0]);
    if (json.domains && Array.isArray(json.domains)) {
      return json.domains;
    }
  } catch (e) {
    console.error("Failed to parse JSON response:", e);
  }
  return [];
};

export const generateDomainNames = async (description: string, existingNames: string[] = [], apiKey?: string): Promise<string[]> => {
  const effectiveApiKey = apiKey || process.env.GEMINI_API_KEY;

  if (!effectiveApiKey) {
    throw new Error("Gemini API Key is missing. Please provide it in the settings.");
  }

  const genAI = new GoogleGenerativeAI(effectiveApiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // Set generation config to ensure JSON output
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.9
    }
  });

  try {
    const systemInstruction = `You are an expert domain name generator with two primary modes: Factual Retrieval and Creative Brainstorming. Your goal is to provide highly relevant and brandable domain name ideas.

**Mode 1: Factual Retrieval (High Priority)**
If the user's prompt references a specific real-world entity, extract actual titles, character names, key terms, and concepts related to that entity. These factual keywords are your MOST IMPORTANT suggestions.

**Mode 2: Creative Brainstorming**
After providing fact-based names, or if the prompt is purely abstract, you can generate creative, brandable names.

**Crucial Output Rules:**
- **Provide ONLY the root domain name.** Do not include TLDs like .com.
- **Do not add generic suffixes** like 'fans', 'club', 'verse', unless it's a highly creative part of a new, invented name.
- **Preserve Spelling:** When combining multiple words from a title (e.g., 'Human After All'), you MUST merge them by simply removing the spaces, without dropping any letters. Correct: 'humanafterall'. Incorrect: 'humanfterall'.
- You MUST respond with ONLY a valid JSON object in the format {"domains": ["name1", "name2", ...]}.`;

    let userPrompt = `Generate a list of 30 domain name ideas for: "${description}".`;
    if (existingNames.length > 0) {
      userPrompt += ` Provide completely new ideas that are not on this list: ${existingNames.join(', ')}.`;
    }

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemInstruction + "\n\n" + userPrompt }] }
      ]
    });

    const response = await result.response;
    const responseText = response.text();

    return parseDomainResponse(responseText);
  } catch (error: any) {
    console.error("Error generating domain names:", error);
    // Propagate the actual error message
    throw new Error(error.message || "Failed to generate domain names from AI.");
  }
};
