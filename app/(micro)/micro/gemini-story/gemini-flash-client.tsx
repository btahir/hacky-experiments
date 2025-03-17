"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Camera, Zap, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import GeminiStory from "./gemini-story-client";
import LinkedinPhotoConverter from "./linkedin-photo-client";
import MemeTailorClient from "./meme-tailor-client";
import { FlickeringGrid } from "@/components/magicui/flickering-grid";

export default function GeminiFlashApp() {
  const [activeTab, setActiveTab] = useState("story");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white text-gray-900 py-16 px-4 sm:px-6 lg:px-8">
        <FlickeringGrid
          className="absolute inset-0 z-0"
          squareSize={3}
          gridGap={8}
          color="#000000"
          maxOpacity={0.1}
          flickerChance={0.1}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <Zap className="h-16 w-16 text-gray-800" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6">
            <span className="inline-block border-b-4 border-gray-200 pb-1">
              Gemini Flash
            </span>{" "}
            <span className="inline-block text-gray-700">Experiments</span>
          </h1>

          <p className="text-xl max-w-2xl mx-auto mb-8 text-gray-600 px-4 sm:px-0">
            Explore the capabilities of Google&apos;s Gemini AI with these
            interactive demos
          </p>

          <div className="mt-6">
            <Button
              variant="outline"
              size="lg"
              className="bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200 transition-all duration-300"
              asChild
            >
              <a
                href="https://github.com/btahir/hacky-experiments/blob/main/app/(micro)/micro/gemini-story/README.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                View Documentation
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="container mx-auto px-4 py-2">
        <Tabs
          defaultValue="story"
          value={activeTab}
          onValueChange={setActiveTab}
          className="max-w-6xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 p-1 rounded-lg">
              <TabsTrigger
                value="story"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300 rounded-md transition-all"
              >
                <BookOpen className="h-4 w-4" />
                <span>Story Creator</span>
              </TabsTrigger>
              <TabsTrigger
                value="linkedin"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300 rounded-md transition-all"
              >
                <Camera className="h-4 w-4" />
                <span>LinkedIn Photo</span>
              </TabsTrigger>
              <TabsTrigger
                value="meme"
                className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-violet-700 dark:data-[state=active]:text-violet-300 rounded-md transition-all"
              >
                <Smile className="h-4 w-4" />
                <span>Meme Tailor</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="story" className="mt-0">
            <GeminiStory />
          </TabsContent>

          <TabsContent value="linkedin" className="mt-0">
            <LinkedinPhotoConverter />
          </TabsContent>

          <TabsContent value="meme" className="mt-0">
            <MemeTailorClient />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
