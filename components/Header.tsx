"use client";

import Link from "next/link";
import { useReadingList } from "@/lib/store";
import { BookMarked, Search } from "lucide-react";

export default function Header() {
  const bookCount = useReadingList((s) => s.books.length);

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-[var(--color-text)]"
        >
          Reading Accelerator
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <Search className="w-4 h-4" />
            Search
          </Link>
          <Link
            href="/list"
            className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            <BookMarked className="w-4 h-4" />
            My List
            {bookCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-medium">
                {bookCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
