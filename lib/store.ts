import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SavedBook, ReadingStatus, BookWithScore } from "./types";

interface ReadingListState {
  books: SavedBook[];
  addBook: (book: BookWithScore) => void;
  removeBook: (key: string) => void;
  updateStatus: (key: string, status: ReadingStatus) => void;
  isBookSaved: (key: string) => boolean;
}

export const useReadingList = create<ReadingListState>()(
  persist(
    (set, get) => ({
      books: [],

      addBook: (book: BookWithScore) => {
        if (get().books.some((b) => b.key === book.key)) return;
        set((state) => ({
          books: [
            ...state.books,
            {
              key: book.key,
              title: book.title,
              display_title: book.display_title,
              display_authors: book.display_authors,
              lindy_score: book.lindy_score,
              is_public_domain: book.is_public_domain,
              archive_url: book.archive_url,
              cover_url: book.cover_url,
              open_library_url: book.open_library_url,
              first_publish_year: book.first_publish_year,
              status: "want_to_read",
              added_at: new Date().toISOString(),
            },
          ],
        }));
      },

      removeBook: (key: string) =>
        set((state) => ({
          books: state.books.filter((b) => b.key !== key),
        })),

      updateStatus: (key: string, status: ReadingStatus) =>
        set((state) => ({
          books: state.books.map((b) =>
            b.key === key ? { ...b, status } : b
          ),
        })),

      isBookSaved: (key: string) => get().books.some((b) => b.key === key),
    }),
    {
      name: "reading-accelerator-list",
    }
  )
);
