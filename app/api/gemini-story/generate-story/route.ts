import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

// Route Configuration
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Request validation schema
const storyPromptSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Prompt must be at least 10 characters long',
  }),
})

type StoryPromptInput = z.infer<typeof storyPromptSchema>

// Gemini API configuration
const apiKey = process.env.GEMINI_API_KEY

// Function to generate story using Gemini API
async function generateStoryWithGemini(prompt: string): Promise<string[]> {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
  })

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  }

  try {
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    })

    // Craft a prompt that specifically asks for a story with scene descriptions that can be visualized
    const formattedPrompt = `Create a visual story based on the following prompt: "${prompt}". 
    Return a JSON array of 4-6 detailed scene descriptions that could be used to generate images. 
    Each scene description should be vivid, descriptive and self-contained. 
    Format your response ONLY as a valid JSON array of strings with no additional text or explanation.
    Example: ["Scene 1 description", "Scene 2 description", ...]`

    const result = await chatSession.sendMessage(formattedPrompt)
    const responseText = result.response.text()
    
    // Parse JSON array from response
    let scenes: string[] = []
    try {
      // Extract JSON array if it's embedded in other text
      // Using a multiline regex approach without the 's' flag
      const jsonRegex = /\[([\s\S]*?)\]/
      const jsonMatch = responseText.match(jsonRegex)
      if (jsonMatch) {
        scenes = JSON.parse(jsonMatch[0])
      } else {
        // If no JSON array pattern found, try parsing the whole response
        scenes = JSON.parse(responseText)
      }
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error)
      // If parsing fails, split by newlines and clean up as fallback
      scenes = responseText
        .split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 6)
    }

    // Mock image URLs based on the scenes (in a real app, you would call an image generation API)
    const mockImageUrls = scenes.map((scene, index) => 
      `https://source.unsplash.com/random/800x600?${encodeURIComponent(scene.slice(0, 30))}&sig=${index}`
    )

    return mockImageUrls
  } catch (error) {
    console.error('Error calling Gemini API:', error)
    throw error
  }
}

/**
 * POST: Generate a story based on user prompt
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: unknown = await request.json()
    const { prompt } = storyPromptSchema.parse(body)

    // Generate story images
    const storyImages = await generateStoryWithGemini(prompt)

    // Return successful response
    return NextResponse.json(
      {
        images: storyImages,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API ERROR] POST /api/gemini-story/generate-story:', error)

    if (error instanceof z.ZodError) {
      // Handle validation errors
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    // Handle Gemini API key error
    if (error instanceof Error && error.message.includes('GEMINI_API_KEY')) {
      return NextResponse.json(
        { error: 'API configuration error', details: error.message },
        { status: 500 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    )
  }
} 