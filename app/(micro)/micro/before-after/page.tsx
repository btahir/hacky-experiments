import BeforeAfterClient from "./before-after-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Before After Comparison | Hacky Experiments",
  description:
    "A tool to quickly get a before and after comparison of an image.",
  openGraph: {
    images: [{ url: "/micro-experiments/before-after.png" }],
  },
};

export default function BeforeAfterPage() {
  return <BeforeAfterClient />;
}
