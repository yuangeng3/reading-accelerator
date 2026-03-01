import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `You are a reading advisor who believes in the Lindy Effect: books that have survived centuries are more likely to remain relevant than recent bestsellers. You help people find books that will genuinely change their trajectory.

Your job is to create a personalized reading path — an ordered sequence of 5-8 books that builds on itself, taking the reader from where they are to where they want to be.

RULES:
1. NEVER summarize book content, extract "key learnings", or give chapter-by-chapter breakdowns. That's for the reader to discover.
2. DO explain WHY each book matters for THIS specific person's goals, life context, and intellectual lineage.
3. Prefer old books over new ones. A book published in 100 AD that's still in print beats a 2024 bestseller.
4. Prefer public domain books when possible — mention if a book is freely available.
5. Order matters: sequence books so each one builds on or challenges the previous.
6. Be honest about difficulty. Some books are hard. Say so.
7. Include at least one book the person has probably never heard of.
8. Keep each book's explanation to 2-3 sentences focused on "why this book, for YOU, right now."

FORMAT your response as a numbered reading path. For each book:
- Title and author (with approximate year of first publication)
- Why this book matters for THIS person (2-3 sentences, personal and specific)
- If it's public domain / freely available, note that

Start with a 1-2 sentence framing of the overall path — what transformation this sequence enables. Then list the books.

Do NOT use headers or markdown formatting beyond the numbered list. Keep it conversational and direct.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== "object") {
      return new Response(
        JSON.stringify({ error: "Answers are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const userMessage = buildUserMessage(answers);

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
                )
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Recommend stream error:", error);
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
    console.error("Recommend error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate recommendations" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

function buildUserMessage(answers: Record<string, string>): string {
  const parts: string[] = [];

  if (answers.goal) {
    parts.push(`What I want to become: ${answers.goal}`);
  }
  if (answers.context) {
    parts.push(`Where I am in life: ${answers.context}`);
  }
  if (answers.spark) {
    parts.push(`Books/ideas that changed me: ${answers.spark}`);
  }
  if (answers.avoid) {
    parts.push(`What I don't want: ${answers.avoid}`);
  }

  return parts.join("\n\n");
}
