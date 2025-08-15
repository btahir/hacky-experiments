import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const FAL_API_KEY = process.env.FAL_API_KEY;
    if (!FAL_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing FAL_API_KEY in environment" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const face_image: string | undefined = body?.face_image;
    const gif_image: string | undefined = body?.gif_image;

    if (!face_image || !gif_image) {
      return new Response(
        JSON.stringify({ error: "face_image and gif_image are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const falRes = await fetch("https://fal.run/easel-ai/easel-gifswap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${FAL_API_KEY}`,
      },
      body: JSON.stringify({ face_image, gif_image }),
    });

    if (!falRes.ok) {
      const text = await falRes.text().catch(() => "");
      return new Response(
        JSON.stringify({ error: `FAL error: ${falRes.status} ${text}` }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const falJson = await falRes.json();

    // Normalize output to { image: { url } }
    let imageUrl: string | undefined;
    // Common shapes
    if (falJson?.image?.url) imageUrl = falJson.image.url;
    if (!imageUrl && falJson?.output?.image?.url) imageUrl = falJson.output.image.url;
    if (!imageUrl && falJson?.data?.image?.url) imageUrl = falJson.data.image.url;

    // Sometimes responses may include an array of images
    if (!imageUrl) {
      const candidates = falJson?.images || falJson?.output?.images || falJson?.data?.images;
      if (Array.isArray(candidates) && candidates.length > 0) {
        imageUrl = candidates[0]?.url || candidates[0];
      }
    }

    if (!imageUrl) {
      // Fallback: try to locate any URL string in the response
      const maybe = JSON.stringify(falJson);
      const match = maybe.match(/https?:\/\/\S+\.(gif|png|jpg|jpeg|webp)/i);
      if (match) imageUrl = match[0];
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "No image URL found in FAL response", raw: falJson }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ image: { url: imageUrl }, raw: falJson }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("/api/gif-face-swap POST error", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
