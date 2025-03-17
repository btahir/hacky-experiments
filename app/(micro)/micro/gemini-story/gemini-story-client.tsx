'use client'

import { useState, useEffect, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import {
  Loader2,
  AlertCircle,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

// Define the story scene interface
interface StoryScene {
  text: string
  imageUrl: string
}

// API error response interface
interface ApiErrorResponse {
  error: string
  details?: string | unknown
}

// Story form schema
const storyFormSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Your story prompt must be at least 10 characters.',
  }),
})

export default function GeminiStory() {
  // Story generation state
  const [storyScenes, setStoryScenes] = useState<StoryScene[]>([])
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [storyError, setStoryError] = useState<string | null>(null)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [autoSlide, setAutoSlide] = useState(true)
  const autoSlideIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Form hooks
  const storyForm = useForm<z.infer<typeof storyFormSchema>>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      prompt: '',
    },
  })

  // Auto-slide functionality
  useEffect(() => {
    if (storyScenes.length > 0 && autoSlide) {
      // Clear any existing interval
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current)
      }

      // Set up new interval
      autoSlideIntervalRef.current = setInterval(() => {
        setCurrentSceneIndex((prevIndex) =>
          prevIndex === storyScenes.length - 1 ? 0 : prevIndex + 1
        )
      }, 5000) // 5 seconds for each slide
    }

    // Cleanup function
    return () => {
      if (autoSlideIntervalRef.current) {
        clearInterval(autoSlideIntervalRef.current)
      }
    }
  }, [storyScenes, autoSlide])

  // Handler for story generation
  async function onSubmitStory(values: z.infer<typeof storyFormSchema>) {
    setIsGeneratingStory(true)
    setStoryError(null)
    setStoryScenes([])
    setCurrentSceneIndex(0)

    try {
      console.log('Submitting story prompt:', values.prompt)

      const response = await fetch('/api/gemini-flash/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: values.prompt }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse
        console.error('API error:', errorData)

        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error

        throw new Error(errorMessage || 'Failed to generate story')
      }

      if (
        !responseData.scenes ||
        !Array.isArray(responseData.scenes) ||
        responseData.scenes.length === 0
      ) {
        console.error('API returned invalid scenes data:', responseData)
        throw new Error('The story generation API returned invalid data')
      }

      setStoryScenes(responseData.scenes)
      console.log(
        `Received ${responseData.scenes.length} scenes, ${
          responseData.scenes.filter((s: StoryScene) => s.imageUrl).length
        } with images`
      )

      toast.success('Story generated!', {
        description: 'Your story has been successfully generated.',
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error generating story:', err)
      setStoryError(errorMessage)
      toast.error('Something went wrong', {
        description: 'Failed to generate story. Please try again.',
      })
    } finally {
      setIsGeneratingStory(false)
    }
  }

  // Navigation handlers
  const goToNextScene = () => {
    if (currentSceneIndex < storyScenes.length - 1) {
      setCurrentSceneIndex(currentSceneIndex + 1)
    } else {
      setCurrentSceneIndex(0) // Loop back to the beginning
    }
  }

  const goToPrevScene = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex(currentSceneIndex - 1)
    } else {
      setCurrentSceneIndex(storyScenes.length - 1) // Loop to the end
    }
  }

  const toggleAutoSlide = () => {
    setAutoSlide(!autoSlide)
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      {/* Hero Header */}
      <div className='bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8 mb-10'>
        <div className='max-w-4xl mx-auto text-center'>
          <BookOpen className='h-16 w-16 mx-auto mb-4' />
          <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4'>
            Gemini Story Creator
          </h1>
          <p className='text-xl max-w-2xl mx-auto'>
            Transform your ideas into captivating visual stories with
            AI-generated text and images
          </p>
          <div className='mt-4 text-sm'>
            <a
              href='https://github.com/btahir/hacky-experiments/blob/main/app/(micro)/micro/gemini-story/README.md'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors'
            >
              <BookOpen className='h-4 w-4 mr-2' />
              View Documentation
            </a>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <Card className='max-w-2xl mx-auto shadow-lg border-purple-100 dark:border-purple-900 pt-0'>
          <CardHeader className='p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-t-lg'>
            <CardTitle className='text-2xl text-purple-800 dark:text-purple-300'>
              Create Your Story
            </CardTitle>
            <CardDescription className='text-purple-600 dark:text-purple-400'>
              Describe your story idea and watch as Gemini brings it to life
              with vivid scenes and matching imagery.
            </CardDescription>
          </CardHeader>
          <CardContent className='pt-6'>
            <Form {...storyForm}>
              <form
                onSubmit={storyForm.handleSubmit(onSubmitStory)}
                className='space-y-6'
              >
                <FormField
                  control={storyForm.control}
                  name='prompt'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className='text-lg font-medium'>
                        Story Prompt
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter a detailed story prompt, e.g. 'Create a fantasy story about a young wizard discovering ancient magic in a forgotten forest'"
                          className='h-32 resize-none focus:ring-purple-500 focus:border-purple-500'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific with characters, setting, and plot for more
                        detailed and coherent stories.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type='submit'
                  disabled={isGeneratingStory}
                  className='w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                >
                  {isGeneratingStory ? (
                    <>
                      <Loader2 className='mr-2 size-4 animate-spin' />
                      Crafting Your Story...
                    </>
                  ) : (
                    'Generate Story with Images'
                  )}
                </Button>
              </form>
            </Form>

            {storyError && (
              <Alert variant='destructive' className='mt-6'>
                <AlertCircle className='size-4' />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{storyError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Story Results - Slideshow Style with Fixed Heights */}
        {storyScenes.length > 0 && (
          <div className='mt-16 max-w-6xl mx-auto'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-3xl font-bold text-purple-800 dark:text-purple-300'>
                Your Story
              </h2>
              <div className='flex items-center gap-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={toggleAutoSlide}
                  className={cn(
                    'border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300',
                    autoSlide && 'bg-purple-100 dark:bg-purple-900/30'
                  )}
                >
                  {autoSlide ? 'Pause Auto-Play' : 'Auto-Play'}
                </Button>
                <div className='text-sm text-slate-500 dark:text-slate-400'>
                  {currentSceneIndex + 1} of {storyScenes.length}
                </div>
              </div>
            </div>

            {/* Slideshow Container with Fixed Height */}
            <div className='relative bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden'>
              {/* Current Scene - Fixed Height Container */}
              <div className='relative h-[500px]'>
                <div className='h-full md:flex'>
                  {storyScenes[currentSceneIndex].imageUrl ? (
                    <>
                      {/* Image Container - Fixed Height */}
                      <div className='md:w-2/3 h-[250px] md:h-full'>
                        <img
                          src={
                            storyScenes[currentSceneIndex].imageUrl ||
                            '/placeholder.svg'
                          }
                          alt={`Scene ${currentSceneIndex + 1}`}
                          className='w-full h-full object-contain'
                          loading='lazy'
                        />
                      </div>
                      {/* Text Container with ScrollArea for overflow */}
                      <div className='md:w-1/2 h-[250px] md:h-full overflow-hidden'>
                        <ScrollArea className='h-full p-6 md:p-8'>
                          <div className='inline-block px-3 py-1 mb-4 text-xs font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900/50 dark:text-purple-200'>
                            Scene {currentSceneIndex + 1}
                          </div>
                          <div className='prose dark:prose-invert prose-purple max-w-none'>
                            <ReactMarkdown>
                              {storyScenes[currentSceneIndex].text}
                            </ReactMarkdown>
                          </div>
                        </ScrollArea>
                      </div>
                    </>
                  ) : (
                    <div className='w-full h-full overflow-hidden'>
                      <ScrollArea className='h-full p-8'>
                        <div className='flex items-center gap-2 mb-4'>
                          <ImageIcon className='text-purple-400' />
                          <div className='inline-block px-3 py-1 text-xs font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900/50 dark:text-purple-200'>
                            Scene {currentSceneIndex + 1} (No Image)
                          </div>
                        </div>
                        <div className='prose dark:prose-invert prose-purple max-w-none'>
                          <ReactMarkdown>
                            {storyScenes[currentSceneIndex].text}
                          </ReactMarkdown>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-md z-10'
                  onClick={goToPrevScene}
                >
                  <ChevronLeft className='h-6 w-6' />
                  <span className='sr-only'>Previous</span>
                </Button>

                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-md z-10'
                  onClick={goToNextScene}
                >
                  <ChevronRight className='h-6 w-6' />
                  <span className='sr-only'>Next</span>
                </Button>
              </div>

              {/* Scene Indicators */}
              <div className='flex justify-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50'>
                {storyScenes.map((_, index) => (
                  <button
                    key={index}
                    className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all',
                      index === currentSceneIndex
                        ? 'bg-purple-600 w-6'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-purple-400 dark:hover:bg-purple-700'
                    )}
                    onClick={() => setCurrentSceneIndex(index)}
                    aria-label={`Go to scene ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
