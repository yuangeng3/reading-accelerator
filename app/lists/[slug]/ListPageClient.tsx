"use client";

import Header from "@/components/Header";
import { CuratedBook, CuratedList } from "@/lib/curated";
import {
  BookOpen,
  Clock,
  ArrowLeft,
  Store,
} from "lucide-react";
import Link from "next/link";

function buildBookshopUrl(title: string, author: string): string {
  const query = `${title} ${author}`.trim();
  return `https://bookshop.org/search?keywords=${encodeURIComponent(query)}`;
}

interface Props {
  list: CuratedList;
  books: CuratedBook[];
}

export default function ListPageClient({ list, books }: Props) {
  return (
    <>
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Home
        </Link>

        <div className="space-y-2 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{list.title}</h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            {list.description}
          </p>
        </div>

        <div className="space-y-4">
          {books.map((book, i) => (
            <div
              key={book.slug}
              className="flex gap-4 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg"
            >
              <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-sm font-semibold text-[var(--color-text-muted)]">
                {i + 1}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div>
                  <Link
                    href={`/books/${book.slug}`}
                    className="text-sm font-semibold hover:text-[var(--color-accent)] transition-colors"
                  >
                    {book.title}
                  </Link>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {book.author} · {book.year > 0 ? book.year : `${Math.abs(book.year)} BC`}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                  {book.tagline}
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <Link
                    href={`/books/${book.slug}`}
                    className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
                  >
                    <BookOpen className="w-3 h-3" />
                    Details
                  </Link>
                  <a
                    href={buildBookshopUrl(book.title, book.author)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    <Store className="w-3 h-3" />
                    Buy (Indie)
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
