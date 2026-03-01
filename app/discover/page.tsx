"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { DISCOVER_QUESTIONS } from "@/lib/questions";
import { useReadingPaths } from "@/lib/store";
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react";

export default function DiscoverPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [done, setDone] = useState(false);
  const { addPath } = useReadingPaths();

  const currentQ = DISCOVER_QUESTIONS[step];
  const isLastQuestion = step === DISCOVER_QUESTIONS.length - 1;
  const isQuestionnaire = step < DISCOVER_QUESTIONS.length;

  const handleNext = () => {
    if (isLastQuestion) {
      generatePath();
    } else {
      setStep(step + 1);
    }
  };

  const canProceed = () => {
    if (!currentQ) return false;
    // Last question (avoid) is optional
    if (currentQ.id === "avoid") return true;
    return (answers[currentQ.id] ?? "").trim().length > 0;
  };

  const generatePath = async () => {
    setStep(DISCOVER_QUESTIONS.length); // Move past questionnaire
    setStreaming(true);
    setStreamText("");
    setDone(false);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;

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
            } catch {
              // skip malformed
            }
          }
        }
      }

      // Save to store
      addPath({
        goal: answers.goal ?? "",
        content: fullText,
      });
      setDone(true);
    } catch (err) {
      console.error(err);
      setStreamText("Something went wrong generating your reading path. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  const startOver = () => {
    setStep(0);
    setAnswers({});
    setStreamText("");
    setDone(false);
  };

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {isQuestionnaire ? (
          /* Questionnaire */
          <div className="space-y-8">
            {/* Progress */}
            <div className="flex gap-1.5">
              {DISCOVER_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i <= step
                      ? "bg-[var(--color-accent)]"
                      : "bg-[var(--color-border)]"
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {currentQ.question}
              </h1>
              {currentQ.helpText && (
                <p className="text-sm text-[var(--color-text-muted)]">
                  {currentQ.helpText}
                </p>
              )}
            </div>

            {/* Input */}
            <textarea
              value={answers[currentQ.id] ?? ""}
              onChange={(e) =>
                setAnswers({ ...answers, [currentQ.id]: e.target.value })
              }
              placeholder={currentQ.placeholder}
              rows={4}
              className="w-full px-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.metaKey && canProceed()) {
                  handleNext();
                }
              }}
            />

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLastQuestion ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Reading Path
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[var(--color-text-muted)] text-center">
              {currentQ.id === "avoid" ? "This one's optional." : "Press Cmd+Enter to continue"}
            </p>
          </div>
        ) : (
          /* Results — Streaming AI Response */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">Your Reading Path</h1>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Goal: {answers.goal}
                </p>
              </div>
              {done && (
                <button
                  onClick={startOver}
                  className="text-sm text-[var(--color-accent)] hover:underline"
                >
                  Generate another
                </button>
              )}
            </div>

            <div className="p-6 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
              {streaming && !streamText && (
                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Finding your books...</span>
                </div>
              )}
              {streamText && (
                <div className="prose prose-sm max-w-none text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">
                  {streamText}
                  {streaming && (
                    <span className="inline-block w-1.5 h-4 bg-[var(--color-accent)] animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </div>
              )}
            </div>

            {done && (
              <p className="text-xs text-[var(--color-text-muted)] text-center">
                Saved to your reading paths. Search any title above to find free or indie copies.
              </p>
            )}
          </div>
        )}
      </main>
    </>
  );
}
