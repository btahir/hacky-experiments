# Gemini Flash Experiments

A collection of web applications that showcase the multimodal capabilities of Google's Gemini AI. This project demonstrates how Gemini can be used to create visual stories and enhance professional photos.

## Applications

### 1. Gemini Story Creator

Transforms user prompts into visual stories with text and matching imagery.

#### Features:
- Generate complete stories with 4-6 scenes
- AI-generated illustrations in Disney digital art style
- Interactive slideshow presentation
- Auto-play mode with customizable timing

#### How It Works:
1. User enters a story prompt
2. Gemini AI generates both text and matching images
3. Results display as an interactive slideshow

### 2. LinkedIn Photo Enhancer

Transforms ordinary photos into professional LinkedIn profile pictures with customizable options.

#### Features:
- Professional headshot enhancements
- Customizable clothing styles (male/female/neutral options)
- Multiple background options (neutral gray, studio, office, etc.)
- Before/after comparison view

#### How It Works:
1. User uploads a photo
2. User selects photo style, clothing style, and background
3. Gemini AI enhances the photo based on selections
4. Enhanced photo is displayed with download option

## Technical Implementation

- **Frontend**: Next.js with React, styled with Tailwind CSS and shadcn/ui components
- **Backend**: Next.js API routes with proper error handling
- **AI**: Google's Gemini multimodal AI model (text + image generation)
- **User Experience**: Responsive design with loading states and error handling
- **Rate Limiting**: Implemented to prevent API abuse

## Error Handling

The applications include comprehensive error handling for:

- Invalid user inputs (validated with Zod)
- API configuration issues (e.g., missing API key)
- Gemini API errors
- Rate limiting with user-friendly messages

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your Gemini API key in `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Run the development server with `npm run dev`
5. Access the applications at:
   - Story Creator: `/micro/gemini-story`
   - LinkedIn Photo Enhancer: `/micro/gemini-story` (same page, different section)

## API Usage Notes

- Both applications use the Gemini Flash Exp model
- Rate limiting is applied to prevent abuse
- Requests are processed asynchronously with appropriate loading states
