export const runtime = "nodejs";

export async function GET() {
  try {
    const apiKey = process.env.GIPHY_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing GIPHY_API_KEY" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = `https://api.giphy.com/v1/randomid?api_key=${apiKey}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    const json = await res.json();
    return new Response(JSON.stringify(json), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("/api/gif-face-swap/randomid error", err);
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
