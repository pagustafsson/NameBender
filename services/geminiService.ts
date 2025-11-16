
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const domainSchema = {
  type: Type.OBJECT,
  properties: {
    domains: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of domain name ideas, without TLDs."
    },
  },
  required: ['domains'],
};

const parseDomainResponse = (responseText: string): string[] => {
    const jsonMatch = responseText.match(/{[\s\S]*}/);
    if (!jsonMatch) {
        console.error("No valid JSON object found in the AI response.");
        return [];
    }
    const sanitizedText = jsonMatch[0];
    const result = JSON.parse(sanitizedText);
    return (result.domains || []).map((domain: string) => domain.toLowerCase().replace(/[\s.]+/g, ''));
}

export const generateDomainNames = async (description: string, existingNames: string[] = []): Promise<string[]> => {
  let responseText = '';
  try {
    const systemInstruction = `You are an expert domain name generator with two primary modes: Factual Retrieval and Creative Brainstorming. Your goal is to provide highly relevant and brandable domain name ideas.

**Mode 1: Factual Retrieval (High Priority)**
If the user's prompt references a specific real-world entity, your primary task is to use the provided search tool to find factual information. Extract actual titles, character names, key terms, and concepts related to that entity. These factual keywords are your MOST IMPORTANT suggestions.

**Mode 2: Creative Brainstorming**
After providing fact-based names, or if the prompt is purely abstract, you can generate creative, brandable names.

**Crucial Output Rules:**
- **Provide ONLY the root domain name.** Do not include TLDs like .com.
- **Do not add generic suffixes** like 'fans', 'club', 'verse', unless it's a highly creative part of a new, invented name.
- **Preserve Spelling:** When combining multiple words from a title (e.g., 'Human After All'), you MUST merge them by simply removing the spaces, without dropping any letters. Correct: 'humanafterall'. Incorrect: 'humanfterall'.
- You MUST respond with ONLY a valid JSON object in the format \`{"domains": ["name1", "name2", ...]}\`.`;
    
    let userPrompt = `Generate a list of 10 domain name ideas for: "${description}".`;
    if (existingNames.length > 0) {
        userPrompt += ` Provide completely new ideas that are not on this list: ${existingNames.join(', ')}.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: { systemInstruction, tools: [{googleSearch: {}}] },
    });
    
    responseText = response.text;
    return parseDomainResponse(responseText);
  } catch (error) {
    console.error("Error generating domain names:", error, { responseText });
    throw new Error("Failed to generate domain names from AI.");
  }
};

export const generateAlternativeNames = async (domainName: string): Promise<string[]> => {
    let responseText = '';
    try {
        const systemInstruction = `You are an expert domain name generator. When a domain name is taken, your task is to generate 3 clever alternatives that are closely related to the original name.

Focus on these strategies:
1.  **Direct Variations:** Modify the original name by adding or changing prefixes/suffixes (e.g., for 'fesk', suggest 'feska', 'feskly', 'getfesk').
2.  **Close Synonyms & Concepts:** Find words that mean almost the same thing or are in the same immediate conceptual family.
3.  **Compound Words:** Combine the original name with a short, relevant word (e.g., 'feskco', 'feskflow').

Avoid generating names that are only abstractly or metaphorically related. The connection to the original name should be clear and direct. Provide only the root domain name. Respond in the requested JSON format.`;
        
        const prompt = `The domain name "${domainName}" is taken. Generate 3 alternatives.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction, responseMimeType: "application/json", responseSchema: domainSchema },
        });
        
        responseText = response.text;
        const sanitizedText = responseText.replace(/^```json\s*|```\s*$/g, '').trim();
        const result = JSON.parse(sanitizedText);
        return (result.domains || []).map((domain: string) => domain.toLowerCase().replace(/[\s.]+/g, ''));
    } catch (error) {
        console.error(`Error generating alternatives for ${domainName}:`, error, { responseText });
        throw new Error("Failed to generate alternatives from AI.");
    }
};
