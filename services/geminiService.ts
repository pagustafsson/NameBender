

import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available. In a real environment, this check is crucial.
// For this context, we assume `process.env.API_KEY` is populated.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a UI message or handle this more gracefully.
  console.warn("API_KEY environment variable not set. Using a placeholder. App functionality will be limited.");
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
    // Sanitize the response to handle potential markdown code blocks
    const sanitizedText = responseText.replace(/^```json\s*|```\s*$/g, '').trim();
    const result = JSON.parse(sanitizedText);
    return (result.domains || []).map((domain: string) => domain.toLowerCase().replace(/[\s.]+/g, ''));
}

export const generateDomainNames = async (description: string, existingNames: string[] = []): Promise<string[]> => {
  let responseText = '';
  try {
    const systemInstruction = "You are an expert domain name generator. Your task is to generate creative, brandable, and short domain name ideas based on a user-provided description. The domain names must not include TLDs like .com. You must only provide the root domain name. Ensure names are single words or very short phrases suitable for a URL. You must always respond in the requested JSON format, even if the user's description is very short or just a single word.";
    
    let userPrompt = `Generate a list of 10 creative domain name ideas for: "${description}".`;

    if (existingNames.length > 0) {
        userPrompt += ` Provide completely new ideas that are not on this list: ${existingNames.join(', ')}.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: { 
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: domainSchema, 
        },
    });
    
    responseText = response.text;
    return parseDomainResponse(responseText);
  } catch (error) {
    console.error("Error generating domain names:", error);
    if (responseText) {
        console.error("AI Response that failed to parse:", responseText);
    }
    throw new Error("Failed to generate domain names from AI. Please try again.");
  }
};

export const generateAlternativeNames = async (domainName: string): Promise<string[]> => {
    let responseText = '';
    try {
        const systemInstruction = "You are an expert domain name generator. When a domain name is taken, you provide 3 creative, brandable, and clever alternatives. The alternatives should be short, memorable, and related to the original idea. Do not include TLDs. You must always respond in the requested JSON format.";
        
        const prompt = `The domain name "${domainName}" is taken. Generate alternatives.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { 
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: domainSchema, 
            },
        });
        
        responseText = response.text;
        return parseDomainResponse(responseText);
    } catch (error) {
        console.error(`Error generating alternatives for ${domainName}:`, error);
        if (responseText) {
            console.error("AI Response that failed to parse:", responseText);
        }
        throw new Error("Failed to generate alternatives from AI. Please try again.");
    }
};