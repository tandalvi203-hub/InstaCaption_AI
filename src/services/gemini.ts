import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CaptionResult {
  captions: string[];
  hashtags: string[];
}

export async function generateCaptions(
  imageBuffer: string,
  mimeType: string,
  style: string
): Promise<CaptionResult> {
  const model = "gemini-3-flash-preview";

  const prompt = `Analyze the uploaded image and generate 3 Instagram captions relevant to the image scene. 
  Use the selected caption style: ${style}.
  
  Styles guide:
  - English: Creative and engaging English captions.
  - Marathi: Captions strictly in Marathi language.
  - Tadka Mix: A mix of Marathi and English (Hinglish/Marathish style).
  - Aesthetic: Minimalist, poetic, and visually descriptive.
  - Viral: High-energy, trend-focused, and catchy.

  Also suggest 5 relevant hashtags.

  Return the response in JSON format.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: imageBuffer.split(",")[1],
              mimeType,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          captions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 3 generated captions",
          },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of 5 suggested hashtags",
          },
        },
        required: ["captions", "hashtags"],
      },
    },
  });

  try {
    const result = JSON.parse(response.text || "{}");
    return {
      captions: result.captions || [],
      hashtags: result.hashtags || [],
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Failed to generate captions. Please try again.");
  }
}
