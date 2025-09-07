'use client'

import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Upload, RotateCcw, Download } from "lucide-react"

type AgedPhoto = {
  image: string
  age: number
  index: number
}

export default function TimeTravelerApp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [currentAge, setCurrentAge] = useState<number>(25)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPhotos, setGeneratedPhotos] = useState<AgedPhoto[]>([])
  const [error, setError] = useState<string>("")
  
  // Individual regeneration states
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null)
  const [customPrompts, setCustomPrompts] = useState<{ [key: number]: string }>({})
  const [showPromptEditor, setShowPromptEditor] = useState<{ [key: number]: boolean }>({})
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setError("")
      setGeneratedPhotos([])
    }
  }

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError("Please select an image first")
      return
    }

    setIsGenerating(true)
    setError("")
    
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('currentAge', currentAge.toString())

    try {
      const response = await fetch('/api/time-traveler/generate', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success && result.images) {
        const agedPhotos: AgedPhoto[] = result.images.map((image: string, index: number) => ({
          image,
          age: currentAge + (index + 1) * 10,
          index
        }))
        setGeneratedPhotos(agedPhotos)
      } else {
        setError(result.error || "Failed to generate age progression")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async (photoIndex: number) => {
    if (!selectedFile) return

    setRegeneratingIndex(photoIndex)
    setError("")

    const targetAge = currentAge + (photoIndex + 1) * 10
    const customPrompt = customPrompts[photoIndex] || ""
    
    const formData = new FormData()
    formData.append('image', selectedFile)
    formData.append('targetAge', targetAge.toString())
    formData.append('currentAge', currentAge.toString())
    formData.append('customPrompt', customPrompt)

    try {
      const response = await fetch('/api/time-traveler/regenerate', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success && result.image) {
        setGeneratedPhotos(prev => 
          prev.map((photo, index) => 
            index === photoIndex ? { ...photo, image: result.image! } : photo
          )
        )
        setShowPromptEditor(prev => ({ ...prev, [photoIndex]: false }))
      } else {
        setError(result.error || "Failed to regenerate photo")
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error(error)
    } finally {
      setRegeneratingIndex(null)
    }
  }

  const downloadImage = (imageData: string, age: number) => {
    const link = document.createElement('a')
    link.href = imageData
    link.download = `aged-${age}-years.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl">⏳</span>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Time Traveler
            </h1>
            <span className="text-4xl">👴</span>
          </div>
          <p className="text-gray-700 text-sm sm:text-base max-w-2xl mx-auto">
            🌟 See yourself age gracefully through the decades! Upload your photo and watch time unfold before your eyes ✨
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-medium">
            <span>🔮</span>
            <span>AI-Powered Aging Magic</span>
            <span>🔮</span>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="shadow-xl bg-white/80 backdrop-blur border-2 border-amber-200/50 pt-0">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-amber-800 py-2">
              <span className="text-2xl">📷</span>
              <span>Upload Your Photo</span>
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1">
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-amber-300 hover:border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 font-medium transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                <span className="truncate">
                  {selectedFile ? `📸 ${selectedFile.name}` : "🖼️ Choose your photo to age"}
                </span>
              </Button>
            </div>
            <div className="flex items-center gap-2 justify-center sm:justify-start bg-gradient-to-r from-yellow-100 to-amber-100 p-3 rounded-lg border border-amber-200">
              <span className="text-lg">🎂</span>
              <Label htmlFor="currentAge" className="text-sm font-medium text-amber-800">Current Age:</Label>
              <Input
                id="currentAge"
                type="number"
                value={currentAge}
                onChange={(e) => setCurrentAge(parseInt(e.target.value) || 25)}
                className="w-20 border-amber-300 focus:border-amber-500 bg-white/90"
                min="1"
                max="100"
              />
              <span className="text-xs text-amber-600">years</span>
            </div>
          </div>

          {previewUrl && (
            <div className="flex justify-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-200">
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-w-xs max-h-64 object-contain rounded-lg border-2 border-white shadow-lg"
                />
                <div className="absolute -top-2 -right-2 text-2xl animate-pulse">✨</div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleGenerate} 
            disabled={!selectedFile || isGenerating}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-lg transform transition-all duration-200 hover:scale-105"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                <span className="animate-pulse">🔮 Traveling through time...</span>
              </>
            ) : (
              <>
                <span className="text-lg mr-2">⏰</span>
                Generate 5 Age Progressions
                <span className="text-lg ml-2">🚀</span>
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
              <span className="text-lg">⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </CardContent>
        </Card>

        {/* Results Section */}
        {generatedPhotos.length > 0 && (
          <Card className="shadow-2xl bg-white/90 backdrop-blur border-2 border-purple-200/50 pt-0">
            <CardHeader className="bg-gradient-to-r from-purple-100 via-pink-100 to-amber-100 rounded-t-lg py-2">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <span className="text-2xl">🕰️</span>
                <span>Your Aging Journey</span>
                <span className="text-2xl">👑</span>
              </CardTitle>
              <p className="text-sm text-purple-700 flex items-center gap-2">
                <span>✨</span>
                <span>Click on any photo to regenerate it with custom magic</span>
                <span>🎨</span>
              </p>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {generatedPhotos.map((photo, index) => (
                <div key={index} className="space-y-3 transform transition-all duration-300 hover:scale-105">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-amber-400 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-300"></div>
                    <div className="relative">
                      <img 
                        src={photo.image} 
                        alt={`Age ${photo.age}`}
                        className="w-full aspect-square object-cover rounded-lg border-2 border-white shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300"
                        onClick={() => setShowPromptEditor(prev => ({ ...prev, [index]: !prev[index] }))}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadImage(photo.image, photo.age)
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-center bg-gradient-to-r from-amber-100 to-orange-100 p-2 rounded-lg border border-amber-200">
                    <p className="text-lg font-bold text-amber-800 flex items-center justify-center gap-1">
                      <span>{photo.age} years</span>                      
                    </p>
                  </div>

                  {/* Fixed height container to prevent layout shift */}
                  <div className="h-auto lg:h-80">
                    {showPromptEditor[index] ? (
                      <div className="space-y-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-purple-200 shadow-lg h-full">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🎨</span>
                          <Label className="text-sm font-bold text-purple-800">Custom Aging Magic</Label>
                          <span className="text-lg">✨</span>
                        </div>
                        <Textarea
                          placeholder="🪄 Add your magic touch! (e.g., 'silver wisdom streaks', 'gentle laugh lines', 'distinguished beard')"
                          value={customPrompts[index] || ""}
                          onChange={(e) => setCustomPrompts(prev => ({ ...prev, [index]: e.target.value }))}
                          rows={2}
                          className="text-sm border-purple-300 focus:border-purple-500 bg-white/80"
                        />
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRegenerate(index)}
                            disabled={regeneratingIndex === index}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium"
                          >
                            {regeneratingIndex === index ? (
                              <>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                <span className="animate-pulse">Regenerating...</span>
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Regenerate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPromptEditor(prev => ({ ...prev, [index]: false }))}
                            className="border-purple-300 text-purple-600 hover:bg-purple-50"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}