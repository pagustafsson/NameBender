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

export const generateRelevantQuote = async (prompt: string): Promise<string> => {
    try {
        const systemInstruction = `You are a master curator of quotes. Your task is to find a single, powerful, and relevant quote from a famous person (real or fictional) that relates to the user's prompt for a domain name.

The quote should be insightful, witty, or inspiring. Analyze the core theme of the prompt (e.g., 'Tron' -> technology, digital worlds; 'crypto' -> finance, future, decentralization; 'fashion' -> style, identity).

You MUST format your response precisely as follows, with a newline separating the quote and the attribution:
"<The quote itself.>"
- <Name of Person>

Examples:
- Prompt: "tron movie keywords" -> ""The Grid. A digital frontier. I tried to picture clusters of information as they moved through the computer.""
- Kevin Flynn
- Prompt: "A crypto startup name" -> ""The root problem with conventional currency is all the trust that's required to make it work.""
- Satoshi Nakamoto
- Prompt: "Fashion brand suggestions" -> ""Fashion is not something that exists in dresses only. Fashion is in the sky, in the street, fashion has to do with ideas, the way we live, what is happening.""
- Coco Chanel

Your response must be ONLY the formatted quote. No other text, no greetings, no explanations.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `The user's prompt is: "${prompt}"`,
            config: { 
                systemInstruction,
            },
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating relevant quote:", error);
        // Return a generic, in-character fallback quote on error
        return `"The journey of a thousand miles begins with a single step."
- Lao Tzu`;
    }
};

const parseDomainResponse = (responseText: string): string[] => {
    // Sanitize the response to handle potential markdown code blocks or other text
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
If the user's prompt references a specific real-world entity (e.g., 'Daft Punk songs', 'Tron Legacy movie', 'books by Isaac Asimov'), your primary task is to use the provided search tool to find factual information. Extract actual titles, character names, key terms, and concepts related to that entity. These factual keywords are your MOST IMPORTANT suggestions. For example, for "Daft Punk songs", you should return "onemoretime", "harderbetterfasterstronger". For "movie titles", you should return names like "starwars", "thegodfather", "pulpfiction".

**Mode 2: Creative Brainstorming**
After providing fact-based names, or if the prompt is purely abstract (e.g., 'a name for a finance app'), you can generate creative, brandable names. Use techniques like portmanteaus, compound words, and invented words related to the theme.

**Crucial Output Rules:**
- **Provide ONLY the root domain name.** Do not include TLDs like .com, .ai, etc.
- **Do not add generic suffixes** like 'fans', 'club', 'verse', 'app', 'hq', etc., unless it's a highly creative and integral part of a new, invented name. For factual retrieval, return the original name without additions.
- Names must be a single word (e.g., 'google') or a combination of words without spaces (e.g., 'youtube').
- **Preserve Spelling:** When combining multiple words from a title or phrase (e.g., from 'Human After All'), you MUST merge them by simply removing the spaces, without dropping any letters. Correct: 'humanafterall'. Incorrect: 'humanfterall'.
- You MUST respond with ONLY a valid JSON object in the format \`{"domains": ["name1", "name2", ...]}\`. Do not include any other text, explanations, or markdown formatting like \`\`\`json.`;
    
    let userPrompt = `Generate a list of 10 domain name ideas for: "${description}".`;

    if (existingNames.length > 0) {
        userPrompt += ` Provide completely new ideas that are not on this list: ${existingNames.join(', ')}.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: { 
            systemInstruction,
            tools: [{googleSearch: {}}],
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
        const systemInstruction = `You are a world-class branding expert and creative wordsmith. When a domain name is taken, your task is to generate 3 clever, original, and brandable alternatives that are closely related to the original name's theme.

**Your goal is to avoid predictable, generic "tech startup" naming conventions.** Steer clear of just adding common suffixes like '-ify', '-ly', or '-flow' unless it's exceptionally clever. Instead, explore a wider range of creative strategies:

- **Conceptual Expansion:** Think about the core concept. What does it evoke? For 'thegrid', think about related ideas like 'nexus', 'matrix', 'lattice', 'mainframe', or 'syncore'.
- **Metaphor & Analogy:** Use metaphors. For a name related to memory, you could use 'archive', 'echo', 'attic', 'vault'.
- **Compound Words:** Creatively combine the original keyword with an evocative word. For 'thegrid', you might suggest 'gridcore', 'cyberscape', or 'datasphere'.
- **Evocative Imagery:** Generate names that create a strong visual or feeling. For 'future memories', suggest 'chronoscope', 'dreamweave', 'novapast'.
- **Playful Alterations:** Use clever misspellings, alliteration, or phonetic play that sounds good and is memorable.

**Crucial guidelines:**
- **Stay Thematically Relevant:** The alternatives must connect back to the original concept, but they should feel fresh and surprising.
- **Originality is Key:** Prioritize unique, memorable names over simple, formulaic variations.
- **Format:** Provide only the root domain name, without TLDs. Ensure names are single words or compounds suitable for a URL.

You must always respond in the requested JSON format.`;
        
        const prompt = `The domain name "${domainName}" is taken. Generate 3 alternatives.`;

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
        // The parsing for this function can be simpler as it uses responseSchema
        const sanitizedText = responseText.replace(/^```json\s*|```\s*$/g, '').trim();
        const result = JSON.parse(sanitizedText);
        return (result.domains || []).map((domain: string) => domain.toLowerCase().replace(/[\s.]+/g, ''));
    } catch (error) {
        console.error(`Error generating alternatives for ${domainName}:`, error);
        if (responseText) {
            console.error("AI Response that failed to parse:", responseText);
        }
        throw new Error("Failed to generate alternatives from AI. Please try again.");
    }
};