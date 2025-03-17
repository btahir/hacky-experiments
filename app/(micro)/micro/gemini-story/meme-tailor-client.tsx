"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, Download, Smile } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounceCallback } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

// API error response interface
interface ApiErrorResponse {
  error: string;
  details?: string;
}

// Meme template interface
interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  box_count: number;
}

export default function MemeTailorClient() {
  // State for meme generation
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for meme templates
  const [memeTemplates, setMemeTemplates] = useState<MemeTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate | null>(
    null
  );

  // State for meme customization
  const [customPrompt, setCustomPrompt] = useState(
    "Transform this image into a Pixar-style 3D animation with their characteristic lighting and texturing"
  );

  // Search for meme templates with debounce
  const debouncedSearch = useDebounceCallback(async (query: string) => {
    if (!query.trim()) {
      setMemeTemplates([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);

      // Direct API call to Imgflip
      const response = await fetch(`https://api.imgflip.com/get_memes`);

      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error_message || "Failed to fetch meme templates");
      }

      // Filter templates based on search query
      const allTemplates = data.data.memes.slice(0, 100) as MemeTemplate[];
      const filteredTemplates = allTemplates.filter((template) =>
        template.name.toLowerCase().includes(query.toLowerCase())
      );

      setMemeTemplates(filteredTemplates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to fetch meme templates");
    } finally {
      setIsSearching(false);
    }
  }, 500);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setIsSearching(true);
    debouncedSearch(query);
  };

  // Select a template
  const selectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    setGeneratedMeme(null); // Reset generated meme when template changes
  };

  // Generate meme from template
  const generateMeme = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    try {
      setIsGenerating(true);

      // Fetch the template image and convert to File
      const templateResponse = await fetch(selectedTemplate.url);
      const templateBlob = await templateResponse.blob();
      const templateFile = new File([templateBlob], "template.jpg", {
        type: "image/jpeg",
      });

      // Create form data for API
      const formData = new FormData();

      // Photo route uses "image" instead of "template"
      formData.append("image", templateFile);

      // Build a prompt for meme generation
      let memePrompt =
        customPrompt ||
        `Create a funny meme based on this template "${selectedTemplate.name}"`;

      // Ensure prompt is at least 5 characters long as required by photo route
      if (memePrompt.length < 5) {
        memePrompt = `Create a funny and engaging meme image based on the template "${selectedTemplate.name}"`;
      }

      formData.append("prompt", memePrompt);

      // Call the API
      const response = await fetch("/api/gemini-flash/photo-edit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.error || "Failed to generate meme");
      }

      const data = await response.json();
      setGeneratedMeme(data.imageUrl);

      toast.success("Meme generated successfully!");
    } catch (error) {
      console.error("Error generating meme:", error);
      toast.error(
        `Failed to generate meme: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Download generated meme
  const downloadMeme = () => {
    if (!generatedMeme) return;

    const link = document.createElement("a");
    link.href = generatedMeme;
    link.download = "meme.jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Meme downloaded!");
  };

  return (
    <div className="flex flex-col items-center">
      {/* Purple Header */}
      <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-4xl mx-auto text-center">
          <Smile className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4">
            Meme Tailor
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Find the perfect meme template and customize it with AI assistance
          </p>
        </div>
      </div>
      <Card className="w-full max-w-4xl mb-8 border border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          {/* Responsive layout - column on mobile, grid on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Template selection and customization */}
            <div className="space-y-6">
              {/* Template Search */}
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="template-search"
                    className="text-base font-medium"
                  >
                    Search Meme Templates
                  </Label>
                  <div className="flex mt-2">
                    <Input
                      id="template-search"
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="flex-1"
                    />
                    <Button
                      variant="secondary"
                      className="ml-2"
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Template results */}
                <ScrollArea className="h-60 border rounded-md">
                  {memeTemplates.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2">
                      {memeTemplates.map((meme) => (
                        <div
                          key={meme.id}
                          className={cn(
                            "p-2 border rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800",
                            selectedTemplate?.id === meme.id &&
                              "border-purple-500 bg-purple-50 dark:bg-purple-950"
                          )}
                          onClick={() => selectTemplate(meme)}
                        >
                          <img
                            src={meme.url}
                            alt={meme.name}
                            className="w-full h-24 object-contain mb-1"
                            crossOrigin="anonymous"
                          />
                          <p className="text-xs truncate text-center">
                            {meme.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500">
                        No meme templates found for &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-slate-500">
                        Search for meme templates above
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Selected Template */}
              {selectedTemplate && (
                <div>
                  <Label className="text-base font-medium">
                    Selected Template
                  </Label>
                  <div className="border rounded-md p-2 flex items-center space-x-3 mt-2">
                    <img
                      src={selectedTemplate.url}
                      alt={selectedTemplate.name}
                      className="h-16 w-16 object-contain"
                      crossOrigin="anonymous"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {selectedTemplate.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Meme Customization */}
              {selectedTemplate && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="prompt">Customization Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Describe your meme..."
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Button
                      disabled={!selectedTemplate || isGenerating}
                      className="w-full"
                      onClick={generateMeme}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        "Generate Meme"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right column - Result display */}
            <div className="flex flex-col items-center justify-start border rounded-md p-4 h-full">
              {generatedMeme ? (
                <>
                  <div className="mb-4 max-w-full overflow-hidden rounded-md shadow-md">
                    <img
                      src={generatedMeme}
                      alt="Generated meme"
                      className="max-w-full object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <Button onClick={downloadMeme} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </>
              ) : selectedTemplate ? (
                <div className="text-center p-4 flex flex-col items-center justify-center h-full">
                  <img
                    src={selectedTemplate.url}
                    alt={selectedTemplate.name}
                    className="max-h-[200px] mx-auto mb-4 object-contain opacity-50"
                    crossOrigin="anonymous"
                  />
                  <p className="text-slate-500 mb-4">
                    Click &quot;Generate Meme&quot; to create your customized
                    meme
                  </p>
                </div>
              ) : (
                <div className="text-center p-8 flex flex-col items-center justify-center h-full">
                  <p className="text-slate-500">
                    Select a template and generate a meme to see results here
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
