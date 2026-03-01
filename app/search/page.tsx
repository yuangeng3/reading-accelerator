"use client";

import { useState, useRef, useEffect, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import BookCard from "@/components/BookCard";
import { BookWithScore } from "@/lib/types";
import { Send, Loader2 } from "lucide-react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  books?: BookWithScore[];
}

function cleanAssistantText(text: string): string {
  // Remove the search JSON block from displayed text
  return text.replace(/<<<SEARCH>>>[\s\S]*?<<<END_SEARCH>>>/g, "").trim();
}

function ChatContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const initialQuery = searchParams.get("q") ?? "";

  // Auto-send initial query from homepage
  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      sendMessage(initialQuery);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  const sendMessage = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setStreaming(true);
    setStreamText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("Chat failed");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullText = "";
      let books: BookWithScore[] | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setStreamText(fullText);
              }
              if (parsed.books) {
                books = parsed.books;
              }
            } catch {
              // skip
            }
          }
        }
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: fullText,
        books,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setStreamText("");
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Try again?",
        },
      ]);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !streaming) {
      sendMessage(input.trim());
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 && !streaming && (
            <div className="text-center py-16 space-y-4">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Tell me what you&apos;re looking for.
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] max-w-md mx-auto">
                Describe the reader, what they love, what they need — I&apos;ll find the right books. I&apos;ll ask follow-ups if I need more context.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  "My 7-year-old loves Bad Guys and Dog Man",
                  "I want to understand how the world really works",
                  "Books to read with my kids before bed",
                  "I'm burnt out and need perspective",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="px-3 py-1.5 text-xs border border-[var(--color-border)] rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-accent)] transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <div className="flex justify-end">
                  <div className="max-w-[80%] px-4 py-2.5 bg-[var(--color-accent)] text-white text-sm rounded-2xl rounded-br-sm">
                    {msg.content}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {cleanAssistantText(msg.content) && (
                    <div className="max-w-[80%] px-4 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] text-sm rounded-2xl rounded-bl-sm whitespace-pre-wrap">
                      {cleanAssistantText(msg.content)}
                    </div>
                  )}
                  {msg.books && msg.books.length > 0 && (
                    <div className="space-y-3">
                      {msg.books.map((book) => (
                        <BookCard key={book.key} book={book} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Streaming */}
          {streaming && (
            <div className="space-y-4">
              {streamText ? (
                <div className="max-w-[80%] px-4 py-2.5 bg-[var(--color-card)] border border-[var(--color-border)] text-sm rounded-2xl rounded-bl-sm whitespace-pre-wrap">
                  {cleanAssistantText(streamText)}
                  <span className="inline-block w-1.5 h-4 bg-[var(--color-accent)] animate-pulse ml-0.5 align-text-bottom" />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 text-[var(--color-text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-card)]">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto px-4 py-3"
        >
          <div className="relative flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Describe who's reading and what they need..."
              rows={1}
              className="flex-1 px-4 py-3 border border-[var(--color-border)] rounded-xl bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] max-h-32"
              style={{ minHeight: "44px" }}
              autoFocus
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="shrink-0 p-3 bg-[var(--color-accent)] text-white rounded-xl hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
          </div>
        }
      >
        <ChatContent />
      </Suspense>
    </>
  );
}
