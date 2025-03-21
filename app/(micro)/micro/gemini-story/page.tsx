import GeminiFlashApp from "./gemini-flash-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gemini Flash Experiments | Hacky Experiments",
  description:
    "Explore the multi-modal capabilities of Google's Gemini AI with interactive demos.",
  openGraph: {
    images: [{ url: "/micro-experiments/gemini-story.png" }],
  },
};

export default function GeminiFlashPage() {
  return <GeminiFlashApp />;
}
