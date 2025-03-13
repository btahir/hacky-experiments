# Gemini Story Creator

A web application that leverages Google's Gemini AI model to transform user prompts into visual stories with text and matching imagery.
The code for this application is primarily located at `app/(micro)/micro/gemini-story`.

## Flow Overview

1. **User Input**

   - User enters a story prompt in the form (minimum 10 characters)
   - The prompt describes the story idea they want to generate

2. **API Processing**

   - Frontend sends the prompt to the `/api/gemini-story/generate-story` endpoint
   - The API validates the input using Zod schema validation
   - Rate limiting is applied to prevent abuse

3. **Gemini AI Generation**

   - The prompt is enhanced with specific instructions to create 4-6 scenes with a beginning, middle, and end
   - The API uses Gemini Flash Exp model (multimodal capabilities) to generate:
     - Text descriptions for each scene
     - Matching images in a Disney digital art style

4. **Response Processing**

   - The API processes Gemini's response to extract text and images
   - Text and image pairs are combined into "scenes"
   - Images are encoded as base64 data URLs

5. **Story Presentation**
   - The generated story is displayed as an interactive slideshow
   - Each slide contains both the scene text and the matching image
   - Users can:
     - Navigate through scenes manually with next/previous buttons
     - Enable auto-play mode (5 seconds per slide)
     - Pause the slideshow at any point

## Technical Implementation

- **Frontend**: Next.js 15 with React Server Components, styled with Tailwind CSS and shadcn/ui
- **Backend**: Next.js API routes with proper error handling
- **AI**: Google's Gemini multimodal AI model generating both text and images
- **User Experience**: Responsive design with loading states and error handling

## Error Handling

The application includes comprehensive error handling for:

- Invalid user inputs (validated with Zod)
- API configuration issues (e.g., missing API key)
- Gemini API errors
- Rate limiting failures
