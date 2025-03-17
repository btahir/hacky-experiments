import { z } from 'zod'
import { geminiFlashExpModel } from '@/lib/gemini'
import { geminiPhotoRatelimit } from '@/lib/redis'

const identifier = 'gemini-photo'

// Request validation schema
const photoEnhanceSchema = z.object({
  image: z.string().min(1, { message: 'Image data is required' }),
  prompt: z.string().min(5, { message: 'Prompt must be at least 5 characters long' }),
})

// Function to enhance photo using Gemini API
async function enhancePhotoWithGemini(imageBase64: string, prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  try {
    // Build the content with text prompt and image
    const contents = [
      { text: prompt },
      {
        inlineData: {
          mimeType: 'image/jpeg', // Assuming JPEG for simplicity, adjust as needed
          data: imageBase64
        }
      }
    ]

    // Use the geminiFlashExpModel which is already configured with the image generation model
    const response = await geminiFlashExpModel.generateContent(contents as any)
    
    // Extract the image from the response
    let enhancedImageUrl = ''
    
    // Safely check if candidates exist and get the parts
    const candidates = response.response.candidates || []
    if (candidates.length > 0 && candidates[0]?.content?.parts) {
      const parts = candidates[0].content.parts
      
      for (const part of parts) {
        if (part.inlineData) {
          // Convert image data to base64 for embedding in HTML
          const imageData = part.inlineData.data
          enhancedImageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`
          break // Take the first image only
        }
      }
    }

    if (!enhancedImageUrl) {
      throw new Error('No image was generated in the response')
    }

    return enhancedImageUrl
  } catch (error) {
    console.error('Error in enhancePhotoWithGemini:', error)
    throw error
  }
}

/**
 * POST: Enhance a photo based on user prompt
 */
export async function POST(request: Request) {
  const { success } = await geminiPhotoRatelimit.limit(identifier)
  if (!success) {
    return Response.json({ error: 'Rate limit exceeded', status: 429 })
  }

  try {
    // Parse and validate request body
    const body: unknown = await request.json()

    const { image, prompt } = photoEnhanceSchema.parse(body)

    // Enhance the photo
    const enhancedImage = await enhancePhotoWithGemini(image, prompt)

    // Return successful response with the enhanced image
    return Response.json(
      {
        enhancedImage,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API ERROR] POST /api/gemini-flash/photo:', error)

    if (error instanceof z.ZodError) {
      // Handle validation errors
      return Response.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    // Handle Gemini API key error
    if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
      return Response.json(
        { error: 'API configuration error', details: error.message },
        { status: 500 }
      )
    }

    // Handle other errors
    return Response.json(
      {
        error: 'Failed to enhance photo',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
