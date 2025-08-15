"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">GIF Face Swapper</h1>
          <p className="text-muted-foreground">Search a GIF, upload your face, and swap with AI</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: GIPHY search and selection */}
          <Card>
            <CardHeader>
              <CardTitle>1. Pick a GIF</CardTitle>
            </CardHeader>
            <CardContent>
              <>
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder="Search GIPHY (or leave empty for trending)"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="outline" onClick={() => setSearch("")}>Clear</Button>
                </div>

                <div className="grid grid-cols-3 gap-3 max-h-[460px] overflow-auto">
                  {loadingGifs && <div className="col-span-3 text-center text-sm">Loading…</div>}
                  {gifs?.map((gif) => {
                    const url =
                      gif.images?.downsized?.url ||
                      gif.images?.fixed_height?.url ||
                      gif.images?.original?.url;
                    return (
                      <button
                        key={gif.id}
                        className={`relative border rounded overflow-hidden aspect-square group ${
                          selectedGif?.id === gif.id ? "ring-2 ring-purple-600" : ""
                        }`}
                        onClick={() => handleSelectGif(gif)}
                      >
                        {/* onload pingback once visible */}
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
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </>
            </CardContent>
          </Card>

          {/* Right: Face uploader and result */}
          <Card>
            <CardHeader>
              <CardTitle>2. Upload your face</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Face image</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFaceChange}
                  />
                </div>
                {facePreview && (
                  <div className="w-full border rounded p-2 bg-white">
                    <img src={facePreview} className="max-h-48 object-contain mx-auto" alt="preview" />
                  </div>
                )}

                <Button className="w-full" onClick={doSwap} disabled={swapping || !gifImageUrl || !facePreview}>
                  {swapping ? "Swapping…" : "Swap face"}
                </Button>

                {resultUrl && (
                  <div className="space-y-3">
                    <div className="w-full border rounded p-2 bg-white">
                      <img src={resultUrl} className="w-full h-auto" alt="result" />
                    </div>
                    <div className="flex gap-2">
                      <a href={resultUrl} download target="_blank" rel="noreferrer">
                        <Button variant="outline">Download</Button>
                      </a>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (selectedGif?.analytics?.onsent?.url) sendPingback(selectedGif.analytics.onsent.url);
                          navigator.clipboard
                            .writeText(resultUrl)
                            .then(() => toast.success("Result URL copied"))
                            .catch(() => {});
                        }}
                      >
                        Copy URL
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
