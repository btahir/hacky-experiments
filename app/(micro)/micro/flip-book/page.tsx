import FlipBookClient from "./flip-book-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flip Book Generator | Hacky Experiments",
  description:
    "Create animated flip books from your images. Upload multiple photos, adjust playback speed, and generate GIF animations.",
  openGraph: {
    images: [{ url: "/micro-experiments/flip-book.svg" }],
  },
};

export default function FlipBookPage() {
  return <FlipBookClient />;
}
