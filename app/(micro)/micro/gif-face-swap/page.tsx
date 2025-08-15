"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import { Upload, Search, Sparkles, Download, Copy, ArrowRight, Loader2, CheckCircle2, Image as ImageIcon, Wand2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

// Types from GIPHY docs (simplified)
interface GiphyGif {
  id: string;
  title: string;
  url: string;
  images: {
    original?: { url: string; width: string; height: string };
    downsized?: { url: string; width?: string; height?: string };
    fixed_height?: { url: string; width: string; height: string };
  };
  analytics?: {
    onload?: { url: string };
    onclick?: { url: string };
    onsent?: { url: string };
  };
}

const GIPHY_RATING = "g";

export default function GifFaceSwapPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [loadingGifs, setLoadingGifs] = useState(false);
  const [randomId, setRandomId] = useState<string | null>(null);

  const [selectedGif, setSelectedGif] = useState<GiphyGif | null>(null);
  const [faceFile, setFaceFile] = useState<File | null>(null);
  const [facePreview, setFacePreview] = useState<string | null>(null);
  const [swapping, setSwapping] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch or generate random_id for GIPHY analytics
  useEffect(() => {
    const key = "giphy_random_id";
    const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (cached) {
      setRandomId(cached);
      return;
    }
    fetch(`/api/gif-face-swap/randomid`)
      .then((r) => r.json())
      .then((json) => {
        const id = json?.data?.random_id;
        if (id) {
          localStorage.setItem(key, id);
          setRandomId(id);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch trending or search
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      try {
        setLoadingGifs(true);
        const rid = randomId ? `&random_id=${encodeURIComponent(randomId)}` : "";
        const base = debouncedSearch?.trim().length
          ? `/api/gif-face-swap/search?q=${encodeURIComponent(debouncedSearch.trim())}&limit=24&rating=${GIPHY_RATING}${rid}`
          : `/api/gif-face-swap/trending?limit=24&rating=${GIPHY_RATING}${rid}`;
        const res = await fetch(base, { signal: controller.signal });
        const json = await res.json();
        setGifs(json?.data || []);
      } catch (e) {
        if (!(e instanceof DOMException && e.name === "AbortError")) {
          console.error(e);
        }
      } finally {
        setLoadingGifs(false);
      }
    };
    run();
    return () => controller.abort();
  }, [debouncedSearch, randomId]);

  // Pingback helper
  const sendPingback = (url?: string) => {
    try {
      if (!url) return;
      const u = new URL(url);
      if (randomId) u.searchParams.set("random_id", randomId);
      u.searchParams.set("ts", Date.now().toString());
      fetch(u.toString(), { method: "GET" }).catch(() => {});
    } catch {}
  };

  const handleSelectGif = (gif: GiphyGif) => {
    setSelectedGif(gif);
    // onclick pingback
    sendPingback(gif?.analytics?.onclick?.url);
  };

  const handleFaceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Max file size is 8MB");
      return;
    }
    setFaceFile(f);
    const reader = new FileReader();
    reader.onload = () => setFacePreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const gifImageUrl = useMemo(() => {
    if (!selectedGif) return null;
    return (
      selectedGif.images?.downsized?.url ||
      selectedGif.images?.fixed_height?.url ||
      selectedGif.images?.original?.url ||
      null
    );
  }, [selectedGif]);

  const doSwap = async () => {
    if (!gifImageUrl) {
      toast.error("Please select a GIF");
      return;
    }
    if (!faceFile && !facePreview) {
      toast.error("Please upload a face image");
      return;
    }

    try {
      setSwapping(true);
      setResultUrl(null);

      // Prefer using the base64 data URL (preview) as input if available
      let faceImagePayload: string | undefined = undefined;
      if (facePreview) {
        faceImagePayload = facePreview; // data URL
      }

      const res = await fetch("/api/gif-face-swap/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ face_image: faceImagePayload, gif_image: gifImageUrl }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Swap failed");
      }

      const data = await res.json();
      const url = data?.image?.url;
      if (!url) throw new Error("No image URL returned");

      setResultUrl(url);
      toast.success("Face swapped!");

      // onsent pingback when user receives a result (closest to 'send')
      if (selectedGif?.analytics?.onsent?.url) sendPingback(selectedGif.analytics.onsent.url);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to swap");
    } finally {
      setSwapping(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 opacity-50" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-blue-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="container relative mx-auto px-4 py-6 max-w-7xl">
        {/* Header with animation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-300">
              AI Powered
            </Badge>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            GIF Face Swapper
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform any GIF with your face in seconds using cutting-edge AI magic ✨
          </p>
        </motion.div>

        {/* Progress indicators */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              facePreview ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {facePreview ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Upload Face</span>
          </motion.div>
          
          <ArrowRight className="w-4 h-4 text-gray-400" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              selectedGif ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {selectedGif ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Choose GIF</span>
          </motion.div>
          
          <ArrowRight className="w-4 h-4 text-gray-400" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              resultUrl ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
            }`}>
              {resultUrl ? <CheckCircle2 className="w-5 h-5" /> : '3'}
            </div>
            <span className="text-sm font-medium hidden sm:inline">Get Result</span>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Step 1: Upload Face (Left) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-purple-200/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300 pt-0">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-t-lg py-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <Upload className="w-4 h-4" />
                  </div>
                  Step 1: Upload Your Face
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div 
                    className="relative border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleFaceChange}
                      className="hidden"
                    />
                    
                    {!facePreview ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 group-hover:scale-110 transition-transform">
                          <ImageIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload</p>
                          <p className="text-xs text-gray-500 mt-1">or drag and drop</p>
                          <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 8MB</p>
                        </div>
                      </motion.div>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="relative"
                        >
                          <img 
                            src={facePreview} 
                            className="max-h-48 max-w-full object-contain mx-auto rounded-lg shadow-lg" 
                            alt="Your face" 
                          />
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-green-500 text-white"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                  
                  {facePreview && (
                    <Button 
                      variant="outline" 
                      className="w-full border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                      onClick={() => {
                        setFaceFile(null);
                        setFacePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Change Image
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: GIPHY search and selection (Middle) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-blue-200/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300 pt-0">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-t-lg py-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <Search className="w-4 h-4" />
                  </div>
                  Step 2: Choose a GIF
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search GIPHY..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 border-blue-200 focus:border-blue-400 transition-colors"
                    />
                    {search && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2"
                        onClick={() => setSearch("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  {!search && (
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">🔥 Trending</Badge>
                    </div>
                  )}

                  <ScrollArea className="h-[380px] pr-4">
                    <div className="grid grid-cols-2 gap-3">
                      {loadingGifs && (
                        <div className="col-span-2 flex flex-col items-center justify-center py-8">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                          <p className="text-sm text-gray-500">Loading GIFs...</p>
                        </div>
                      )}
                      {!loadingGifs && gifs?.map((gif) => {
                        const url =
                          gif.images?.downsized?.url ||
                          gif.images?.fixed_height?.url ||
                          gif.images?.original?.url;
                        return (
                          <motion.button
                            key={gif.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`relative rounded-xl overflow-hidden aspect-square group transition-all ${
                              selectedGif?.id === gif.id 
                                ? "ring-4 ring-blue-500 ring-offset-2 shadow-lg" 
                                : "hover:shadow-xl border-2 border-transparent hover:border-blue-300"
                            }`}
                            onClick={() => handleSelectGif(gif)}
                          >
                            {gif.analytics?.onload?.url && (
                              <img
                                src={url}
                                alt={gif.title}
                                className="object-cover w-full h-full"
                                onLoad={() => sendPingback(gif.analytics?.onload?.url)}
                              />
                            )}
                            {!gif.analytics?.onload?.url && (
                              <img src={url} alt={gif.title} className="object-cover w-full h-full" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {selectedGif?.id === gif.id && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2 p-1 rounded-full bg-blue-500 text-white"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 3: Result (Right) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="backdrop-blur-lg bg-white/90 dark:bg-gray-900/90 border-green-200/50 shadow-2xl hover:shadow-3xl transition-shadow duration-300 pt-0">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-t-lg py-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                    <Wand2 className="w-4 h-4" />
                  </div>
                  Step 3: Magic Result
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {!resultUrl ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8">
                      <div className="text-center space-y-4">
                        {!facePreview || !selectedGif ? (
                          <>
                            <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 w-16 h-16 mx-auto flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 mb-2">
                                {!facePreview && !selectedGif && "Complete steps 1 & 2"}
                                {!facePreview && selectedGif && "Upload your face first"}
                                {facePreview && !selectedGif && "Choose a GIF first"}
                              </p>
                              <p className="text-xs text-gray-400">Your result will appear here</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                              className="p-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 mx-auto flex items-center justify-center"
                            >
                              <Sparkles className="w-8 h-8 text-white" />
                            </motion.div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Ready to swap!</p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="space-y-4"
                      >
                        <div className="relative rounded-xl overflow-hidden shadow-2xl">
                          <img src={resultUrl} className="w-full h-auto" alt="Swapped result" />
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 p-2 rounded-full bg-green-500 text-white shadow-lg"
                          >
                            <CheckCircle2 className="w-6 h-6" />
                          </motion.div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            className="border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = resultUrl;
                              link.download = 'face-swapped.gif';
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            className="border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                            onClick={() => {
                              if (selectedGif?.analytics?.onsent?.url) sendPingback(selectedGif.analytics.onsent.url);
                              navigator.clipboard
                                .writeText(resultUrl)
                                .then(() => toast.success("Link copied! 🎉"))
                                .catch(() => {});
                            }}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transition-all"
                      size="lg"
                      onClick={doSwap} 
                      disabled={swapping || !gifImageUrl || !facePreview}
                    >
                      {swapping ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating Magic...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Swap Face Now
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  {resultUrl && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setResultUrl(null);
                        setSelectedGif(null);
                        setFaceFile(null);
                        setFacePreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Start Over
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
