"use client";

import { useState } from "react";
import { BookWithScore } from "@/lib/types";
import { useReadingList } from "@/lib/store";
import {
  BookOpen,
  ExternalLink,
  Plus,
  Check,
  Star,
  Clock,
  Store,
  Library,
  Loader2,
} from "lucide-react";

function LindyBadge({ score }: { score: number }) {
  const tier =
    score >= 4
      ? { label: "Timeless", color: "bg-amber-100 text-amber-800" }
      : score >= 3
        ? { label: "Classic", color: "bg-blue-100 text-blue-800" }
        : score >= 2
          ? { label: "Enduring", color: "bg-green-100 text-green-800" }
          : { label: "Recent", color: "bg-gray-100 text-gray-700" };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}
    >
      <Clock className="w-3 h-3" />
      {tier.label} · {score.toFixed(1)}
    </span>
  );
}

function buildBookshopUrl(title: string, authors: string): string {
  const query = `${title} ${authors}`.trim();
  return `https://bookshop.org/search?keywords=${encodeURIComponent(query)}`;
}

export default function BookCard({ book }: { book: BookWithScore }) {
  const { addBook, removeBook, isBookSaved } = useReadingList();
  const saved = isBookSaved(book.key);
  const [libraryResult, setLibraryResult] = useState<string | null>(null);
  const [libraryLoading, setLibraryLoading] = useState(false);

  const checkLibrary = async () => {
    setLibraryLoading(true);
    setLibraryResult(null);
    try {
      const params = new URLSearchParams({ title: book.title });
      if (book.isbn?.[0]) params.set("isbn", book.isbn[0]);
      const resp = await fetch(`/api/library?${params}`);
      const data = await resp.json();
      setLibraryResult(data.result || data.error || "No result");
    } catch {
      setLibraryResult("Could not check library. Service may be offline.");
    } finally {
      setLibraryLoading(false);
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg hover:shadow-sm transition-shadow">
      {/* Cover */}
      <div className="shrink-0 w-20 h-28 rounded overflow-hidden bg-stone-100 flex items-center justify-center">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.display_title}
            className="w-full h-full object-cover"
          />
        ) : (
          <BookOpen className="w-8 h-8 text-stone-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight truncate">
              {book.display_title}
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
              {book.display_authors}
            </p>
          </div>
          <button
            onClick={() => (saved ? removeBook(book.key) : addBook(book))}
            className={`shrink-0 p-1.5 rounded-full transition-colors ${
              saved
                ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                : "bg-stone-100 text-stone-500 hover:bg-blue-100 hover:text-blue-700"
            }`}
            title={saved ? "Remove from reading list" : "Add to reading list"}
          >
            {saved ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <LindyBadge score={book.lindy_score} />
          {book.first_publish_year && (
            <span className="text-xs text-[var(--color-text-muted)]">
              {book.first_publish_year}
            </span>
          )}
          {book.ratings_average && book.ratings_count && (
            <span className="inline-flex items-center gap-0.5 text-xs text-[var(--color-text-muted)]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {book.ratings_average.toFixed(1)} ({book.ratings_count.toLocaleString()})
            </span>
          )}
          {book.is_public_domain && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-badge-free)] text-[var(--color-badge-free-text)]">
              Free
            </span>
          )}
        </div>

        {/* Subjects */}
        {book.subject && book.subject.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {book.subject.slice(0, 3).map((s) => (
              <span
                key={s}
                className="px-1.5 py-0.5 bg-stone-100 text-stone-600 text-[10px] rounded"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          {book.is_public_domain && book.archive_url && (
            <a
              href={book.archive_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-success)] hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Read Free
            </a>
          )}
          <button
            onClick={checkLibrary}
            disabled={libraryLoading}
            className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline disabled:opacity-50"
          >
            {libraryLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Library className="w-3.5 h-3.5" />
            )}
            Check NYPL
          </button>
          <a
            href={book.open_library_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Open Library
          </a>
          <a
            href={buildBookshopUrl(book.title, book.display_authors)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:underline"
          >
            <Store className="w-3 h-3" />
            Buy (Indie)
          </a>
        </div>

        {/* Library availability result */}
        {libraryResult && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-[var(--color-text)] whitespace-pre-wrap">
            {libraryResult}
          </div>
        )}
      </div>
    </div>
  );
}
