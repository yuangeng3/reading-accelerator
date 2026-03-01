import { SearchParams, SearchResponse, BookResult } from "./types";

const OL_SEARCH_URL = "https://openlibrary.org/search.json";

const RETURN_FIELDS = [
  "key",
  "title",
  "subtitle",
  "author_name",
  "author_key",
  "first_publish_year",
  "edition_count",
  "number_of_pages_median",
  "cover_i",
  "subject",
  "language",
  "publisher",
  "isbn",
  "ratings_average",
  "ratings_count",
  "readinglog_count",
  "want_to_read_count",
  "currently_reading_count",
  "already_read_count",
  "ebook_access",
  "ebook_count_i",
  "has_fulltext",
  "first_sentence",
  "id_goodreads",
  "id_amazon",
].join(",");

export async function searchBooks(
  params: SearchParams
): Promise<SearchResponse> {
  const url = new URL(OL_SEARCH_URL);
  url.searchParams.set("q", params.query);
  url.searchParams.set("fields", RETURN_FIELDS);
  url.searchParams.set("limit", String(Math.min(params.limit ?? 20, 100)));

  if (params.offset) url.searchParams.set("offset", String(params.offset));
  if (params.title) url.searchParams.set("title", params.title);
  if (params.author) url.searchParams.set("author", params.author);
  if (params.subject) url.searchParams.set("subject", params.subject);
  if (params.language) url.searchParams.set("language", params.language);
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.ebook_access)
    url.searchParams.set("ebook_access", params.ebook_access);
  if (params.has_fulltext) url.searchParams.set("has_fulltext", "true");

  const resp = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!resp.ok) {
    throw new Error(`Open Library API error: ${resp.status}`);
  }

  const data = await resp.json();

  return {
    numFound: data.numFound ?? 0,
    start: data.start ?? 0,
    docs: data.docs as BookResult[],
  };
}
