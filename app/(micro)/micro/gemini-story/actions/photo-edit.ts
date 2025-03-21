'use server'

import { geminiFlashExpModel } from "@/lib/gemini";
import { geminiPhotoRatelimit } from "@/lib/redis";

const identifier = "gemini-photo-edit";

/**
 * Server action to enhance a photo using Gemini API
 */
export async function enhancePhotoWithGemini(
  formData: FormData | { image: File; prompt: string }
): Promise<{ success: boolean; imageUrl?: string; error?: string; details?: string }> {
  const { success } = await geminiPhotoRatelimit.limit(identifier);
  if (!success) {
    return { success: false, error: "Rate limit exceeded", details: "Please try again later" };
  }

  try {
    let imageFile: File;
    let prompt: string;

    if (formData instanceof FormData) {
      // Extract data from FormData
      imageFile = formData.get("image") as File;
      prompt = formData.get("prompt") as string;

      if (!imageFile || !prompt) {
        return {
          success: false,
          error: "Missing required fields",
          details: "Both image and prompt are required",
        };
      }
    } else {
      // Extract data from object
      imageFile = formData.image;
      prompt = formData.prompt;

      if (!imageFile || !prompt) {
        return {
          success: false,
          error: "Missing required fields",
          details: "Both image and prompt are required",
        };
      }
    }

    // Validate prompt
    if (prompt.length < 5) {
      return {
        success: false,
        error: "Invalid input",
        details: "Prompt must be at least 5 characters long",
      };
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    // Convert image to base64
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBytes = new Uint8Array(imageArrayBuffer);
    const imageBase64 = Buffer.from(imageBytes).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // Build the content with text prompt and image
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64,
        },
      },
    ];

    // Use the geminiFlashExpModel which is already configured with the image generation model
    const response = await geminiFlashExpModel.generateContent(contents as any);

    // Extract the image from the response
    let enhancedImageUrl = "";

    // Safely check if candidates exist and get the parts
    const candidates = response.response.candidates || [];
    if (candidates.length > 0 && candidates[0]?.content?.parts) {
      const parts = candidates[0].content.parts;

      for (const part of parts) {
        if (part.inlineData) {
          // Convert image data to base64 for embedding in HTML
          const imageData = part.inlineData.data;
          enhancedImageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`;
          break; // Take the first image only
        }
      }
    }

    if (!enhancedImageUrl) {
      throw new Error("No image was generated in the response");
    }

    return { success: true, imageUrl: enhancedImageUrl };
  } catch (error) {
    console.error("Error in enhancePhotoWithGemini server action:", error);
    
    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return { 
        success: false, 
        error: "API configuration error", 
        details: error.message 
      };
    }

    // Handle other errors
    return {
      success: false,
      error: "Failed to enhance photo",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
