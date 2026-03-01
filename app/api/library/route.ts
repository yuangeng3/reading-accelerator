import { NextRequest, NextResponse } from "next/server";

const NYPL_API_URL = process.env.NYPL_API_URL || "http://104.225.208.28:5050";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");
  const isbn = request.nextUrl.searchParams.get("isbn");

  if (!title && !isbn) {
    return NextResponse.json(
      { error: "title or isbn parameter required" },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams();
    if (title) params.set("title", title);
    if (isbn) params.set("isbn", isbn);

    const resp = await fetch(`${NYPL_API_URL}/api/check?${params}`, {
      signal: AbortSignal.timeout(30000),
    });

    if (!resp.ok) {
      throw new Error(`NYPL API error: ${resp.status}`);
    }

    const data = await resp.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Library check error:", error);
    return NextResponse.json(
      { error: "Failed to check library availability. Service may be offline." },
      { status: 503 }
    );
  }
}
