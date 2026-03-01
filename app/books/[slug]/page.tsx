import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CURATED_BOOKS, getBookBySlug } from "@/lib/curated";
import { fetchWork } from "@/lib/open-library-work";
import { enrichBook } from "@/lib/lindy-score";
import BookPageClient from "./BookPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CURATED_BOOKS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const curated = getBookBySlug(slug);
  if (!curated) return {};

  const title = `${curated.title} by ${curated.author} — Lindy Score & Free Access`;
  const description = curated.tagline;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "book",
    },
  };
}

export default async function BookPage({ params }: Props) {
  const { slug } = await params;
  const curated = getBookBySlug(slug);
  if (!curated) notFound();

  const raw = await fetchWork(curated.ol_work_key);
  const book = raw ? enrichBook(raw) : null;

  // Schema.org Book JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: curated.title,
    author: {
      "@type": "Person",
      name: curated.author,
    },
    datePublished: curated.year > 0 ? String(curated.year) : undefined,
    description: curated.tagline,
    ...(book?.isbn?.[0] && { isbn: book.isbn[0] }),
    ...(book?.cover_url && { image: book.cover_url }),
    ...(book?.ratings_average && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: book.ratings_average,
        ratingCount: book.ratings_count,
        bestRating: 5,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BookPageClient curated={curated} book={book} />
    </>
  );
}
