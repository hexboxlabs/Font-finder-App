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

  const prompt = `You are a typography expert. Your task is to meticulously analyze the following images, which all showcase the same font, and provide a detailed identification.

Follow these steps for your analysis:
1.  **Examine Font Characteristics:** Look closely at the letterforms. Pay attention to details like:
    *   **Serifs:** Are they present? Are they bracketed, slab, or hairline?
    *   **X-height:** Is it high or low?
    *   **Contrast:** Is there a significant difference between thick and thin strokes?
    *   **Glyph Shapes:** Note any unique characters (e.g., the shape of the 'g', the tail of the 'Q', the dot on the 'i').
    *   **Overall Feel:** Is it geometric, humanist, grotesque, modern?

2.  **Identify the Font:** Based on your detailed analysis, identify the specific name of the font. Be as precise as possible (e.g., "Roboto Slab" instead of just "a slab serif"). If it's a very common font, provide the specific variant if discernible (e.g., "Helvetica Neue Light").

3.  **Describe the Font:** Provide a concise, one or two-sentence description summarizing its key characteristics and typical usage.

4.  **Find Font Sources:** Provide a list of up to 3 URLs where this font can be reliably downloaded or purchased. Prioritize official foundries, major distributors like Google Fonts, Adobe Fonts, or MyFonts.

**Output Format:**
Your final output must be a single, valid JSON object matching the provided schema. Do not include any markdown formatting, code block syntax, or extraneous text.`;

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