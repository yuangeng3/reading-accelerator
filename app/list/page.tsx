"use client";

import Header from "@/components/Header";
import { useReadingList } from "@/lib/store";
import { ReadingStatus, SavedBook } from "@/lib/types";
import {
  BookOpen,
  Trash2,
  ExternalLink,
  Clock,
  BookMarked,
  CheckCircle2,
  Store,
} from "lucide-react";
import Link from "next/link";

const STATUS_LABELS: Record<ReadingStatus, { label: string; icon: React.ReactNode }> = {
  want_to_read: {
    label: "Want to Read",
    icon: <BookMarked className="w-3.5 h-3.5" />,
  },
  reading: {
    label: "Reading",
    icon: <BookOpen className="w-3.5 h-3.5" />,
  },
  finished: {
    label: "Finished",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
};

const STATUS_ORDER: ReadingStatus[] = ["reading", "want_to_read", "finished"];

function StatusSelect({
  book,
  onUpdate,
}: {
  book: SavedBook;
  onUpdate: (key: string, status: ReadingStatus) => void;
}) {
  return (
    <select
      value={book.status}
      onChange={(e) => onUpdate(book.key, e.target.value as ReadingStatus)}
      className="text-xs px-2 py-1 border border-[var(--color-border)] rounded bg-white focus:outline-none"
    >
      {STATUS_ORDER.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s].label}
        </option>
      ))}
    </select>
  );
}

function buildBookshopUrl(title: string, authors: string): string {
  const query = `${title} ${authors}`.trim();
  return `https://bookshop.org/search?keywords=${encodeURIComponent(query)}`;
}

export default function ListPage() {
  const { books, removeBook, updateStatus } = useReadingList();

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    ...STATUS_LABELS[status],
    books: books.filter((b) => b.status === status),
  }));

  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">My Reading List</h1>
          <span className="text-sm text-[var(--color-text-muted)]">
            {books.length} {books.length === 1 ? "book" : "books"}
          </span>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <BookMarked className="w-12 h-12 text-stone-300 mx-auto" />
            <p className="text-[var(--color-text-muted)]">
              Your reading list is empty.
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline"
            >
              Search for books to add
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped
              .filter((g) => g.books.length > 0)
              .map((group) => (
                <section key={group.status}>
                  <h2 className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)] mb-3">
                    {group.icon}
                    {group.label} ({group.books.length})
                  </h2>
                  <div className="space-y-2">
                    {group.books.map((book) => (
                      <div
                        key={book.key}
                        className="flex items-center gap-3 p-3 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg"
                      >
                        <div className="shrink-0 w-10 h-14 rounded overflow-hidden bg-stone-100 flex items-center justify-center">
                          {book.cover_url ? (
                            <img
                              src={book.cover_url}
                              alt={book.display_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen className="w-4 h-4 text-stone-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {book.display_title}
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {book.display_authors}
                            {book.first_publish_year &&
                              ` · ${book.first_publish_year}`}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-[var(--color-text-muted)]">
                              <Clock className="w-3 h-3" />
                              {book.lindy_score.toFixed(1)}
                            </span>
                            {book.is_public_domain && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-badge-free)] text-[var(--color-badge-free-text)]">
                                Free
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusSelect
                            book={book}
                            onUpdate={updateStatus}
                          />
                          <div className="flex items-center gap-1">
                            {book.is_public_domain && book.archive_url && (
                              <a
                                href={book.archive_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-[var(--color-success)] hover:bg-green-50 rounded"
                                title="Read free"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <a
                              href={buildBookshopUrl(book.title, book.display_authors)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[var(--color-text-muted)] hover:bg-stone-100 rounded"
                              title="Buy from indie bookstore"
                            >
                              <Store className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={book.open_library_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-[var(--color-text-muted)] hover:bg-stone-100 rounded"
                              title="Open Library"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => removeBook(book.key)}
                              className="p-1.5 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 rounded"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </main>
    </>
  );
}
