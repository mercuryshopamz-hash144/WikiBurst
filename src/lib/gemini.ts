import { GoogleGenAI, Type } from '@google/genai';

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

// Lazy initialization
let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai && apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function generateWeeklyReport(history: any[], xp: number) {
  try {
    const ai = getAI();
    if (!ai) return null;
    
    const titles = history.slice(0, 15).map(h => h.title).join(', ');
    const prompt = `You are a learning companion for a knowledge app. The user earned ${xp} XP this week and read about: ${titles}. Write a short, beautifully crafted 2-3 sentence summary of what they became wiser about this week. Keep it philosophical and encouraging.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    
    return response.text;
  } catch (err) {
    console.error("Gemini API Error", err);
    return null;
  }
}

export async function recommendNextTopic(interests: string[], readTitles: string[]) {
   try {
    const ai = getAI();
    if (!ai) return interests[0];
    
    const prompt = `Based on the user's base interests (${interests.join(', ')}) and recent history (${readTitles.slice(0, 10).join(', ')}), suggest a highly specific, obscure Wikipedia search query (1-3 words) that they would find fascinating. Return ONLY the search query text, no quotes or intro. Do NOT under any circumstances recommend anything related to Israel, Zionism, or Jerusalem.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    
    return response.text?.trim() || interests[0];
  } catch (err) {
    console.error("Gemini API Error", err);
    return interests[0];
  }
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export async function analyzeThemeMatch(savedArticles: any[], city: any) {
  try {
    const ai = getAI();
    if (!ai) return { isRelevant: true, reason: "Local mode bypass." };
    
    const titles = savedArticles.map(a => a.title).join(', ');
    const prompt = `The user wants to unlock a library in the city of ${city.name} (Theme: ${city.theme}).
Their saved articles are: ${titles}.
Determine if their saved articles show enough thematic relevance to ${city.name}'s culture, history, or theme.
Return JSON ONLY.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             isRelevant: { type: Type.BOOLEAN },
             reason: { type: Type.STRING },
             topicToLearn: { type: Type.STRING }
          },
          required: ["isRelevant", "reason", "topicToLearn"]
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini API Error for theme check", err);
  }
  return { isRelevant: true, reason: "Bypassed due to error." };
}

export async function generateCityUnlockQuiz(cityName: string, theme: string): Promise<QuizQuestion[]> {
  try {
    const ai = getAI();
    if (!ai) return [];
    
    const prompt = `Generate 3 increasingly difficult multiple-choice trivia questions about the city of ${cityName} and its theme "${theme}".
Each question must have 4 options, and only 1 correct answer.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER }
             },
             required: ["question", "options", "correctIndex"]
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini API Error for city unlock quiz", err);
  }
  return [];
}

export async function generateQuiz(articlesContent: string[]): Promise<QuizQuestion[]> {
  try {
    const ai = getAI();
    if (!ai) return [];
    
    const prompt = `Based on the following excerpts, generate 3 multiple-choice trivia questions to test the user's knowledge. Each question must have 4 options, and only 1 correct answer.
Excerpts:
${articlesContent.slice(0, 5).join('\n---\n')}
`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER }
             },
             required: ["question", "options", "correctIndex"]
          }
        }
      }
    });
    
    if (response.text) return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini API Error for quiz", err);
  }
  return [];
}

export async function getCityRecommendation(currentCity: string, interests: string[]) {
  try {
    const ai = getAI();
    if (!ai) return null;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on a user who is currently in or conquered ${currentCity} and likes ${interests.join(', ')}, suggest the NEXT best historical or cultural city for them to conquer in a knowledge game. Provide just the city name and a 1-sentence reason.`,
    });
    return response.text;
  } catch (error) {
    console.error("City recommendation failed", error);
    return null;
  }
}

export async function getExhibitNarration(title: string, extract?: string, context?: string) {
  try {
    const ai = getAI();
    if (!ai) return null;
    
    let prompt = `Give a brief, 2-sentence exciting museum audio-tour style narration for an exhibit about "${title}".`;
    if (extract) prompt += ` Details: ${extract}.`;
    if (context) prompt += ` Context: ${context}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text;
  } catch (error) {
    return null;
  }
}

export async function getEmpireNarrative(stats: any) {
  try {
    const ai = getAI();
    if (!ai) return null;
    
    const response = await ai.models.generateContent({
       model: "gemini-3-flash-preview",
       contents: `Write a short, epic 1-paragraph story of an empire ruled by a player with the following stats: 
Level ${stats.level}, XP ${stats.xp}, Streak ${stats.streak} days. Make it sound grand and heroic.`
    });
    return response.text;
  } catch (err) {
    return null;
  }
}

export async function getCuratorAssistantSuggestions(libraryName: string, articlesMap: any[]) {
  try {
    const ai = getAI();
    if (!ai) return [];
    
    // Convert articles to a simple list for the prompt
    const articleList = articlesMap.map(a => `- ${a.title} (Room: ${a.roomId})`).join('\n');
    
    const prompt = `You are a museum curator AI assistant for a library named "${libraryName}". 
Review the following exhibits currently in the library:
${articleList}

Provide 3 specific suggestions to improve this library. Suggestions can be about missing topics to add, better thematic room organization, or interesting trivia to add to exhibit notes.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
             type: Type.OBJECT,
             properties: {
                suggestion: { type: Type.STRING },
                type: { type: Type.STRING }
             },
             required: ["suggestion", "type"]
          }
        }
      }
    });

    if (response.text) return JSON.parse(response.text);
  } catch (err) {
    console.error("Gemini API Error for suggestions", err);
  }
  return [];
}

