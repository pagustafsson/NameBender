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
    const systemInstruction = `You are a world-class branding expert specializing in creating unique, memorable, and highly creative domain names. Your goal is to generate names that are as iconic and brandable as names like Nestic, Picular, Kludd, Google, Spotify, Airbnb, and FutureMemories.

Your creative process should explore these strategies:
- **Invented Words:** Create completely new, short, and phonetically pleasing words. They should be easy to say and remember, even if they don't have a prior meaning (e.g., Picular, Kludd, Nestic).
- **Evocative Compounds:** Join two words, especially those that create a poetic, intriguing, or conceptual contrast (e.g., FutureMemories, Circleback).
- **Creative Portmanteaus:** Cleverly blend parts of two or more relevant words to create a single, unique name (e.g., Spotify from 'spot' + 'identify').
- **Abstract & Musical Inspiration:** Draw inspiration from abstract concepts, art, and music. Think about how bands or songs are named—often with evocative, non-literal, or poetic phrases.

Crucial guidelines:
- **Relevance is Key:** While being highly creative, the names must remain conceptually relevant to the user's input description.
- **Radically Avoid Clichés:** Absolutely avoid common, generic startup patterns and buzzwords (e.g., -ify, -ly, spark, flow, flex, lexi, zenith, nexus, etc.). Your suggestions must feel fresh and original.
- **Length & Brandability:** Aim for names that are concise and easy to spell, but prioritize creativity over being overly simplistic. A slightly longer, clever name is better than a short, generic one.
- **Format:** Provide only the root domain name, without TLDs. Ensure names are single words or compounds suitable for a URL.

You must always respond in the requested JSON format.`;
    
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
        const systemInstruction = `You are a world-class branding expert. When a domain name is taken, your task is to generate 3 even more creative, clever, and brandable alternatives. The quality should be on par with iconic names like Nestic, Picular, Kludd, Spotify, or FutureMemories.

Your creative process for alternatives should explore these strategies:
- **Invented Words:** Create completely new, short, and phonetically pleasing words related to the original concept (e.g., Picular, Kludd).
- **Evocative Compounds:** Join two words to create a poetic or intriguing phrase that captures the essence of the original name in a new light (e.g., FutureMemories).
- **Creative Portmanteaus:** Blend parts of words to create a unique, meaningful alternative.
- **Abstract & Musical Inspiration:** Think abstractly. How would a musician or artist name this concept?

Crucial guidelines:
- **Radically Avoid Clichés:** Absolutely avoid common, generic startup patterns and buzzwords (e.g., -ify, -ly, spark, flow, flex, lexi, zenith, nexus). The alternatives must be original.
- **Be a True Alternative:** Don't just add a prefix or suffix. The suggestions should be genuinely different yet conceptually related.
- **Format:** Provide only the root domain name, without TLDs. Ensure names are single words or compounds suitable for a URL.

You must always respond in the requested JSON format.`;
        
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