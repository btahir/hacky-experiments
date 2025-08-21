import VoiceMorphClient from "./voice-morph-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "VoiceMorph Studio | Hacky Experiments",
  description:
    "Transform videos by changing speech using AI-powered speech-to-speech conversion. Upload a video and audio file to create the perfect voice match.",
  openGraph: {
    images: [{ url: "/micro-experiments/voice-morph.svg" }],
  },
};

export default function VoiceMorphPage() {
  return <VoiceMorphClient />;
}
