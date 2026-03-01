"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { Search, BookOpen, Library, Sparkles } from "lucide-react";
import Header from "@/components/Header";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--color-text)]">
              Find books that last.
            </h1>
            <p className="text-base text-[var(--color-text-muted)] max-w-md mx-auto">
              Discover timeless books ranked by staying power, not trends.
              Read free on archive.org or support your local indie bookstore.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search books, authors, topics..."
                className="w-full pl-12 pr-28 py-4 border border-[var(--color-border)] rounded-xl bg-[var(--color-card)] text-base focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)] shadow-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={!query.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 bg-[var(--color-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span className="text-xs font-medium text-[var(--color-text)]">
                Lindy Score
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] text-center">
                Ranked by timelessness, not bestseller lists
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
              <span className="text-xs font-medium text-[var(--color-text)]">
                Read Free
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] text-center">
                Public domain books linked to archive.org
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg">
              <Library className="w-6 h-6 text-blue-600" />
              <span className="text-xs font-medium text-[var(--color-text)]">
                Support Indie
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)] text-center">
                Buy from independent bookstores via Bookshop.org
              </span>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-[var(--color-text-muted)]">
              Try:{" "}
              {["stoicism", "meditations", "compound interest", "parenting"].map(
                (term, i) => (
                  <span key={term}>
                    {i > 0 && " · "}
                    <button
                      onClick={() => {
                        setQuery(term);
                        router.push(`/search?q=${encodeURIComponent(term)}`);
                      }}
                      className="text-[var(--color-accent)] hover:underline"
                    >
                      {term}
                    </button>
                  </span>
                )
              )}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
