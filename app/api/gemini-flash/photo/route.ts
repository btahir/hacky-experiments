import { geminiFlashExpModel } from "@/lib/gemini";
import { geminiPhotoRatelimit } from "@/lib/redis";

const identifier = "gemini-photo";

// Function to enhance photo using Gemini API
async function enhancePhotoWithGemini(
  imageBase64: string,
  prompt: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    // Build the content with text prompt and image
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: "image/jpeg", // Assuming JPEG for simplicity, adjust as needed
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

    return enhancedImageUrl;
  } catch (error) {
    console.error("Error in enhancePhotoWithGemini:", error);
    throw error;
  }
}

/**
 * POST: Enhance a photo based on user prompt
 */
export async function POST(request: Request) {
  const { success } = await geminiPhotoRatelimit.limit(identifier);
  if (!success) {
    return Response.json({ error: "Rate limit exceeded", status: 429 });
  }

  try {
    // Parse form data instead of JSON
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!imageFile || !prompt) {
      return Response.json(
        {
          error: "Missing required fields",
          details: "Both image and prompt are required",
        },
        { status: 400 }
      );
    }

    // Validate prompt
    if (prompt.length < 5) {
      return Response.json(
        {
          error: "Invalid input",
          details: "Prompt must be at least 5 characters long",
        },
        { status: 400 }
      );
    }

    // Convert image to base64
    const imageArrayBuffer = await imageFile.arrayBuffer();
    const imageBytes = new Uint8Array(imageArrayBuffer);
    const imageBase64 = Buffer.from(imageBytes).toString("base64");

    // Enhance the photo
    const enhancedImage = await enhancePhotoWithGemini(imageBase64, prompt);

    // Return successful response with the enhanced image
    return Response.json(
      {
        imageUrl: enhancedImage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API ERROR] POST /api/gemini-flash/photo:", error);

    if (error instanceof Error && error.message.includes("GEMINI_API_KEY")) {
      return Response.json(
        { error: "API configuration error", details: error.message },
        { status: 500 }
      );
    }

    // Handle other errors
    return Response.json(
      {
        error: "Failed to enhance photo",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
