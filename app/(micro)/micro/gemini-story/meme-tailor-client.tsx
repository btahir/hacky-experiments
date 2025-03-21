'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, Loader2, Download, Smile } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { enhancePhotoWithGemini } from './actions/photo-edit'

// Meme template interface
interface MemeTemplate {
  id: string
  name: string
  url: string
  width: number
  height: number
  box_count: number
}

export default function MemeTailorClient() {
  // State for meme generation
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // State for meme text
  const [topText, setTopText] = useState('')
  const [bottomText, setBottomText] = useState('')
  const [fontSize, setFontSize] = useState(32)
  const [textColor, setTextColor] = useState('#ffffff')
  const [textStrokeColor, setTextStrokeColor] = useState('#000000')

  // State for meme templates
  const [allMemeTemplates, setAllMemeTemplates] = useState<MemeTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<MemeTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(
    null
  )

  // State for meme customization
  const [customPrompt, setCustomPrompt] = useState(
    'Transform this image into a Pixar-style 3D animation with their characteristic lighting and texturing'
  )

  // Reference for the image element to get dimensions
  const imageRef = useRef<HTMLImageElement>(null)

  // Fetch meme templates on mount
  useEffect(() => {
    async function fetchMemeTemplates() {
      try {
        const response = await fetch(`https://api.imgflip.com/get_memes`)

        if (!response.ok) {
          throw new Error(`API call failed with status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(
            data.error_message || 'Failed to fetch meme templates'
          )
        }

        const templates = data.data.memes as MemeTemplate[]
        setAllMemeTemplates(templates)
        setFilteredTemplates(templates)
      } catch (error) {
        console.error('Error fetching templates:', error)
        toast.error('Failed to fetch meme templates')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMemeTemplates()
  }, [])

  // Filter templates based on search query
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)

    const filtered = query.trim()
      ? allMemeTemplates.filter((template) =>
          template.name.toLowerCase().includes(query.toLowerCase())
        )
      : allMemeTemplates

    setFilteredTemplates(filtered)
  }

  // Select a template
  const selectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template)
    setGeneratedMeme(null) // Reset generated meme when template changes
  }

  // Generate meme from template
  const generateMeme = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template first')
      return
    }

    try {
      setIsGenerating(true)

      // Fetch the template image and convert to File
      const templateResponse = await fetch(selectedTemplate.url)
      const templateBlob = await templateResponse.blob()
      const templateFile = new File([templateBlob], 'template.jpg', {
        type: 'image/jpeg',
      })

      // Build a prompt for meme generation
      let memePrompt =
        customPrompt ||
        `Create a funny meme based on this template "${selectedTemplate.name}"`

      // Ensure prompt is at least 5 characters long as required by photo route
      if (memePrompt.length < 5) {
        memePrompt = `Create a funny and engaging meme image based on the template "${selectedTemplate.name}"`
      }

      // Create a FormData object to pass to the server action
      const formData = new FormData()
      formData.append('image', templateFile)
      formData.append('prompt', memePrompt)

      // Call the server action
      const response = await enhancePhotoWithGemini(formData)

      if (response.success && response.imageUrl) {
        setGeneratedMeme(response.imageUrl)
        toast.success('Meme generated successfully!')
      } else {
        console.error('Error generating meme:', response)
        toast.error(
          `Failed to generate meme: ${response.error ?? 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error generating meme:', error)
      toast.error(
        `Failed to generate meme: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setIsGenerating(false)
    }
  }

  // Function to calculate font size based on image dimensions
  const calculateScaledFontSize = (imageWidth: number) => {
    // Base scaling - typical meme font is about 5% of image width
    const scaleFactor = 0.05
    return Math.max(16, Math.round(imageWidth * scaleFactor * (fontSize / 32)))
  }

  // Download generated meme
  const downloadMeme = () => {
    if (!generatedMeme) return

    // Create canvas to draw image and text
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width
      canvas.height = img.height

      // Draw image on canvas
      ctx?.drawImage(img, 0, 0)

      // Configure text style
      if (ctx) {
        // Calculate font size proportional to the actual image dimensions
        const scaledFontSize = calculateScaledFontSize(img.width)

        ctx.textAlign = 'center'
        ctx.font = `bold ${scaledFontSize}px Impact, sans-serif`
        ctx.lineJoin = 'round' // Add round line joins to prevent sharp corners
        ctx.miterLimit = 2 // Limit the miter length

        // Draw top text with stroke
        if (topText.trim()) {
          const uppercaseTopText = topText.toUpperCase()
          // Adjust top position to ensure it doesn't touch the top of the image
          const topY = scaledFontSize + scaledFontSize * 0.2

          // Draw stroke first - more subtle to avoid artifacts
          ctx.lineWidth = scaledFontSize / 6 // Thicker stroke to match preview
          ctx.strokeStyle = textStrokeColor
          ctx.strokeText(uppercaseTopText, canvas.width / 2, topY)

          // Then draw fill on top
          ctx.fillStyle = textColor
          ctx.fillText(uppercaseTopText, canvas.width / 2, topY)
        }

        // Draw bottom text with stroke
        if (bottomText.trim()) {
          const uppercaseBottomText = bottomText.toUpperCase()
          // Adjust bottom position to ensure it doesn't touch the bottom of the image
          const bottomY = canvas.height - scaledFontSize * 0.3

          // Draw stroke first
          ctx.lineWidth = scaledFontSize / 6 // Thicker stroke to match preview
          ctx.strokeStyle = textStrokeColor
          ctx.strokeText(uppercaseBottomText, canvas.width / 2, bottomY)

          // Then draw fill on top
          ctx.fillStyle = textColor
          ctx.fillText(uppercaseBottomText, canvas.width / 2, bottomY)
        }
      }

      // Convert canvas to data URL and download
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = 'meme.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Meme downloaded!')
    }

    img.src = generatedMeme
  }

  // Function to render text overlay
  const renderTextOverlay = (imageUrl: string) => {
    // Calculate scaled font size based on the rendered image dimensions
    const calculatedFontSize = imageRef.current
      ? calculateScaledFontSize(imageRef.current.clientWidth)
      : fontSize

    return (
      <div className='relative'>
        <img
          ref={imageRef}
          src={imageUrl}
          alt='Generated meme'
          className='max-w-full object-contain'
          crossOrigin='anonymous'
          onLoad={() => {
            // Force re-render when image loads to get correct dimensions
            setFontSize(fontSize)
          }}
        />
        {topText && (
          <div
            className='absolute w-full text-center'
            style={{
              top: '5px',
              left: 0,
              right: 0,
              fontFamily: 'Impact, sans-serif',
              fontSize: `${calculatedFontSize}px`,
              fontWeight: 'bold',
              color: textColor,
              textShadow: `
                -1px -1px 0 ${textStrokeColor},
                1px -1px 0 ${textStrokeColor},
                -1px 1px 0 ${textStrokeColor},
                1px 1px 0 ${textStrokeColor},
                -2px 0 0 ${textStrokeColor},
                2px 0 0 ${textStrokeColor},
                0 -2px 0 ${textStrokeColor},
                0 2px 0 ${textStrokeColor}
              `,
              textTransform: 'uppercase',
              wordWrap: 'break-word',
            }}
          >
            {topText}
          </div>
        )}
        {bottomText && (
          <div
            className='absolute w-full text-center'
            style={{
              bottom: '5px',
              left: 0,
              right: 0,
              fontFamily: 'Impact, sans-serif',
              fontSize: `${calculatedFontSize}px`,
              fontWeight: 'bold',
              color: textColor,
              textShadow: `
                -1px -1px 0 ${textStrokeColor},
                1px -1px 0 ${textStrokeColor},
                -1px 1px 0 ${textStrokeColor},
                1px 1px 0 ${textStrokeColor},
                -2px 0 0 ${textStrokeColor},
                2px 0 0 ${textStrokeColor},
                0 -2px 0 ${textStrokeColor},
                0 2px 0 ${textStrokeColor}
              `,
              textTransform: 'uppercase',
              wordWrap: 'break-word',
            }}
          >
            {bottomText}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='flex flex-col items-center'>
      {/* Purple Header */}
      <div className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8 mb-10 rounded-lg'>
        <div className='max-w-4xl mx-auto text-center'>
          <Smile className='h-16 w-16 mx-auto mb-4' />
          <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4'>
            Meme Tailor
          </h1>
          <p className='text-xl max-w-2xl mx-auto'>
            Find the perfect meme template and customize it with AI assistance
          </p>
        </div>
      </div>
      <Card className='w-full max-w-4xl mb-8 border border-slate-200 dark:border-slate-700'>
        <CardContent className='p-6'>
          {/* Responsive layout - column on mobile, grid on desktop */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Left column - Template selection and customization */}
            <div className='space-y-6'>
              {/* Template Search */}
              <div className='space-y-4'>
                <div>
                  <Label
                    htmlFor='template-search'
                    className='text-base font-medium'
                  >
                    Search Meme Templates
                  </Label>
                  <div className='flex mt-2'>
                    <Input
                      id='template-search'
                      placeholder='Search templates...'
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className='flex-1'
                    />
                    <Button
                      variant='secondary'
                      className='ml-2'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <Search className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Template results */}
                <ScrollArea className='h-60 border rounded-md'>
                  {filteredTemplates.length > 0 ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-2 p-2'>
                      {filteredTemplates.map((meme) => (
                        <div
                          key={meme.id}
                          className={cn(
                            'p-2 border rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800',
                            selectedTemplate?.id === meme.id &&
                              'border-purple-500 bg-purple-50 dark:bg-purple-950'
                          )}
                          onClick={() => selectTemplate(meme)}
                        >
                          <img
                            src={meme.url}
                            alt={meme.name}
                            className='w-full h-24 object-contain mb-1'
                            crossOrigin='anonymous'
                          />
                          <p className='text-xs truncate text-center'>
                            {meme.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className='flex items-center justify-center h-full'>
                      <p className='text-slate-500'>
                        No meme templates found for &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  ) : isLoading ? (
                    <div className='flex items-center justify-center h-full'>
                      <Loader2 className='h-8 w-8 animate-spin' />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <p className='text-slate-500 pt-24'>
                        No templates available
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Selected Template */}
              {selectedTemplate && (
                <div>
                  <Label className='text-base font-medium'>
                    Selected Template
                  </Label>
                  <div className='border rounded-md p-2 flex items-center space-x-3 mt-2'>
                    <img
                      src={selectedTemplate.url}
                      alt={selectedTemplate.name}
                      className='h-16 w-16 object-contain'
                      crossOrigin='anonymous'
                    />
                    <div className='flex-1'>
                      <p className='font-medium text-sm'>
                        {selectedTemplate.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Meme Customization */}
              {selectedTemplate && (
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='prompt'>Customization Prompt</Label>
                    <Textarea
                      id='prompt'
                      placeholder='Describe your meme...'
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className='mt-2'
                    />
                  </div>

                  {/* Meme Text Controls */}
                  <div className='space-y-2'>
                    <Label htmlFor='top-text'>Top Text</Label>
                    <Input
                      id='top-text'
                      placeholder='TOP TEXT'
                      value={topText}
                      onChange={(e) => setTopText(e.target.value)}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='bottom-text'>Bottom Text</Label>
                    <Input
                      id='bottom-text'
                      placeholder='BOTTOM TEXT'
                      value={bottomText}
                      onChange={(e) => setBottomText(e.target.value)}
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='font-size'>Font Size</Label>
                      <div className='flex items-center space-x-2'>
                        <Input
                          id='font-size'
                          type='number'
                          min='12'
                          max='72'
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className='space-y-2'>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <Label htmlFor='text-color' className='mb-2'>
                            Fill
                          </Label>
                          <Input
                            id='text-color'
                            type='color'
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className='h-9 w-full'
                          />
                        </div>
                        <div>
                          <Label htmlFor='stroke-color' className='mb-2'>
                            Stroke
                          </Label>
                          <Input
                            id='stroke-color'
                            type='color'
                            value={textStrokeColor}
                            onChange={(e) => setTextStrokeColor(e.target.value)}
                            className='h-9 w-full'
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      disabled={!selectedTemplate || isGenerating}
                      className='w-full'
                      onClick={generateMeme}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Generating...
                        </>
                      ) : (
                        'Generate Meme'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Result display */}
            <div className='flex flex-col items-center justify-start border rounded-md p-4 h-full'>
              {generatedMeme ? (
                <>
                  <div className='mb-4 max-w-full overflow-hidden rounded-md shadow-md'>
                    {renderTextOverlay(generatedMeme)}
                  </div>

                  <Button
                    onClick={downloadMeme}
                    variant='outline'
                    className='w-full'
                  >
                    <Download className='mr-2 h-4 w-4' />
                    Download
                  </Button>
                </>
              ) : selectedTemplate ? (
                <div className='text-center p-4 flex flex-col items-center justify-center h-full'>
                  <img
                    src={selectedTemplate.url}
                    alt={selectedTemplate.name}
                    className='max-h-[200px] mx-auto mb-4 object-contain opacity-50'
                    crossOrigin='anonymous'
                  />
                  <p className='text-slate-500 mb-4'>
                    Click &quot;Generate Meme&quot; to create your customized
                    meme
                  </p>
                </div>
              ) : (
                <div className='text-center p-8 flex flex-col items-center justify-center h-full'>
                  <p className='text-slate-500'>
                    Select a template and generate a meme to see results here
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
