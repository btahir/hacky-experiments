import { z } from 'zod'
import { geminiFlashExpModel } from '@/lib/gemini'
import { geminiStoryRatelimit } from '@/lib/redis'

const identifier = 'gemini-story'

// Request validation schema
const storyPromptSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters long',
  }),
})

interface StoryScene {
  text: string
  imageUrl: string
}

// Function to generate story using Gemini API
async function generateStoryWithGemini(prompt: string): Promise<StoryScene[]> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  try {
    // Create a prompt that asks for a visual story with multiple scenes
    const formattedPrompt = `Generate a visual story based on the following prompt: "${prompt}". 
    Create 4-6 scenes that tell a complete story with a beginning, middle, and end.
    For each scene, generate a brief description and a matching image.
    Use a disney digital art style for the images.`

    // Use the standard method which should support multimodal responses
    const result = await geminiFlashExpModel.generateContent(formattedPrompt)

    const response = result.response
    console.log('Gemini response candidate count:', response.candidates?.length)
    console.log(
      'Gemini response parts count:',
      response.candidates?.[0]?.content?.parts?.length
    )

    // Process the response to extract text and images
    const parts = response.candidates?.[0]?.content?.parts || []

    const scenes: StoryScene[] = []
    let currentText = ''

    // Loop through the parts to pair text with images
    for (const part of parts) {
      if (part.text) {
        currentText = part.text
      } else if (
        part.inlineData &&
        part.inlineData.mimeType.startsWith('image/')
      ) {
        // Found an image, create a scene with the preceding text
        if (currentText) {
          // Convert image data to base64 for embedding in HTML
          const imageData = part.inlineData.data
          const imageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`

          scenes.push({
            text: currentText,
            imageUrl: imageUrl,
          })

          // Reset text for next pair
          currentText = ''
        }
      }
    }

    // If we have leftover text without an image, add it with empty image
    if (currentText && currentText.trim() !== '') {
      scenes.push({
        text: currentText,
        imageUrl: '',
      })
    }

    console.log('Extracted scenes count:', scenes.length)

    return scenes
  } catch (error) {
    console.error('Error in generateStoryWithGemini:', error)
    throw error
  }
}

/**
 * POST: Generate a story based on user prompt
 */
export async function POST(request: Request) {
  const { success } = await geminiStoryRatelimit.limit(identifier)
  if (!success) {
    return Response.json({ error: 'Rate limit exceeded', status: 429 })
  }

  try {
    // Parse and validate request body
    const body: unknown = await request.json()

    const { prompt } = storyPromptSchema.parse(body)

    // Generate story scenes
    const storyScenes = await generateStoryWithGemini(prompt)

    // Return successful response with structured data
    return Response.json(
      {
        scenes: storyScenes,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API ERROR] POST /api/gemini-flash/story:', error)

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
        error: 'Failed to generate story',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
