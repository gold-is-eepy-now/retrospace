import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRetroStatus = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Write a very short, random, angsty or random rawr xD style status update typical of a teenager on MySpace/Twitter in 2006. Use old internet slang (lol, rofl, xD, T_T). Max 15 words. Lowercase heavily.",
      config: {
        maxOutputTokens: 50,
        temperature: 0.9,
      }
    });
    return response.text.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error("Gemini error:", error);
    return "is currently offline... T_T";
  }
};

export const generateBlogPost = async (topic: string): Promise<{title: string, content: string}> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a MySpace era blog post about "${topic || 'my life'}". 
      Title should be dramatic/emo song lyrics. 
      Content should be about 100 words, rambling, emotional, using 2006 slang, html line breaks, and emoticons.`,
      config: {
        maxOutputTokens: 300,
        temperature: 1.0,
        responseMimeType: "application/json"
      }
    });
    
    // Fallback parsing if JSON fails (though 2.5 flash is good at it)
    try {
        const json = JSON.parse(response.text);
        return {
            title: json.title || "Untitled...",
            content: json.content || response.text
        };
    } catch {
        return {
            title: "Lyrics to my life...",
            content: response.text
        };
    }

  } catch (error) {
    console.error("Gemini error:", error);
    return { title: "Error...", content: "Could not load blog. Ugh." };
  }
}

export const generateAIComment = async (postContent: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Reply to this social media post as a supportive but chaotic 2000s friend. Post: "${postContent}". Keep it under 10 words. Use slang like 'omg', 'cool', 'h4x0r'.`,
      config: {
        maxOutputTokens: 30,
        temperature: 0.8,
      }
    });
    return response.text.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error("Gemini error:", error);
    return "omg cool post!!";
  }
};

export const generateProfileBio = async (): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a 'About Me' section for a MySpace profile in 2005. Include hobbies like listening to emo bands, coding HTML, and hanging out at the mall. Keep it raw, unstructured, and nostalgic. Max 50 words.",
    });
    return response.text;
  } catch (error) {
    console.error("Gemini error:", error);
    return "Music is my life. Don't judge me. <3";
  }
};