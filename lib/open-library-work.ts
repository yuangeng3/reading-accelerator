import { BookResult } from "./types";

/**
 * Fetch a single work from Open Library by work key.
 * Used for SEO book pages where we need full data for a specific book.
 */
export async function fetchWork(workKey: string): Promise<BookResult | null> {
  // Search by work key to get the same fields as search results
  const key = workKey.replace("/works/", "");
  const url = `https://openlibrary.org/search.json?q=key:/works/${key}&fields=key,title,subtitle,author_name,author_key,first_publish_year,edition_count,number_of_pages_median,cover_i,subject,language,publisher,isbn,ratings_average,ratings_count,readinglog_count,want_to_read_count,currently_reading_count,already_read_count,ebook_access,ebook_count_i,has_fulltext,first_sentence,id_goodreads,id_amazon&limit=1`;

  const resp = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
  if (!resp.ok) return null;

  const data = await resp.json();
  const docs = data.docs as BookResult[];
  return docs[0] ?? null;
}
