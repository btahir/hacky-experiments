'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: 'Your story prompt must be at least 10 characters.',
  }),
})

export default function GeminiStory() {
  const [storyImages, setStoryImages] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/gemini-story/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: values.prompt }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate story')
      }
      
      const data = await response.json()
      setStoryImages(data.images)
      toast.success('Story generated!', {
        description: 'Your story has been successfully generated.',
      })
    } catch (error) {
      toast.error('Something went wrong', {
        description: 'Failed to generate story. Please try again.',
      })
      console.error('Error generating story:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Gemini Story Generator</CardTitle>
          <CardDescription>
            Enter your story prompt and Gemini will generate a visual story for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter a detailed story prompt, e.g. 'Create a story about a space explorer discovering a new planet with strange plants and friendly aliens'"
                        className="h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be specific and detailed for better results.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Story'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {storyImages.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Your Generated Story</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {storyImages.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden shadow-md">
                <img 
                  src={image} 
                  alt={`Story scene ${index + 1}`} 
                  className="w-full h-auto"
                  loading="lazy"
                />
                <div className="p-4 bg-muted">
                  <p className="font-medium">Scene {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
