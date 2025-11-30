import { GoogleGenAI, Type } from "@google/genai";
import { Game } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateGameIdeas = async (count: number = 4): Promise<Game[]> => {
  if (!apiKey) {
    console.warn("No API Key provided, returning mock data");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} creative and unique Roblox-style game concepts. They should be catchy and fun.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              creator: { type: Type.STRING },
              genre: { type: Type.STRING },
              likes: { type: Type.INTEGER },
              players: { type: Type.INTEGER }
            },
            required: ["title", "description", "creator", "genre", "likes", "players"]
          }
        }
      }
    });

    const rawGames = JSON.parse(response.text || "[]");
    
    // Map to our Game interface and add visuals
    return rawGames.map((game: any) => ({
      id: generateId(),
      title: game.title,
      description: game.description,
      creator: game.creator,
      genre: game.genre,
      likes: game.likes,
      players: game.players,
      // We use picsum with a seed to get consistent random images
      thumbnail: `https://picsum.photos/seed/${game.title.replace(/\s/g, '')}/400/225`
    }));

  } catch (error) {
    console.error("Gemini generation error:", error);
    return [];
  }
};

export const chatWithGemini = async (message: string, history: string[]): Promise<string> => {
   if (!apiKey) return "I cannot reply without an API key.";

   try {
     const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: `History: ${history.join("\n")}\nUser: ${message}\n
       You are a helpful and enthusiastic NPC in a Roblox-like game world called BloxClone. 
       Keep your answers short (under 2 sentences) and use gaming slang occasionally (like 'gg', 'noob', 'obby').`,
     });
     return response.text || "GG!";
   } catch (e) {
     return "Connection error...";
   }
}

export const generateFriendReply = async (friendName: string, lastMessage: string, chatHistory: string[]): Promise<string> => {
    if (!apiKey) {
        return "Haha cool!";
    }

    // Define personalities
    let persona = "A casual gamer.";
    if (friendName.includes("Noob")) persona = "A complete beginner/noob who always asks for free items, uses bad grammar, and says 'pls' a lot.";
    else if (friendName.includes("GamerGirl")) persona = "A competitive pro player who uses 'EZ', 'L', 'W' and talks about ranking up.";
    else if (friendName.includes("Builder")) persona = "A developer who talks about scripting, building maps, and fixing bugs.";
    else if (friendName.includes("Cool")) persona = "A chill player who uses slang like 'bet', 'cap', 'fr'.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Roleplay as a Roblox player named '${friendName}'.
            Your Persona: ${persona}
            
            Conversation History:
            ${chatHistory.slice(-3).join('\n')}
            
            The user just said: "${lastMessage}"
            
            Reply to the user in character. Keep it short (1 sentence max). Do not use hashtags.`,
        });
        return response.text || "lol";
    } catch (e) {
        return "brb lag";
    }
}