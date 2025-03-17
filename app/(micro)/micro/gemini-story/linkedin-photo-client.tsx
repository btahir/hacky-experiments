'use client'

import { useState, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Image from 'next/image'
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
import { toast } from 'sonner'
import { Loader2, ImageIcon, Upload, Camera } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// API error response interface
interface ApiErrorResponse {
  error: string
  details?: string | unknown
}

// Define the file input schema with validation
const photoFormSchema = z.object({
  enhancementPrompt: z.string().min(5, {
    message: 'Enhancement prompt must be at least 5 characters.',
  }),
})

export default function LinkedinPhotoConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form hooks
  const photoForm = useForm<z.infer<typeof photoFormSchema>>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      enhancementPrompt: 'Make this into a professional LinkedIn profile photo with a clean background.',
    },
  })

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (JPEG, PNG, etc.)',
      })
      return
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'The maximum file size is 5MB.',
      })
      return
    }

    setSelectedFile(file)
    setError(null)
    setEnhancedImageUrl(null)

    // Create preview URL
    const fileReader = new FileReader()
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string)
    }
    fileReader.readAsDataURL(file)
  }

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Handle form submission
  async function onSubmitPhoto(values: z.infer<typeof photoFormSchema>) {
    if (!selectedFile) {
      toast.error('No image selected', {
        description: 'Please upload an image first.',
      })
      return
    }

    setIsProcessing(true)
    setError(null)
    setEnhancedImageUrl(null)

    try {
      // Convert the file to base64
      const base64 = await fileToBase64(selectedFile)
      
      const response = await fetch('/api/gemini-flash/photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          prompt: values.enhancementPrompt,
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const errorData = responseData as ApiErrorResponse
        console.error('API error:', errorData)

        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error

        throw new Error(errorMessage || 'Failed to enhance photo')
      }

      if (!responseData.enhancedImage) {
        console.error('API returned invalid data:', responseData)
        throw new Error('The photo enhancement API returned invalid data')
      }

      setEnhancedImageUrl(responseData.enhancedImage)
      toast.success('Photo enhanced!', {
        description: 'Your photo has been successfully enhanced.',
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred'
      console.error('Error enhancing photo:', err)
      setError(errorMessage)
      toast.error('Something went wrong', {
        description: 'Failed to enhance photo. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Helper to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Extract base64 data from the data URL
        const base64Data = result.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = error => reject(error)
    })
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
      {/* Hero Header */}
      <div className='bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-12 px-4 sm:px-6 lg:px-8 mb-10'>
        <div className='max-w-4xl mx-auto text-center'>
          <Camera className='h-16 w-16 mx-auto mb-4' />
          <h1 className='text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4'>
            LinkedIn Photo Enhancer
          </h1>
          <p className='text-xl max-w-2xl mx-auto'>
            Transform your regular photos into professional LinkedIn-ready profile pictures with AI
          </p>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid md:grid-cols-2 gap-8 max-w-6xl mx-auto'>
          {/* Upload Section */}
          <Card className='shadow-lg border-blue-100 dark:border-blue-900'>
            <CardHeader className='p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-t-lg'>
              <CardTitle className='text-2xl text-blue-800 dark:text-blue-300'>
                Upload Your Photo
              </CardTitle>
              <CardDescription className='text-blue-600 dark:text-blue-400'>
                Select a photo to enhance for your professional profile
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              <input
                type='file'
                accept='image/*'
                ref={fileInputRef}
                onChange={handleFileChange}
                className='hidden'
              />
              
              <div 
                className={cn(
                  'border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors',
                  previewUrl 
                    ? 'border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/10'
                )}
                onClick={handleUploadClick}
              >
                {previewUrl ? (
                  <div className='flex flex-col items-center'>
                    <div className='w-48 h-48 mx-auto overflow-hidden rounded-lg mb-4 relative'>
                      <Image 
                        src={previewUrl} 
                        alt='Preview' 
                        fill
                        className='object-cover'
                      />
                    </div>
                    <p className='text-sm text-blue-600 dark:text-blue-400'>Click to change photo</p>
                  </div>
                ) : (
                  <div className='flex flex-col items-center space-y-2'>
                    <Upload className='h-12 w-12 text-blue-500 dark:text-blue-400 mb-2' />
                    <p className='text-lg font-medium'>Click to upload an image</p>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      JPEG, PNG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>

              <Form {...photoForm}>
                <form
                  onSubmit={photoForm.handleSubmit(onSubmitPhoto)}
                  className='space-y-6'
                >
                  <FormField
                    control={photoForm.control}
                    name='enhancementPrompt'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-lg font-medium'>
                          Enhancement Instructions
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe how you want to enhance your photo, e.g. 'Add a professional blue background and make it look like a LinkedIn profile photo'"
                            className='h-24 resize-none focus:ring-blue-500 focus:border-blue-500'
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Be specific about the professional look you want to achieve
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type='submit'
                    disabled={isProcessing || !selectedFile}
                    className='w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className='mr-2 size-4 animate-spin' />
                        Enhancing Your Photo...
                      </>
                    ) : (
                      'Enhance Photo'
                    )}
                  </Button>
                </form>
              </Form>

              {error && (
                <Alert variant='destructive' className='mt-6'>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className='shadow-lg border-blue-100 dark:border-blue-900'>
            <CardHeader className='p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-t-lg'>
              <CardTitle className='text-2xl text-blue-800 dark:text-blue-300'>
                Enhanced Result
              </CardTitle>
              <CardDescription className='text-blue-600 dark:text-blue-400'>
                Your AI-enhanced professional photo
              </CardDescription>
            </CardHeader>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center justify-center h-[400px] border rounded-lg bg-slate-50 dark:bg-slate-800/50'>
                {isProcessing ? (
                  <div className='flex flex-col items-center space-y-4'>
                    <Loader2 className='h-12 w-12 text-blue-500 animate-spin' />
                    <p className='text-lg text-blue-600 dark:text-blue-400'>Processing your photo...</p>
                  </div>
                ) : enhancedImageUrl ? (
                  <div className='w-full h-full flex items-center justify-center p-4'>
                    <div className='relative max-w-full max-h-full'>
                      <div className='relative w-full max-h-[350px] min-h-[200px] min-w-[200px]'>
                        <Image
                          src={enhancedImageUrl}
                          alt='Enhanced LinkedIn Photo'
                          fill
                          className='object-contain rounded-lg shadow-md'
                        />
                        <a
                          href={enhancedImageUrl}
                          download='linkedin-enhanced-photo.png'
                          className='absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2 text-sm'
                        >
                          <ImageIcon className='h-4 w-4' />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center space-y-2 text-gray-400 dark:text-gray-500'>
                    <ImageIcon className='h-16 w-16' />
                    <p className='text-lg font-medium'>
                      {selectedFile
                        ? 'Click "Enhance Photo" to see the result'
                        : 'Upload a photo to get started'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
