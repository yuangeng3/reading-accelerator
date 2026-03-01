import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { searchBooks } from "@/lib/open-library";
import { enrichBook } from "@/lib/lindy-score";

const anthropic = new Anthropic();

/**
 * Detect if a query is natural language (conversational) vs keywords.
 * Natural language: "my son has adhd, loves bad guys" or "books about becoming calmer?"
 * Keywords: "stoicism", "marcus aurelius meditations", "ADHD children books"
 */
function isNaturalLanguage(query: string): boolean {
  // If it has question marks, pronouns, or is longer than ~6 words with common sentence patterns
  if (/[?]/.test(query)) return true;
  if (/\b(my|i|me|we|our|he|she|they|his|her|is|are|was|has|have|want|like|love|need|looking for|recommend)\b/i.test(query)) return true;
  const wordCount = query.trim().split(/\s+/).length;
  if (wordCount > 6) return true;
  return false;
}

/**
 * Use Claude to convert a natural language query into structured search terms.
 */
async function extractSearchTerms(query: string): Promise<{
  searches: Array<{ query: string; subject?: string; author?: string }>;
  explanation: string;
}> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    system: `You convert natural language book requests into Open Library search queries.
Return JSON only, no markdown. Format:
{"searches":[{"query":"keyword search","subject":"optional subject filter","author":"optional author"}],"explanation":"one sentence explaining what you're searching for"}

Rules:
- Generate 1-3 searches to cover the request from different angles
- Use simple keywords, not full sentences
- For age-appropriate requests, include the age group in the subject
- For genre preferences ("bad guys", "adventure"), map to proper subjects
- Keep each query under 5 words`,
    messages: [{ role: "user", content: query }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    return JSON.parse(text);
  } catch {
    // Fallback: just use the original query cleaned up
    return {
      searches: [{ query: query.replace(/[?.,!]/g, "").trim() }],
      explanation: "Searching directly",
    };
  }
}

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
    const limit = params.get("limit") ? Number(params.get("limit")) : 20;
    const offset = params.get("offset") ? Number(params.get("offset")) : 0;
    let explanation: string | undefined;

    // Check if this is a natural language query that needs AI interpretation
    if (isNaturalLanguage(query) && !params.get("title") && !params.get("author") && !params.get("subject")) {
      const extracted = await extractSearchTerms(query);
      explanation = extracted.explanation;

      // Run all searches in parallel, deduplicate by work key
      const searchPromises = extracted.searches.map((s) =>
        searchBooks({
          query: s.query,
          subject: s.subject,
          author: s.author,
          limit: Math.ceil(limit / extracted.searches.length) + 5,
          offset,
        })
      );

      const results = await Promise.all(searchPromises);
      const seen = new Set<string>();
      const allDocs = [];

      for (const result of results) {
        for (const doc of result.docs) {
          if (!seen.has(doc.key)) {
            seen.add(doc.key);
            allDocs.push(doc);
          }
        }
      }

      const enriched = allDocs.map(enrichBook);
      enriched.sort((a, b) => b.lindy_score - a.lindy_score);

      return NextResponse.json({
        numFound: enriched.length,
        start: 0,
        books: enriched.slice(0, limit),
        explanation,
      });
    }

    // Standard keyword search
    const result = await searchBooks({
      query,
      title: params.get("title") ?? undefined,
      author: params.get("author") ?? undefined,
      subject: params.get("subject") ?? undefined,
      language: params.get("language") ?? undefined,
      sort: params.get("sort") ?? undefined,
      ebook_access: params.get("ebook_access") ?? undefined,
      has_fulltext: params.get("has_fulltext") === "true" || undefined,
      limit,
      offset,
    });

    const enriched = result.docs.map(enrichBook);
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
