"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toPng } from "html-to-image";

export default function BeforeAfterClient() {
  const [beforeImage, setBeforeImage] = useState<string | null>(null);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleBeforeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBeforeImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAfterImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAfterImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const captureScreenshot = async () => {
    if (contentRef.current) {
      setCapturing(true);
      try {
        const image = await toPng(contentRef.current);

        // Create a download link
        const link = document.createElement("a");
        link.href = image;
        link.download = "before-after-screenshot.png";
        link.click();
      } catch (error) {
        console.error("Error capturing screenshot:", error);
      } finally {
        setCapturing(false);
      }
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold mb-3 text-blue-600">
          Before After Shot
        </h1>
        <p className="text-gray-600 max-w-xs sm:max-w-lg mx-auto">
          Upload your before and after images to create a beautiful comparison
          that you can download and share.
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

      <div className="mb-8">
        <Button
          onClick={captureScreenshot}
          disabled={!beforeImage || !afterImage || capturing}
          className="w-full"
        >
          {capturing ? "Capturing..." : "Capture Comparison"}
        </Button>
      </div>

      <Card className="p-6" ref={contentRef}>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative">
          {beforeImage ? (
            <div className="relative w-full max-w-sm mx-auto flex justify-center">
              <img
                src={beforeImage}
                alt="Before"
                className="rounded-lg shadow-md object-cover h-72 sm:h-80"
              />
            </div>
          ) : (
            <div className="w-full max-w-sm h-64 bg-slate-200 rounded-lg flex items-center justify-center">
              <p className="text-slate-500">Upload &quot;Before&quot; image</p>
            </div>
          )}

          {/* Curvy Arrow */}
          {beforeImage && afterImage && (
            <div className="transform rotate-90 md:rotate-0 my-4 md:my-0">
              <svg
                width="100"
                height="50"
                viewBox="0 0 100 50"
                className="text-blue-600"
              >
                <path
                  d="M 10,25 C 40,5 60,45 90,25"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M 80,15 L 90,25 L 80,35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {afterImage ? (
            <div className="relative w-full max-w-sm mx-auto flex justify-center">
              <img
                src={afterImage}
                alt="After"
                className="rounded-lg shadow-md object-cover h-72 sm:h-80"
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
          Upload before and after images, then click &quot;Capture
          Comparison&quot; to save the result.
        </p>
      </div>
    </div>
  );
}
