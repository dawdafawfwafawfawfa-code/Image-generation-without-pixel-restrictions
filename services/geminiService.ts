import { GoogleGenAI } from "@google/genai";
import { AspectRatio, GeneratedImage } from "../types";

// Helper to generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateImageWithGemini = async (
  prompt: string,
  aspectRatio: AspectRatio
): Promise<GeneratedImage> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Using gemini-2.5-flash-image for standard, fast image generation
    // as per guidelines for "General Image Generation and Editing Tasks"
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
        }
      }
    });

    // Parse response for image data
    let imageUrl: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${base64Data}`;
            break; // Found the image, stop looking
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image data found in the response.");
    }

    return {
      id: generateId(),
      url: imageUrl,
      prompt,
      aspectRatio,
      timestamp: Date.now(),
      resolution: '1K', // Default resolution
    };

  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};

export const upscaleImageWithGemini = async (
  originalImage: GeneratedImage
): Promise<GeneratedImage> => {
  // For Gemini 3 Pro Image, we must ensure the correct API key is used.
  // We assume the caller has ensured the key is selected via window.aistudio.
  // We create a new instance to grab the latest process.env.API_KEY
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please select a paid API key to use high-quality models.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    // Extract base64 data from the data URL
    // Format: "data:image/png;base64,..."
    const parts = originalImage.url.split(',');
    if (parts.length !== 2) throw new Error("Invalid image data URL");
    
    const base64Data = parts[1];
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

    // Using gemini-3-pro-image-preview for high-quality upscaling
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          { text: originalImage.prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: originalImage.aspectRatio,
          imageSize: '4K' // Request 4K resolution
        }
      }
    });

    // Parse response for image data
    let imageUrl: string | null = null;

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const base64Data = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mimeType};base64,${base64Data}`;
            break;
          }
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image data found in the upscale response.");
    }

    return {
      id: generateId(),
      url: imageUrl,
      prompt: originalImage.prompt,
      aspectRatio: originalImage.aspectRatio,
      timestamp: Date.now(),
      resolution: '4K'
    };

  } catch (error) {
    console.error("Gemini Image Upscaling Error:", error);
    throw error;
  }
};