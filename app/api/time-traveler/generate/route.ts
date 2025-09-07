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
    const currentAge = parseInt(formData.get("currentAge") as string) || 25

    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: "Missing required fields", details: "Image is required" },
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

    // Generate age progression for 5 different ages (10-year increments)
    const targetAges = [currentAge + 10, currentAge + 20, currentAge + 30, currentAge + 40, currentAge + 50]
    
    const prompt = `Create EXACTLY 5 age-progressed images showing this person getting PROGRESSIVELY OLDER in sequence.

CRITICAL AGING SEQUENCE:
You MUST generate these in ORDER from youngest to oldest:

IMAGE 1: Age ${targetAges[0]} (${targetAges[0] - currentAge} years older than original)
- This should be the YOUNGEST version with minimal aging
- Subtle changes from the original photo

IMAGE 2: Age ${targetAges[1]} (${targetAges[1] - currentAge} years older than original) 
- This should look OLDER than Image 1 but YOUNGER than Image 3
- Moderate aging progression from Image 1

IMAGE 3: Age ${targetAges[2]} (${targetAges[2] - currentAge} years older than original)
- This should look OLDER than Image 2 but YOUNGER than Image 4
- Clear middle-aged appearance

IMAGE 4: Age ${targetAges[3]} (${targetAges[3] - currentAge} years older than original)
- This should look OLDER than Image 3 but YOUNGER than Image 5
- Mature adult with significant aging

IMAGE 5: Age ${targetAges[4]} (${targetAges[4] - currentAge} years older than original)
- This should be the OLDEST version with the most aging
- Senior appearance with full life experience showing

PROGRESSION RULES:
- Each image MUST show MORE aging than the previous image
- NO going backwards in age - each person gets progressively older
- NO sudden jumps - smooth gradual progression from youngest to oldest
- Think: young → middle-aged → senior in 5 steps

CONSISTENCY REQUIREMENTS:
- Same pose, expression, lighting, and background throughout
- Keep their distinctive features recognizable
- Only aging effects should change between images

Generate the 5 images in this exact order: youngest first, oldest last. Each image must be clearly older than the previous one.`

    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: prompt,
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

    const images: string[] = []
    
    for await (const chunk of response) {
      if (!chunk.candidates || !chunk.candidates[0].content || !chunk.candidates[0].content.parts) {
        continue
      }
      
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData) {
        const inlineData = chunk.candidates[0].content.parts[0].inlineData
        const imageData = `data:${inlineData.mimeType};base64,${inlineData.data}`
        images.push(imageData)
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, error: "No images were generated", details: "No images were generated in the response" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, images })

  } catch (error) {
    console.error("Error in generateAgeProgression:", error)
    
    if (error instanceof Error && error.message.includes("API_KEY")) {
      return NextResponse.json(
        { success: false, error: "API configuration error", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate age progression", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}