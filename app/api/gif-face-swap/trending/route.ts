import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GIPHY_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ?? "24";
    const rating = searchParams.get("rating") ?? "g";
    const random_id = searchParams.get("random_id");

    const url = `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=${encodeURIComponent(
      limit
    )}&rating=${encodeURIComponent(rating)}${random_id ? `&random_id=${encodeURIComponent(random_id)}` : ""}`;

    const res = await fetch(url, { next: { revalidate: 0 } });
    const json = await res.json();
    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/gif-face-swap/trending error", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
