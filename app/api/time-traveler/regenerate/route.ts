import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { geminiPhotoRatelimit } from "@/lib/redis"

export async function POST(request: NextRequest) {
  const identifier = "age-progression"
  
  try {
    // Rate limiting check
    const { success } = await geminiPhotoRatelimit.limit(identifier)
    if (!success) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded", details: "Please try again later" },
        { status: 429 }
      )
    }

    const formData = await request.formData()
    const imageFile = formData.get("image") as File
    const targetAge = parseInt(formData.get("targetAge") as string)
    const currentAge = parseInt(formData.get("currentAge") as string) || 25
    const customPrompt = formData.get("customPrompt") as string

    if (!imageFile || !targetAge) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", details: "Image and target age are required" },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "API configuration error", details: "GEMINI_API_KEY environment variable is not set" },
        { status: 500 }
      )
    }

    // Convert image to base64
    const imageArrayBuffer = await imageFile.arrayBuffer()
    const imageBytes = new Uint8Array(imageArrayBuffer)
    const imageBase64 = Buffer.from(imageBytes).toString("base64")
    const mimeType = imageFile.type || "image/jpeg"

    // Create AI instance
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const config = {
      responseModalities: ['IMAGE', 'TEXT'],
    }
    
    const model = 'gemini-2.5-flash-image-preview'

    // Calculate age progression context
    const ageIncrease = targetAge - currentAge
    const decades = Math.floor(ageIncrease / 10)
    
    const basePrompt = `Create a realistic age-progressed version of this person showing them at ${targetAge} years old.

AGING CONCEPT:
Imagine this person naturally aging ${ageIncrease} years from their current age of ${currentAge}. Consider how someone typically changes over ${decades > 0 ? `${decades} decade${decades > 1 ? 's' : ''}` : `${ageIncrease} years`} of life.

PROGRESSION GUIDANCE:
${decades === 1 ? '- Think early aging signs - subtle changes that show the passage of a decade' :
  decades === 2 ? '- Consider the transition from youth to middle age - noticeable but not dramatic changes' :
  decades === 3 ? '- Envision middle-aged maturity with accumulated life experience showing' :
  decades === 4 ? '- Picture mature adult years with decades of living reflected in their appearance' :
  '- Imagine graceful senior years with the wisdom and experience of a full life'}

Let the natural aging process guide your interpretation. Every person ages differently based on genetics, lifestyle, and life experiences. Consider what would make sense for this individual aging naturally over time.

CONSISTENCY REQUIREMENTS:
- Maintain the exact same pose, expression, lighting, and background
- Keep their distinctive facial features and bone structure recognizable
- Preserve their core identity - this should clearly be the same person, just older
- Only change what would naturally change with ${ageIncrease} years of aging

Focus on creating a believable version of this same person as they would naturally appear at age ${targetAge}.`

    const finalPrompt = customPrompt ? `${basePrompt}\n\nAdditional instructions: ${customPrompt}` : basePrompt

    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: finalPrompt,
          },
          {
            inlineData: {
              mimeType: mimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ]

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    let generatedImage = ""
    
    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue
      }
      
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData
        generatedImage = `data:${inlineData.mimeType};base64,${inlineData.data}`
        break // Take the first image only
      }
    }

    if (!generatedImage) {
      return NextResponse.json(
        { success: false, error: "No image was generated", details: "No image was generated in the response" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, image: generatedImage })

  } catch (error) {
    console.error("Error in regenerateAgedPhoto:", error)
    
    if (error instanceof Error && error.message.includes("API_KEY")) {
      return NextResponse.json(
        { success: false, error: "API configuration error", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to regenerate aged photo", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}