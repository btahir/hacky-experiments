"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Download,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { loadGifJs } from "./loadGif";

interface UploadedImage {
  file: File;
  url: string;
  name: string;
  width?: number;
  height?: number;
}

type FitMode = "contain" | "cover" | "stretch";

export default function FlipBookClient() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState([4]);
  const [isGeneratingGif, setIsGeneratingGif] = useState(false);
  const [gifProgress, setGifProgress] = useState(0);
  const [fit, setFit] = useState<FitMode>("contain");

  const intervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helpers
  const loadHTMLImage = useCallback(async (url: string): Promise<HTMLImageElement> => {
    const img = new Image();
    img.src = url;
    
    if (img.complete && img.naturalWidth > 0) {
      return img;
    }
    
    return new Promise((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Failed to load image"));
    });
  }, []);

  const onFilesChosen = useCallback(async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith("image/"));
    if (valid.length === 0) {
      toast.error("No valid image files");
      return;
    }
    const prepared: UploadedImage[] = [];
    for (const file of valid) {
      const url = URL.createObjectURL(file);
      try {
        const img = await loadHTMLImage(url);
        prepared.push({ file, url, name: file.name, width: img.width, height: img.height });
      } catch {
        URL.revokeObjectURL(url);
        toast.error(`Failed to read ${file.name}`);
      }
    }
    if (prepared.length) {
      setImages(prev => [...prev, ...prepared]);
      setCurrentIndex(0);
      toast.success(`Added ${prepared.length} image(s)`);
    }
  }, [loadHTMLImage]);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      await onFilesChosen(files);
    },
    [onFilesChosen]
  );
  // Playback controls
  const togglePlay = useCallback(() => {
    if (images.length < 2) {
      toast.error("Add at least 2 images");
      return;
    }
    setIsPlaying(v => !v);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    if (images.length === 0) return;
    setIsPlaying(false);
    setCurrentIndex(prev => {
      const newIndex = (prev - 1 + images.length) % images.length;
      return Math.max(0, Math.min(newIndex, images.length - 1));
    });
  }, [images.length]);

  const goToNext = useCallback(() => {
    if (images.length === 0) return;
    setIsPlaying(false);
    setCurrentIndex(prev => {
      const newIndex = (prev + 1) % images.length;
      return Math.max(0, Math.min(newIndex, images.length - 1));
    });
  }, [images.length]);

  // Auto play
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      const id = window.setInterval(() => {
        setCurrentIndex(prev => {
          const newIndex = (prev + 1) % images.length;
          return Math.max(0, Math.min(newIndex, images.length - 1));
        });
      }, Math.max(10, Math.floor(1000 / fps[0])));
      intervalRef.current = id;
    } else if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [isPlaying, fps, images.length]);





  // Draw with fit
  const drawToCanvas = useCallback(
    (ctx: CanvasRenderingContext2D, img: HTMLImageElement, W: number, H: number) => {
      ctx.fillStyle = "#0a0f1c";
      ctx.fillRect(0, 0, W, H);

      if (fit === "stretch") {
        ctx.drawImage(img, 0, 0, W, H);
        return;
      }
      
      const rImg = img.width / img.height;

      if (fit === "contain") {
        let dw = W;
        let dh = W / rImg;
        if (dh > H) {
          dh = H;
          dw = H * rImg;
        }
        const dx = (W - dw) * 0.5;
        const dy = (H - dh) * 0.5;
        ctx.drawImage(img, dx, dy, dw, dh);
        return;
      }

      // cover
      let dw = W;
      let dh = W / rImg;
      if (dh < H) {
        dh = H;
        dw = H * rImg;
      }
      const dx = (W - dw) * 0.5;
      const dy = (H - dh) * 0.5;
      ctx.drawImage(img, dx, dy, dw, dh);
    },
    [fit]
  );

  // Fast animated image generation
  const generateGif = useCallback(async () => {
    try {
      if (images.length < 2) {
        toast.error("Add at least 2 images");
        return;
      }

      setIsGeneratingGif(true);
      setGifProgress(0);

      // Load gif.js library
      await loadGifJs();
      const GIF = (window as any).GIF;
      if (!GIF) {
        throw new Error("Failed to load gif.js library");
      }

      // Use stored dimensions from when images were uploaded
      const maxWidth = Math.max(...images.map(img => img.width || 800));
      const maxHeight = Math.max(...images.map(img => img.height || 600));
      
      // Use reasonable canvas size
      const width = Math.min(maxWidth, 1920);
      const height = Math.min(maxHeight, 1080);

      // Create image elements from current images
      const htmlImgs: HTMLImageElement[] = [];
      for (const imgData of images) {
        const img = new Image();
        img.src = imgData.url;
        htmlImgs.push(img);
      }
      setGifProgress(20);

      // Create GIF encoder with DEFAULT worker (don't specify workerScript)
      const gif = new GIF({
        workers: 2,
        quality: 10, // Lower = better quality (1-20 range typically)
        width: width,
        height: height,
        // Don't specify workerScript - use the default from gif.js
      });

      // Set up progress tracking
      gif.on('progress', (progress: number) => {
        const overallProgress = 20 + Math.round(progress * 60);
        setGifProgress(overallProgress);
      });

      // Handle completion
      gif.on('finished', (blob: Blob) => {
        try {
          console.log('GIF created, size:', blob.size);

          if (!blob || blob.size === 0) {
            throw new Error("GIF generation produced empty result");
          }

          // Validate blob type
          if (blob.type && !blob.type.includes('gif')) {
            console.warn('Unexpected blob type:', blob.type);
          }

          // Download the blob
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `flipbook-${Date.now()}.gif`;
          document.body.appendChild(a);
          a.click();

          setTimeout(() => {
            if (document.body.contains(a)) {
              document.body.removeChild(a);
            }
            URL.revokeObjectURL(url);
          }, 100);

          setGifProgress(100);
          setTimeout(() => {
            setIsGeneratingGif(false);
            toast.success("GIF downloaded!");
          }, 500);
        } catch (finishErr) {
          console.error('Error in finished handler:', finishErr);
          toast.error("Failed to download GIF: " + (finishErr as Error).message);
          setIsGeneratingGif(false);
        }
      });

      // Handle errors
      gif.on('abort', () => {
        console.error('GIF generation aborted');
        toast.error("GIF generation was aborted");
        setIsGeneratingGif(false);
      });

      // Calculate frame delay
      const delay = Math.round(1000 / fps[0]);

      // Create a canvas for rendering frames
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      // Add each frame
      console.log(`Creating GIF with ${htmlImgs.length} frames at ${fps[0]} FPS (${width}x${height})`);

      for (let i = 0; i < htmlImgs.length; i++) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        // Draw image
        const img = htmlImgs[i];
        drawToCanvas(ctx, img, width, height);

        // Add frame to GIF
        gif.addFrame(ctx, {
          copy: true,
          delay: delay
        });

        const frameProgress = 20 + Math.round((i / htmlImgs.length) * 20);
        setGifProgress(frameProgress);
      }

      // Start rendering
      console.log(`Starting GIF render with ${htmlImgs.length} frames...`);
      gif.render();

    } catch (err) {
      console.error('GIF generation error:', err);
      toast.error("Failed to generate GIF: " + (err as Error).message);
      setIsGeneratingGif(false);
    }
  }, [images, fps, drawToCanvas, loadHTMLImage]);

  const removeImage = useCallback(
    (index: number) => {
      if (index < 0 || index >= images.length) {
        return;
      }

      // Stop playback
      setIsPlaying(false);

      // Get the image to remove and clean up its URL
      const imageToRemove = images[index];
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      // Remove the item from the array
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);

      // Update currentIndex
      if (newImages.length === 0) {
        setCurrentIndex(0);
      } else if (currentIndex >= newImages.length) {
        setCurrentIndex(newImages.length - 1);
      } else if (index < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    [images, currentIndex]
  );

  const clearAll = useCallback(() => {
    // Clean up all URLs
    images.forEach(i => {
      try {
        URL.revokeObjectURL(i.url);
      } catch {
        // Ignore errors for already revoked URLs
      }
    });
    
    // Reset all state
    setImages([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setIsGeneratingGif(false);
    setGifProgress(0);
    
    toast.success("Cleared all images");
  }, [images]);

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 p-3 sm:p-4 overflow-x-hidden">
      <div className="mx-auto max-w-7xl overflow-x-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="my-6 sm:my-8"
        >
          <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
            Flip Book Studio
          </h1>
          <p className="text-center text-sky-200/80 mt-2 mb-6">
            Upload frames, preview at any FPS, export as GIF
          </p>
        </motion.div>

        <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
          {/* Preview card */}
          <Card className="bg-slate-900/80 border-sky-400/20 shadow-[0_0_40px_rgba(14,165,233,0.08)]">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full rounded-lg border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 aspect-[3/4] sm:aspect-video min-h-[360px] sm:min-h-[420px] relative overflow-hidden">
                {images.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white/80">
                      <ImageIcon className="w-14 h-14 mx-auto mb-3 opacity-70" />
                      <p className="mb-2">No images uploaded</p>
                      <p className="text-xs text-white/50">Use the picker below to add images</p>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 p-2">
                    <div className="w-full h-full flex items-center justify-center">
                      {images[currentIndex] ? (
                        <img
                          src={images[currentIndex].url}
                          alt={`Frame ${currentIndex + 1}`}
                          className={
                            fit === "stretch" ? "w-full h-full object-fill" :
                              fit === "cover" ? "w-full h-full object-cover" :
                                "max-w-full max-h-full object-contain"
                          }
                        />
                      ) : (
                        <div className="text-center text-white/80">
                          <ImageIcon className="w-14 h-14 mx-auto mb-3 opacity-70" />
                          <p className="mb-2">Invalid frame</p>
                          <p className="text-xs text-white/50">Please refresh or re-upload images</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Status bar */}
              {images.length > 0 && (
                <div className="mt-3 mb-3 flex flex-wrap items-center justify-between gap-3">
                  <Badge className="bg-sky-500/20 text-sky-200 border-0">
                    Frame {currentIndex + 1} of {images.length}
                  </Badge>

                  <div className="flex items-center gap-2">
                    <div className="text-white/70 text-xs">Fit</div>
                    <div className="inline-flex overflow-hidden rounded-lg border border-white/15">
                      {(["contain", "cover", "stretch"] as FitMode[]).map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFit(opt)}
                          className={`px-3 py-1.5 text-xs ${fit === opt
                            ? "bg-sky-500 text-slate-900"
                            : "bg-white/5 text-white/80 hover:bg-white/10"
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400`}
                          aria-pressed={fit === opt}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevious}
                      disabled={images.length <= 1}
                      className="bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-sky-400"
                      aria-label="Previous frame"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNext}
                      disabled={images.length <= 1}
                      className="bg-white/10 text-white hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-sky-400"
                      aria-label="Next frame"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Thumbnails - horizontal scroll on mobile with snap */}
              {images.length > 0 && (
                <div className="mb-2 overflow-x-hidden">
                  <div className="flex gap-2 overflow-x-auto pb-2 px-1 snap-x snap-mandatory">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setIsPlaying(false);
                        }}
                        className={`relative shrink-0 w-20 h-20 rounded-md overflow-hidden snap-start ${index === currentIndex
                          ? "ring-2 ring-sky-400"
                          : "ring-1 ring-white/15 hover:ring-white/30"
                          }`}
                        title={image.name}
                      >
                        <img src={image.url} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white/90">
                          {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Controls card */}
          <div className="space-y-4">
            {/* Upload */}
            <Card className="bg-slate-900/80 border-sky-400/20">
              <CardHeader>
                <CardTitle className="text-white">Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-sky-500 text-slate-900 hover:bg-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Images
                </Button>

                {images.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">{images.length} image(s) uploaded</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearAll}
                        className="bg-rose-500 hover:bg-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-2">
                      {images.map((image, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 rounded p-2">
                          <span className="text-white text-sm truncate flex-1 mr-2 overflow-hidden">{image.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="text-rose-400 hover:text-rose-300"
                            aria-label={`Remove ${image.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Playback */}
            <Card className="bg-slate-900/80 border-sky-400/20">
              <CardHeader>
                <CardTitle className="text-white">Playback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-3">
                  <Button
                    onClick={togglePlay}
                    disabled={images.length < 2}
                    className="flex-1 bg-sky-500 text-slate-900 hover:bg-sky-400 focus-visible:ring-2 focus-visible:ring-sky-300 active:scale-[0.98]"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                </div>

                <div className="space-y-3">
                  <label className="text-white font-medium">Speed: {fps[0]} FPS</label>
                  <Slider value={fps} onValueChange={setFps} min={1} max={30} step={1} className="w-full mt-4" />
                  <div className="flex justify-between text-sm text-white/70">
                    <span>Slow</span>
                    <span>Fast</span>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <Button
                  onClick={generateGif}
                  disabled={images.length < 2 || isGeneratingGif}
                  className="w-full bg-emerald-500 text-slate-900 hover:bg-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-300"
                >
                  {isGeneratingGif ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2" />
                      Creating GIF {gifProgress}%
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export GIF
                    </>
                  )}
                </Button>
                <p className="text-xs text-white/60">
                  Tip: use images with the same resolution for the cleanest result
                </p>
              </CardContent>
            </Card>

            {/* Help */}
            <Card className="bg-slate-900/80 border-sky-400/20">
              <CardHeader>
                <CardTitle className="text-white">Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-white/80 text-sm space-y-2">
                  <li>• Use photos with same resolution for the cleanest result</li>
                  <li>• 4-8 FPS works best for natural motion, 2-4 FPS for dramatic effect</li>
                  <li>• &ldquo;Cover&rdquo; fit mode fills frame, &ldquo;Contain&rdquo; shows entire image</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* hidden canvas used for encoding */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
