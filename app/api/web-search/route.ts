import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ error: "Enter a phone model or search query." }, { status: 400 });

  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return NextResponse.json({ error: "Web search is not configured yet.", setup: "Add BRAVE_SEARCH_API_KEY to Vercel Environment Variables." }, { status: 503 });

  try {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", q);
    url.searchParams.set("count", "10");
    url.searchParams.set("safesearch", "moderate");

    const response = await fetch(url, {
      headers: { Accept: "application/json", "X-Subscription-Token": key },
      cache: "no-store",
    });

    if (!response.ok) return NextResponse.json({ error: "The web search provider returned an error.", status: response.status }, { status: 502 });

    const data = await response.json();
    const results = (data.web?.results ?? []).map((item: any) => ({
      title: item.title,
      url: item.url,
      description: item.description,
      source: item.profile?.long_name || item.meta_url?.hostname || "Web",
    }));

    return NextResponse.json({ query: q, results });
  } catch {
    return NextResponse.json({ error: "Could not reach the web search provider." }, { status: 502 });
  }
}
