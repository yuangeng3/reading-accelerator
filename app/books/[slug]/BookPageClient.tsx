"use client";

import Header from "@/components/Header";
import { CuratedBook } from "@/lib/curated";
import { BookWithScore } from "@/lib/types";
import { useReadingList } from "@/lib/store";
import {
  BookOpen,
  Clock,
  Star,
  Plus,
  Check,
  ExternalLink,
  Store,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

function buildBookshopUrl(title: string, author: string): string {
  const query = `${title} ${author}`.trim();
  return `https://bookshop.org/search?keywords=${encodeURIComponent(query)}`;
}

interface Props {
  curated: CuratedBook;
  book: BookWithScore | null;
}

export default function BookPageClient({ curated, book }: Props) {
  const { addBook, removeBook, isBookSaved } = useReadingList();
  const saved = book ? isBookSaved(book.key) : false;

  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/search"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to search
        </Link>

        <div className="flex gap-6">
          {/* Cover */}
          <div className="shrink-0 w-32 h-48 rounded-lg overflow-hidden bg-stone-100 flex items-center justify-center shadow-sm">
            {book?.cover_url ? (
              <img
                src={book.cover_url}
                alt={curated.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-12 h-12 text-stone-300" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {curated.title}
              </h1>
              <p className="text-base text-[var(--color-text-muted)]">
                {curated.author} · {curated.year > 0 ? curated.year : `${Math.abs(curated.year)} BC`}
              </p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {book && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <Clock className="w-3 h-3" />
                  Lindy Score: {book.lindy_score.toFixed(1)}
                </span>
              )}
              {book?.is_public_domain && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-badge-free)] text-[var(--color-badge-free-text)]">
                  Free to Read
                </span>
              )}
              {book?.ratings_average && (
                <span className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {book.ratings_average.toFixed(1)}
                  {book.ratings_count && (
                    <span className="text-xs">
                      ({book.ratings_count.toLocaleString()})
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Tagline */}
            <p className="text-sm leading-relaxed text-[var(--color-text)]">
              {curated.tagline}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {book?.is_public_domain && book.archive_url && (
              <a
                href={book.archive_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-success)] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                <BookOpen className="w-4 h-4" />
                Read Free on Archive.org
              </a>
            )}
            <a
              href={buildBookshopUrl(curated.title, curated.author)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 border border-[var(--color-border)] bg-[var(--color-card)] text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
            >
              <Store className="w-4 h-4" />
              Buy from Indie Bookstore
            </a>
            {book && (
              <button
                onClick={() =>
                  saved ? removeBook(book.key) : addBook(book)
                }
                className={`flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  saved
                    ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                    : "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]"
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add to Reading List
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Details */}
        {book && (
          <div className="mt-8 space-y-4">
            {book.edition_count && (
              <div className="flex justify-between text-sm py-2 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)]">Editions</span>
                <span>{book.edition_count.toLocaleString()}</span>
              </div>
            )}
            {book.number_of_pages_median && (
              <div className="flex justify-between text-sm py-2 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)]">Pages (median)</span>
                <span>{book.number_of_pages_median}</span>
              </div>
            )}
            {book.readinglog_count && (
              <div className="flex justify-between text-sm py-2 border-b border-[var(--color-border)]">
                <span className="text-[var(--color-text-muted)]">Reading Log</span>
                <span>{book.readinglog_count.toLocaleString()} readers</span>
              </div>
            )}
            {book.subject && book.subject.length > 0 && (
              <div className="py-2">
                <span className="text-sm text-[var(--color-text-muted)] block mb-2">
                  Subjects
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {book.subject.slice(0, 10).map((s) => (
                    <span
                      key={s}
                      className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {book.first_sentence && book.first_sentence.length > 0 && (
              <div className="py-2">
                <span className="text-sm text-[var(--color-text-muted)] block mb-1">
                  First sentence
                </span>
                <p className="text-sm italic text-[var(--color-text)]">
                  &ldquo;{book.first_sentence[0]}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Links */}
        <div className="mt-8 pt-4 border-t border-[var(--color-border)]">
          <div className="flex gap-4">
            {book && (
              <a
                href={book.open_library_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Library
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
