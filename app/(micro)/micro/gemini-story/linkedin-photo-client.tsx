"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Upload, ImageIcon, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  PHOTO_STYLES,
  GENDER_OPTIONS,
  BACKGROUND_COLORS,
  buildPhotoPrompt,
} from "./linkedin-photo-templates";

// API error response interface
interface ApiErrorResponse {
  error: string;
  details?: string | unknown;
}

// Form schema for photo enhancement
const photoFormSchema = z.object({
  templateId: z.string().min(1, { message: "Please select a photo style" }),
  gender: z.string().min(1, { message: "Please select a gender option" }),
  backgroundColor: z
    .string()
    .min(1, { message: "Please select a background color" }),
});

type PhotoFormValues = z.infer<typeof photoFormSchema>;

export default function LinkedinPhotoConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [compareView, setCompareView] = useState(true);

  // Form for photo enhancement
  const photoForm = useForm<PhotoFormValues>({
    resolver: zodResolver(photoFormSchema),
    defaultValues: {
      templateId: "professional-headshot",
      gender: "neutral",
      backgroundColor: "neutral_gray",
    },
  });

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type", {
        description: "Please upload an image file (JPEG, PNG, etc.)",
      });
      return;
    }

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", {
        description: "The maximum file size is 5MB.",
      });
      return;
    }

    setSelectedFile(file);
    setError(null);
    setEnhancedImageUrl(null);

    // Create preview URL
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle photo enhancement form submission
  const onSubmitPhoto = async (data: PhotoFormValues) => {
    if (!selectedFile) {
      toast.error("Please upload a photo first");
      return;
    }

    setError(null);
    setIsProcessing(true);
    setEnhancedImageUrl(null);

    // Build the custom prompt based on selected options
    const customPrompt = buildPhotoPrompt(
      data.templateId,
      data.gender,
      data.backgroundColor
    );

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("prompt", customPrompt);

      const response = await fetch("/api/gemini-flash/photo", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const errorResponse = result as ApiErrorResponse;
        throw new Error(errorResponse.error || "Failed to enhance photo");
      }

      setEnhancedImageUrl(result.imageUrl);
      toast.success("Photo enhanced successfully!");
    } catch (err) {
      console.error("Error enhancing photo:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      toast.error("Failed to enhance photo");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8 mb-10">
        <div className="max-w-4xl mx-auto text-center">
          <Camera className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4">
            LinkedIn Photo Enhancer
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            Transform your regular photos into professional LinkedIn-ready
            profile pictures with AI
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload Section */}
          <Card className="shadow-lg border-purple-100 dark:border-purple-900">
            <CardHeader className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-t-lg">
              <CardTitle className="text-2xl text-purple-800 dark:text-purple-300">
                Upload Your Photo
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400">
                Select a photo to enhance for your professional profile
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-colors",
                  previewUrl
                    ? "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20"
                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 dark:border-gray-700 dark:hover:border-purple-600 dark:hover:bg-purple-900/10"
                )}
                onClick={handleUploadClick}
              >
                {previewUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 mx-auto overflow-hidden rounded-lg mb-4 relative">
                      <img
                        src={previewUrl}
                        alt="Selected photo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">
                      Click to change photo
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <Upload className="h-12 w-12 text-purple-500 dark:text-purple-400 mb-2" />
                    <p className="text-lg font-medium">
                      Click to upload an image
                    </p>
                    <p className="text-sm text-gray-500">
                      JPEG, PNG, GIF up to 5MB
                    </p>
                  </div>
                )}
              </div>

              <form
                onSubmit={photoForm.handleSubmit(onSubmitPhoto)}
                className="space-y-6"
              >
                {/* Photo Style Dropdown */}
                <div className="space-y-2">
                  <label
                    className="text-lg font-medium"
                    htmlFor="template-select"
                  >
                    Photo Style
                  </label>
                  <div className="relative">
                    <select
                      id="template-select"
                      value={photoForm.watch("templateId")}
                      onChange={(e) =>
                        photoForm.setValue("templateId", e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    >
                      {Object.values(PHOTO_STYLES).map((style) => (
                        <option key={style.id} value={style.id}>
                          {style.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Gender Option Dropdown */}
                <div className="space-y-2">
                  <label
                    className="text-lg font-medium"
                    htmlFor="gender-select"
                  >
                    Clothing Style
                  </label>
                  <div className="relative">
                    <select
                      id="gender-select"
                      value={photoForm.watch("gender")}
                      onChange={(e) =>
                        photoForm.setValue("gender", e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    >
                      {Object.values(GENDER_OPTIONS).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Background Color Dropdown */}
                <div className="space-y-2">
                  <label
                    className="text-lg font-medium"
                    htmlFor="background-select"
                  >
                    Background Color
                  </label>
                  <div className="relative">
                    <select
                      id="background-select"
                      value={photoForm.watch("backgroundColor")}
                      onChange={(e) =>
                        photoForm.setValue("backgroundColor", e.target.value)
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    >
                      {Object.values(BACKGROUND_COLORS).map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing || !selectedFile}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  variant="default"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    "Enhance Photo"
                  )}
                </Button>
              </form>

              {error && (
                <Alert variant="destructive" className="mt-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="shadow-lg border-purple-100 dark:border-purple-900">
            <CardHeader className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-t-lg">
              <CardTitle className="text-2xl text-purple-800 dark:text-purple-300">
                Enhanced Result
              </CardTitle>
              <CardDescription className="text-purple-600 dark:text-purple-400">
                Your AI-enhanced professional photo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
                    <p className="text-lg text-purple-600 dark:text-purple-400">
                      Processing your photo...
                    </p>
                  </div>
                </div>
              ) : enhancedImageUrl && previewUrl ? (
                <div className="space-y-4">
                  {/* View Toggle */}
                  <div className="flex justify-end">
                    <div className="inline-flex items-center rounded-md overflow-hidden shadow-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompareView(true)}
                        className={cn(
                          "px-4 py-2 rounded-l-md rounded-r-none border-r transition-all duration-200",
                          compareView
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:hover:bg-purple-800/60"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="i-lucide-columns text-sm" />
                          Before/After
                        </span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCompareView(false)}
                        className={cn(
                          "px-4 py-2 rounded-r-md rounded-l-none transition-all duration-200",
                          !compareView
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:hover:bg-purple-800/60"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span className="i-lucide-maximize-2 text-sm" />
                          Full Image
                        </span>
                      </Button>
                    </div>
                  </div>

                  {compareView ? (
                    <>
                      {/* Before/After Label */}
                      <div className="grid grid-cols-2 text-center font-semibold">
                        <div className="text-gray-600 dark:text-gray-300">
                          Before
                        </div>
                        <div className="text-purple-600 dark:text-purple-400">
                          After
                        </div>
                      </div>

                      {/* Before/After Images - Simple fixed containers */}
                      <div className="grid grid-cols-2 h-[400px] border rounded-lg bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
                        {/* Before Image */}
                        <div className="h-full border-r border-dashed border-gray-300 dark:border-gray-700 p-2 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center overflow-hidden">
                            <img
                              src={previewUrl}
                              alt="Original Photo"
                              className="w-[250px] h-[250px] object-cover rounded-sm"
                            />
                          </div>
                        </div>

                        {/* After Image */}
                        <div className="h-full p-2 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center overflow-hidden">
                            <img
                              src={enhancedImageUrl}
                              alt="Enhanced LinkedIn Photo"
                              className="w-[250px] h-[250px] object-cover rounded-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-[450px] border rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-4">
                      <img
                        src={enhancedImageUrl}
                        alt="Enhanced LinkedIn Photo"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {/* Download Button */}
                  <div className="flex justify-end">
                    <Button
                      asChild
                      variant="default"
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <a
                        href={enhancedImageUrl}
                        download="linkedin-enhanced-photo.png"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Download Enhanced Photo
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[500px] border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex flex-col items-center space-y-2 text-gray-400 dark:text-gray-500">
                    <ImageIcon className="h-16 w-16" />
                    <p className="text-lg font-medium">
                      {selectedFile
                        ? 'Choose a style and click "Enhance Photo"'
                        : "Upload a photo to get started"}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
