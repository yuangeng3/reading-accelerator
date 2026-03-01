import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CURATED_LISTS,
  getListBySlug,
  getBookBySlug,
} from "@/lib/curated";
import ListPageClient from "./ListPageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CURATED_LISTS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const list = getListBySlug(slug);
  if (!list) return {};

  return {
    title: `${list.title} — Reading Accelerator`,
    description: list.meta_description,
    openGraph: {
      title: list.title,
      description: list.meta_description,
    },
  };
}

export default async function ListPage({ params }: Props) {
  const { slug } = await params;
  const list = getListBySlug(slug);
  if (!list) notFound();

  const books = list.books
    .map(getBookBySlug)
    .filter((b): b is NonNullable<typeof b> => b !== undefined);

  // Schema.org ItemList JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: list.title,
    description: list.description,
    numberOfItems: books.length,
    itemListElement: books.map((book, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Book",
        name: book.title,
        author: { "@type": "Person", name: book.author },
        url: `https://reads.fatfirewoman.com/books/${book.slug}`,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ListPageClient list={list} books={books} />
    </>
  );
}
