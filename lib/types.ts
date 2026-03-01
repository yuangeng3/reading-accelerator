export interface BookResult {
  key: string;
  title: string;
  subtitle?: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  edition_count?: number;
  number_of_pages_median?: number;
  cover_i?: number;
  subject?: string[];
  language?: string[];
  publisher?: string[];
  isbn?: string[];
  ratings_average?: number;
  ratings_count?: number;
  readinglog_count?: number;
  want_to_read_count?: number;
  currently_reading_count?: number;
  already_read_count?: number;
  ebook_access?: string;
  ebook_count_i?: number;
  has_fulltext?: boolean;
  first_sentence?: string[];
  id_goodreads?: string[];
  id_amazon?: string[];
}

export interface BookWithScore extends BookResult {
  lindy_score: number;
  is_public_domain: boolean;
  archive_url?: string;
  cover_url?: string;
  open_library_url: string;
  display_title: string;
  display_authors: string;
}

export interface SearchParams {
  query: string;
  title?: string;
  author?: string;
  subject?: string;
  language?: string;
  sort?: string;
  ebook_access?: string;
  has_fulltext?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchResponse {
  numFound: number;
  start: number;
  docs: BookResult[];
}

export type ReadingStatus = "want_to_read" | "reading" | "finished";

export interface SavedBook {
  key: string;
  title: string;
  display_title: string;
  display_authors: string;
  lindy_score: number;
  is_public_domain: boolean;
  archive_url?: string;
  cover_url?: string;
  open_library_url: string;
  first_publish_year?: number;
  status: ReadingStatus;
  added_at: string;
}
