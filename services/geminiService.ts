import { GoogleGenAI, Type } from '@google/genai';
import type { FontAnalysisResult } from '../types';

// Helper to convert File to a Gemini-compatible Part
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (reader.result) {
            resolve((reader.result as string).split(',')[1]);
        } else {
            reject(new Error("Failed to read file."));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      mimeType: file.type,
      data: base64EncodedData,
    },
  };
};

export const analyzeFontImages = async (images: File[]): Promise<FontAnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = await Promise.all(images.map(fileToGenerativePart));

  const prompt = `Analyze the following images which all feature the same font. Your task is to:
1.  Identify the name of the font. If it's a very common font, be specific (e.g., "Helvetica Neue" instead of just "Helvetica").
2.  Provide a brief, one or two-sentence description of its key characteristics (e.g., "A geometric sans-serif with a clean and modern appearance.").
3.  Provide a list of up to 3 URLs where this font can be downloaded or purchased. Prioritize official sources like Google Fonts, Adobe Fonts, MyFonts, or the foundry's own website.

Format your response as a single, valid JSON object matching the provided schema. Do not include any markdown formatting or the json code block syntax.`;

  const contents = {
      parts: [
          ...imageParts,
          { text: prompt },
      ],
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fontName: {
              type: Type.STRING,
              description: 'The identified name of the font.',
            },
            description: {
              type: Type.STRING,
              description: 'A brief description of the font\'s characteristics.',
            },
            storeLinks: {
              type: Type.ARRAY,
              description: 'A list of URLs to font stores.',
              items: {
                type: Type.OBJECT,
                properties: {
                  name: {
                    type: Type.STRING,
                    description: 'The name of the font store (e.g., "Google Fonts").',
                  },
                  url: {
                    type: Type.STRING,
                    description: 'The direct URL to the font page.',
                  },
                },
                required: ['name', 'url'],
              },
            },
          },
          required: ['fontName', 'description', 'storeLinks'],
        },
      },
    });

    const responseText = response.text.trim();
    const result = JSON.parse(responseText) as FontAnalysisResult;
    return result;

  } catch (error) {
    console.error("Error analyzing font with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze font. The AI model returned an error: ${error.message}`);
    }
    throw new Error('An unknown error occurred during font analysis.');
  }
};
