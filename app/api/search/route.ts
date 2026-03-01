import { NextRequest, NextResponse } from "next/server";
import { searchBooks } from "@/lib/open-library";
import { enrichBook } from "@/lib/lindy-score";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter 'q' is required" },
      { status: 400 }
    );
  }

  try {
    const result = await searchBooks({
      query,
      title: params.get("title") ?? undefined,
      author: params.get("author") ?? undefined,
      subject: params.get("subject") ?? undefined,
      language: params.get("language") ?? undefined,
      sort: params.get("sort") ?? undefined,
      ebook_access: params.get("ebook_access") ?? undefined,
      has_fulltext: params.get("has_fulltext") === "true" || undefined,
      limit: params.get("limit") ? Number(params.get("limit")) : 20,
      offset: params.get("offset") ? Number(params.get("offset")) : 0,
    });

    const enriched = result.docs.map(enrichBook);
    // Sort by Lindy Score descending
    enriched.sort((a, b) => b.lindy_score - a.lindy_score);

    return NextResponse.json({
      numFound: result.numFound,
      start: result.start,
      books: enriched,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search books" },
      { status: 500 }
    );
  }
}
