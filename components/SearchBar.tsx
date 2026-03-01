"use client";

import { useState, FormEvent } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
  loading?: boolean;
  initialQuery?: string;
}

export default function SearchBar({
  onSearch,
  loading,
  initialQuery = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [author, setAuthor] = useState("");
  const [subject, setSubject] = useState("");
  const [freeOnly, setFreeOnly] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const filters: Record<string, string> = {};
    if (author.trim()) filters.author = author.trim();
    if (subject.trim()) filters.subject = subject.trim();
    if (freeOnly) {
      filters.ebook_access = "public";
      filters.has_fulltext = "true";
    }

    onSearch(query.trim(), filters);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books, authors, topics..."
            className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:border-[var(--color-accent)]"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-3 border rounded-lg transition-colors ${
            showFilters
              ? "border-[var(--color-accent)] bg-blue-50 text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-[var(--color-accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 p-4 bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Filters</span>
            <button
              type="button"
              onClick={() => {
                setAuthor("");
                setSubject("");
                setFreeOnly(false);
              }}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Clear all
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Marcus Aurelius"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/20"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., stoicism, philosophy"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded bg-white focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]/20"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-3 cursor-pointer">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="rounded border-[var(--color-border)]"
            />
            <span className="text-sm">Free to read only (public domain)</span>
          </label>
        </div>
      )}
    </form>
  );
}
