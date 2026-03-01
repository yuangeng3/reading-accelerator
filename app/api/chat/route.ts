import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { searchBooks } from "@/lib/open-library";
import { enrichBook } from "@/lib/lindy-score";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a reading advisor embedded in a book discovery app. You help people find exactly the right books through conversation.

Your job is to UNDERSTAND what someone really needs, then search for books that match.

HOW YOU WORK:
1. When someone describes what they want, figure out if you have enough info to search. If not, ask ONE focused follow-up question.
2. When you have enough context, respond with a JSON block containing search queries, then explain what you're looking for.
3. You can also just talk — share book knowledge, explain why a book matters, etc.

CRITICAL UNDERSTANDING RULES:
- Separate WHO the reader is from WHAT they want to read
  - "my son has ADHD" → reader needs engaging, fast-paced, visual books (NOT books about ADHD)
  - "I'm going through a divorce" → reader needs books on resilience/new beginnings (NOT divorce self-help unless asked)
- When someone mentions a specific book/series, find: same author, same style, same format, same themes
- Age/grade = reading level filter, not topic
- "Like X" means find the DNA of X (format, humor style, pacing, visual style) and match it

WHEN TO ASK FOLLOW-UPS (ask ONE at a time):
- "What did they love about [book] — the humor? illustrations? characters?"
- "Are they a strong reader for their age, or do they prefer pictures/graphic novels?"
- "What's the vibe — silly and fun, or something with more depth?"

RESPONSE FORMAT:
When you're ready to search, include this JSON block anywhere in your response:
<<<SEARCH>>>
{"searches":[{"query":"keywords","subject":"optional","author":"optional"}]}
<<<END_SEARCH>>>

The app will automatically run these searches and show results below your message.
Keep your conversational text SHORT (2-4 sentences max). The books do the talking.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: ChatMessage[] };

    if (!messages?.length) {
      return new Response(
        JSON.stringify({ error: "Messages required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    });

    const encoder = new TextEncoder();
    let fullText = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullText += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // After streaming, check if the response contains search queries
          const searchMatch = fullText.match(
            /<<<SEARCH>>>\s*([\s\S]*?)\s*<<<END_SEARCH>>>/
          );
          if (searchMatch) {
            try {
              let jsonStr = searchMatch[1].trim();
              jsonStr = jsonStr.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
              const parsed = JSON.parse(jsonStr);
              const searches = parsed.searches || [];

              // Run searches in parallel
              const searchPromises = searches.map((s: { query: string; subject?: string; author?: string }) =>
                searchBooks({
                  query: s.query,
                  subject: s.subject,
                  author: s.author,
                  limit: 8,
                }).catch(() => ({ numFound: 0, start: 0, docs: [] }))
              );

              const results = await Promise.all(searchPromises);
              const seen = new Set<string>();
              const allBooks = [];

              for (const result of results) {
                for (const doc of result.docs) {
                  if (!seen.has(doc.key)) {
                    seen.add(doc.key);
                    allBooks.push(enrichBook(doc));
                  }
                }
              }

              allBooks.sort((a, b) => b.lindy_score - a.lindy_score);

              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ books: allBooks.slice(0, 12) })}\n\n`
                )
              );
            } catch (e) {
              console.error("Search parse error:", e);
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Chat stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
