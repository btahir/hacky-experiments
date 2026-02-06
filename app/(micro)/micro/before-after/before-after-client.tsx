'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toPng } from 'html-to-image'
import { ArrowRightLeft } from 'lucide-react'

export default function BeforeAfterClient() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null)
  const [afterImage, setAfterImage] = useState<string | null>(null)
  const [capturing, setCapturing] = useState(false)
  const [arrowStyle, setArrowStyle] = useState('thick-curve')
  const contentRef = useRef<HTMLDivElement>(null)

  const arrowOptions = [
    { value: 'fat-loop', label: 'Fat Loop' },
    { value: 'squeeze', label: 'Squeeze' },
    { value: 'straight', label: 'Straight' },
    { value: 'swirl', label: 'Swirl' },
    { value: 'thin-loop', label: 'Thin Loop' },
    { value: 'thin-curve', label: 'Thin Curve' },
    { value: 'thick-curve', label: 'Thick Curve' },
  ]

  const handleBeforeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setBeforeImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAfterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setAfterImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const captureScreenshot = async () => {
    if (contentRef.current) {
      setCapturing(true)
      try {
        const image = await toPng(contentRef.current)

        // Create a download link
        const link = document.createElement('a')
        link.href = image
        link.download = 'before-after-screenshot.png'
        link.click()
      } catch (error) {
        console.error('Error capturing screenshot:', error)
      } finally {
        setCapturing(false)
      }
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <div className="flex flex-col items-center justify-center my-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute -inset-1 bg-primary rounded-lg blur opacity-30"></div>
              <div className="relative bg-card border-2 border-primary rounded-lg p-2">
                <ArrowRightLeft className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-gray-900">Before</span>
              <span className="relative mx-2 inline-block">
                <span className="absolute inset-x-0 bottom-0 h-3 bg-primary/20 opacity-30"></span>
                <span className="relative text-primary">After</span>
              </span>
              <span className="text-gray-900">Shot</span>
            </h1>
          </div>
          <div className="h-1 w-24 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
        </div>
        <p className="text-gray-600 max-w-xs sm:max-w-lg mx-auto">
          Upload your before and after images to create a beautiful comparison that you can download
          and share.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <Label htmlFor="before-image" className="mb-2 block">
            Before Image
          </Label>
          <Input
            id="before-image"
            type="file"
            accept="image/*"
            onChange={handleBeforeImageUpload}
            className="mb-4"
          />
        </div>
        <div>
          <Label htmlFor="after-image" className="mb-2 block">
            After Image
          </Label>
          <Input
            id="after-image"
            type="file"
            accept="image/*"
            onChange={handleAfterImageUpload}
            className="mb-4"
          />
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="arrow-style" className="mb-2 block">
          Arrow Style
        </Label>
        <Select value={arrowStyle} onValueChange={setArrowStyle}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an arrow style" />
          </SelectTrigger>
          <SelectContent>
            {arrowOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-8">
        <Button
          onClick={captureScreenshot}
          disabled={!beforeImage || !afterImage || capturing}
          className="w-full"
        >
          {capturing ? 'Capturing...' : 'Capture Comparison'}
        </Button>
      </div>

      <Card className="p-6" ref={contentRef}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative">
          {beforeImage ? (
            <div className="relative w-full max-w-sm mx-auto flex justify-center">
              <img
                src={beforeImage}
                alt="Before"
                className="rounded-lg shadow-md object-cover"
                width={320}
                height={320}
              />
            </div>
          ) : (
            <div className="w-full max-w-sm h-64 bg-slate-200 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">Upload &quot;Before&quot; image</p>
            </div>
          )}

          {/* Arrow from SVG assets */}
          {beforeImage && afterImage && (
            <div className="transform rotate-90 md:rotate-0 my-4 md:my-0 flex items-center justify-center w-32 h-16">
              <img
                src={`/micro-experiments/arrows/${arrowStyle}.svg`}
                alt="Transformation arrow"
                className="w-full h-full"
                width={100}
                height={50}
              />
            </div>
          )}

          {afterImage ? (
            <div className="relative w-full max-w-sm mx-auto flex justify-center">
              <img
                src={afterImage}
                alt="After"
                className="rounded-lg shadow-md object-cover"
                width={320}
                height={320}
              />
            </div>
          ) : (
            <div className="w-full max-w-sm h-64 bg-slate-200 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">Upload &quot;After&quot; image</p>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-8 text-center text-sm text-slate-500">
        <p>
          Upload before and after images, then click &quot;Capture Comparison&quot; to save the
          result.
        </p>
      </div>
    </div>
  )
}
