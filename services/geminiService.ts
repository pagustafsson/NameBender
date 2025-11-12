
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";

// Ensure the API key is available. In a real environment, this check is crucial.
// For this context, we assume `process.env.API_KEY` is populated.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might show a UI message or handle this more gracefully.
  console.warn("API_KEY environment variable not set. Using a placeholder. App functionality will be limited.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const generationConfig = {
  responseMimeType: "application/json",
};

// FIX: Updated safetySettings to use HarmCategory and HarmBlockThreshold enums from @google/genai.
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

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
  try {
    let prompt = `Generate a list of 10 creative, brandable, and short domain name ideas based on the following description: "${description}". The domain names must not include TLDs like .com. Only provide the root domain name. Ensure names are single words or very short phrases suitable for a URL.`;

    if (existingNames.length > 0) {
        prompt += ` Provide completely new ideas that are not on this list: ${existingNames.join(', ')}.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        // FIX: Moved safetySettings into the config object as it's not a valid top-level property for generateContent.
        config: { ...generationConfig, responseSchema: domainSchema, safetySettings },
    });
    
    return parseDomainResponse(response.text);
  } catch (error) {
    console.error("Error generating domain names:", error);
    throw new Error("Failed to generate domain names from AI. Please try again.");
  }
};

export const generateAlternativeNames = async (domainName: string): Promise<string[]> => {
    try {
        const prompt = `The domain name "${domainName}.com" is taken. Generate a list of 3 highly creative, brandable, and clever alternatives. The alternatives should be short, memorable, and related to the original idea. Do not include TLDs.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            // FIX: Moved safetySettings into the config object as it's not a valid top-level property for generateContent.
            config: { ...generationConfig, responseSchema: domainSchema, safetySettings },
        });

        return parseDomainResponse(response.text);
    } catch (error) {
        console.error(`Error generating alternatives for ${domainName}:`, error);
        throw new Error("Failed to generate alternatives from AI. Please try again.");
    }
};