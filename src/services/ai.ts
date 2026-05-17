import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuiz(topic: string, length: number = 3) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Generate a multiple choice quiz about "${topic}" with ${length} questions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              correctAnswerIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswerIndex", "explanation"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Quiz generation failed", error);
  }
  return null;
}

export async function getCityRecommendation(currentCity: string, interests: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on a user who is currently in or interested in ${currentCity} and likes ${interests}, suggest the NEXT best historical or cultural city for them to "conquer" or learn about in our app. Keep the response to 2 sentences explaining why. Provide just the city name and reason.`,
    });
    return response.text;
  } catch (error) {
    console.error("City recommendation failed", error);
    return null;
  }
}

export async function getExhibitNarration(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Give a brief, 3-sentence exciting museum audio-tour style narration for an exhibit about "${topic}".`
    });
    return response.text;
  } catch (error) {
    console.error("Narration failed", error);
    return null;
  }
}

export async function getEmpireNarrative(stats: any) {
  try {
    const response = await ai.models.generateContent({
       model: "gemini-3-flash-preview",
       contents: `Write a short, epic 1-paragraph story of an empire ruled by a player with the following stats:
       Level: ${stats.level}
       XP: ${stats.xp}
       Streak: ${stats.streak} days
       Libraries Conquered: ${stats.libraries}
       Make it sound grand and heroic.`
    });
    return response.text;
  } catch (err) {
    console.error("Narrative failed", err);
    return null;
  }
}
