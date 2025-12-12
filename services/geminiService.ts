import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, RoutineItem, HealthTip } from "../types";

// In a real production app, this should be behind a backend proxy to protect the key.
// For this demo, we assume the environment variable is set.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateRoutines = async (profile: UserProfile): Promise<RoutineItem[]> => {
  if (!apiKey) throw new Error("API Key missing");

  const model = "gemini-2.5-flash";
  
  const prompt = `
    Based on the following user profile, generate a daily health routine structure.
    Profile:
    - Age: ${calculateAge(profile.birthDate || '')}
    - BMI: ${profile.bmi}
    - Habits: Smoker: ${profile.smoker}, Drinker: ${profile.drinker}
    - Diet: ${profile.diet}
    - Conditions: ${profile.healthConditions}
    - Mental: ${profile.mentalConditions}
    - Work: ${profile.workSchedule}
    
    Create 5-7 distinct routine items covering exercise, diet/nutrition, sleep hygiene, and mental wellness.
    Ensure they are tailored specifically to the provided constraints (e.g., if sedentary, suggest light movement).
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING, enum: ['exercise', 'diet', 'sleep', 'mental', 'work'] },
        timeOfDay: { type: Type.STRING, enum: ['morning', 'afternoon', 'evening', 'anytime'] },
        durationMinutes: { type: Type.NUMBER }
      },
      required: ['id', 'title', 'description', 'category', 'timeOfDay', 'durationMinutes']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as RoutineItem[];
  } catch (error) {
    console.error("Error generating routines:", error);
    return [];
  }
};

export const generateDailyTips = async (profile: UserProfile): Promise<HealthTip[]> => {
  if (!apiKey) throw new Error("API Key missing");

  // We use the googleSearch tool to find citations
  const model = "gemini-2.5-flash";

  const prompt = `
    Find 5 SPECIFIC, actionable health tips relevant to a person with this profile:
    - Age: ${calculateAge(profile.birthDate || '')}
    - BMI: ${profile.bmi}
    - Conditions: ${profile.healthConditions}
    - Mental: ${profile.mentalConditions}
    
    CRITICAL REQUIREMENT:
    You MUST search for information from certified health sources (WHO, Mayo Clinic, CDC, NHS, Harvard Health).
    Return the result as a JSON array where each object has: title, content, sourceName, sourceUrl, category.
    The sourceUrl must be a direct link found via search.
  `;

  // Note: Grounding usually returns chunks, but to force a specific JSON structure *with* the URLs embedded 
  // we rely on the model's ability to synthesize the search results into the requested format.
  // Ideally, we would inspect groundingChunks, but for simplicity in this demo, we ask the model to format it.

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        content: { type: Type.STRING },
        sourceName: { type: Type.STRING },
        sourceUrl: { type: Type.STRING },
        category: { type: Type.STRING }
      },
      required: ['id', 'title', 'content', 'sourceName', 'sourceUrl', 'category']
    }
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: schema,
      }
    });

    const text = response.text;
    if (!text) return [];
    
    // Check for grounding metadata if needed, but we asked for JSON output directly
    return JSON.parse(text) as HealthTip[];
  } catch (error) {
    console.error("Error generating tips:", error);
    // Fallback if search fails or format is wrong
    return [
      {
        id: 'fallback-1',
        title: 'Stay Hydrated',
        content: 'Drinking water is essential for your health.',
        sourceName: 'Mayo Clinic',
        sourceUrl: 'https://www.mayoclinic.org',
        category: 'General'
      }
    ];
  }
};

function calculateAge(birthDate: string): number {
  if (!birthDate) return 30;
  const today = new Date();
  const birthDateObj = new Date(birthDate);
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const m = today.getMonth() - birthDateObj.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
}
