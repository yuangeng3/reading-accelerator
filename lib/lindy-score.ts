import { BookResult, BookWithScore } from "./types";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Calculate the Lindy Score for a book.
 * Ranks books by timelessness: older, more reprinted, higher-rated books score higher.
 * Public domain books get a bonus.
 */
export function calculateLindyScore(book: BookResult): number {
  const age = book.first_publish_year
    ? CURRENT_YEAR - book.first_publish_year + 1
    : 1;
  const editions = book.edition_count ?? 0;
  const rating = book.ratings_average ?? 0;
  const readingLog = book.readinglog_count ?? 0;
  const isPublicDomain =
    book.ebook_access === "public" && book.has_fulltext === true;

  const score =
    Math.log(Math.max(age, 1)) * 0.4 +
    Math.log(editions + 1) * 0.2 +
    (rating / 5) * 0.2 +
    Math.log(readingLog + 1) * 0.1 +
    (isPublicDomain ? 1 : 0) * 0.1;

  return Math.round(score * 100) / 100;
}

/**
 * Enrich a raw book result with Lindy Score and computed display fields.
 */
export function enrichBook(book: BookResult): BookWithScore {
  const isPublicDomain =
    book.ebook_access === "public" && book.has_fulltext === true;

  const displayTitle = book.subtitle
    ? `${book.title}: ${book.subtitle}`
    : book.title;

  const displayAuthors = book.author_name?.join(", ") ?? "Unknown Author";

  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : undefined;

  const archiveUrl = isPublicDomain
    ? `https://archive.org/search?query=${encodeURIComponent(book.title)}+${encodeURIComponent(displayAuthors)}`
    : undefined;

  return {
    ...book,
    lindy_score: calculateLindyScore(book),
    is_public_domain: isPublicDomain,
    archive_url: archiveUrl,
    cover_url: coverUrl,
    open_library_url: `https://openlibrary.org${book.key}`,
    display_title: displayTitle,
    display_authors: displayAuthors,
  };
}
