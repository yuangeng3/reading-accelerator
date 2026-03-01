"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import SearchBar from "@/components/SearchBar";
import BookCard from "@/components/BookCard";
import { BookWithScore } from "@/lib/types";
import { Loader2 } from "lucide-react";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [books, setBooks] = useState<BookWithScore[]>([]);
  const [numFound, setNumFound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const initialQuery = searchParams.get("q") ?? "";

  const doSearch = useCallback(
    async (query: string, filters: Record<string, string> = {}) => {
      setLoading(true);
      setSearched(true);

      const params = new URLSearchParams({ q: query, ...filters });
      router.replace(`/search?${params.toString()}`, { scroll: false });

      try {
        const resp = await fetch(`/api/search?${params.toString()}`);
        if (!resp.ok) throw new Error("Search failed");
        const data = await resp.json();
        setBooks(data.books);
        setNumFound(data.numFound);
      } catch (err) {
        console.error(err);
        setBooks([]);
        setNumFound(0);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (initialQuery) {
      const filters: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (key !== "q") filters[key] = value;
      });
      doSearch(initialQuery, filters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <SearchBar
        onSearch={doSearch}
        loading={loading}
        initialQuery={initialQuery}
      />

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" />
        </div>
      )}

      {!loading && searched && (
        <>
          <div className="text-sm text-[var(--color-text-muted)]">
            {numFound.toLocaleString()} results · sorted by Lindy Score
          </div>
          <div className="space-y-3">
            {books.map((book) => (
              <BookCard key={book.key} book={book} />
            ))}
          </div>
          {books.length === 0 && (
            <div className="text-center py-12 text-[var(--color-text-muted)]">
              No books found. Try a different search.
            </div>
          )}
        </>
      )}
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
        <SearchContent />
      </Suspense>
    </>
  );
}
