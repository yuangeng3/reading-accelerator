/**
 * Seed data for SEO pages. Each entry maps a slug to an Open Library work key
 * and metadata for generating static pages.
 */

export interface CuratedBook {
  slug: string;
  ol_work_key: string; // e.g., "/works/OL15331218W"
  title: string;
  author: string;
  year: number;
  tagline: string; // One-line "why read this" for meta description
}

export interface CuratedList {
  slug: string;
  title: string;
  description: string;
  meta_description: string;
  books: string[]; // slugs referencing CURATED_BOOKS
}

export const CURATED_BOOKS: CuratedBook[] = [
  {
    slug: "meditations-marcus-aurelius",
    ol_work_key: "/works/OL55741W",
    title: "Meditations",
    author: "Marcus Aurelius",
    year: 180,
    tagline: "A Roman emperor's private journal on self-discipline. Free to read — it's nearly 2,000 years old and still the best book on inner calm.",
  },
  {
    slug: "republic-plato",
    ol_work_key: "/works/OL168022W",
    title: "The Republic",
    author: "Plato",
    year: -375,
    tagline: "The foundation of Western political philosophy. Free to read — still the starting point for thinking about justice and governance.",
  },
  {
    slug: "art-of-war-sun-tzu",
    ol_work_key: "/works/OL151974W",
    title: "The Art of War",
    author: "Sun Tzu",
    year: -500,
    tagline: "2,500 years of strategic wisdom in 13 short chapters. Free to read — applies to business, negotiation, and life.",
  },
  {
    slug: "wealth-of-nations-adam-smith",
    ol_work_key: "/works/OL509040W",
    title: "The Wealth of Nations",
    author: "Adam Smith",
    year: 1776,
    tagline: "The book that invented economics. Free to read — understand how markets actually work from the original source.",
  },
  {
    slug: "origin-of-species-darwin",
    ol_work_key: "/works/OL1168083W",
    title: "On the Origin of Species",
    author: "Charles Darwin",
    year: 1859,
    tagline: "The most important scientific book ever written. Free to read — Darwin's prose is surprisingly accessible.",
  },
  {
    slug: "odyssey-homer",
    ol_work_key: "/works/OL15331218W",
    title: "The Odyssey",
    author: "Homer",
    year: -700,
    tagline: "The original adventure story. Free to read — 2,700 years old and still the template for every hero's journey.",
  },
  {
    slug: "iliad-homer",
    ol_work_key: "/works/OL262463W",
    title: "The Iliad",
    author: "Homer",
    year: -750,
    tagline: "War, honor, grief, and what it means to be human. Free to read — the oldest and greatest war story.",
  },
  {
    slug: "essays-montaigne",
    ol_work_key: "/works/OL1392742W",
    title: "Essays",
    author: "Michel de Montaigne",
    year: 1580,
    tagline: "The inventor of the personal essay. Free to read — 450 years old, reads like a blog by your wisest friend.",
  },
  {
    slug: "principles-of-mathematics-newton",
    ol_work_key: "/works/OL1965741W",
    title: "Principia Mathematica",
    author: "Isaac Newton",
    year: 1687,
    tagline: "The book that explained gravity and motion. Free to read — the foundation of modern physics.",
  },
  {
    slug: "divine-comedy-dante",
    ol_work_key: "/works/OL18209W",
    title: "The Divine Comedy",
    author: "Dante Alighieri",
    year: 1320,
    tagline: "A journey through Hell, Purgatory, and Paradise. Free to read — 700 years of influence on Western imagination.",
  },
  {
    slug: "tao-te-ching-lao-tzu",
    ol_work_key: "/works/OL151963W",
    title: "Tao Te Ching",
    author: "Lao Tzu",
    year: -400,
    tagline: "81 short poems on the art of living. Free to read — the antidote to overthinking, written 2,400 years ago.",
  },
  {
    slug: "nicomachean-ethics-aristotle",
    ol_work_key: "/works/OL17927292W",
    title: "Nicomachean Ethics",
    author: "Aristotle",
    year: -340,
    tagline: "How to live a good life, by the father of logic. Free to read — still the most practical guide to virtue and happiness.",
  },
  {
    slug: "autobiography-benjamin-franklin",
    ol_work_key: "/works/OL225167W",
    title: "The Autobiography of Benjamin Franklin",
    author: "Benjamin Franklin",
    year: 1791,
    tagline: "Self-improvement from the original self-improver. Free to read — Franklin's system for building good habits still works.",
  },
  {
    slug: "letters-seneca",
    ol_work_key: "/works/OL261186W",
    title: "Letters from a Stoic",
    author: "Seneca",
    year: 65,
    tagline: "Practical philosophy delivered as letters to a friend. Free to read — the most readable entry point to Stoicism.",
  },
  {
    slug: "walden-thoreau",
    ol_work_key: "/works/OL15095708W",
    title: "Walden",
    author: "Henry David Thoreau",
    year: 1854,
    tagline: "Two years of deliberate living in the woods. Free to read — the original case for simplicity over consumption.",
  },
  {
    slug: "prince-machiavelli",
    ol_work_key: "/works/OL98474W",
    title: "The Prince",
    author: "Niccolo Machiavelli",
    year: 1532,
    tagline: "Power and politics without illusions. Free to read — 500 years old and still the most honest book on leadership.",
  },
  {
    slug: "aesops-fables",
    ol_work_key: "/works/OL15089629W",
    title: "Aesop's Fables",
    author: "Aesop",
    year: -600,
    tagline: "Timeless moral lessons in tiny stories. Free to read — 2,600 years of wisdom, perfect for all ages.",
  },
  {
    slug: "common-sense-thomas-paine",
    ol_work_key: "/works/OL54192W",
    title: "Common Sense",
    author: "Thomas Paine",
    year: 1776,
    tagline: "The pamphlet that started a revolution. Free to read — still the best example of persuasive writing.",
  },
  {
    slug: "antifragile-nassim-taleb",
    ol_work_key: "/works/OL16809710W",
    title: "Antifragile",
    author: "Nassim Nicholas Taleb",
    year: 2012,
    tagline: "How to thrive in chaos and uncertainty. The most important modern book on decision-making under unknowns.",
  },
  {
    slug: "thinking-fast-and-slow-kahneman",
    ol_work_key: "/works/OL16130632W",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    year: 2011,
    tagline: "How your brain actually makes decisions — and where it goes wrong. The definitive guide to cognitive biases.",
  },
];

export const CURATED_LISTS: CuratedList[] = [
  {
    slug: "stoicism-beginners",
    title: "Stoicism for Beginners: 5 Books to Start",
    description: "The essential Stoic reading path, ordered from most accessible to most challenging.",
    meta_description: "Start your Stoic journey with these 5 timeless books. Free to read online — from Seneca's letters to Marcus Aurelius' Meditations.",
    books: [
      "letters-seneca",
      "meditations-marcus-aurelius",
      "tao-te-ching-lao-tzu",
      "nicomachean-ethics-aristotle",
      "antifragile-nassim-taleb",
    ],
  },
  {
    slug: "public-domain-gems",
    title: "20 Life-Changing Books You Can Read for Free",
    description: "All public domain. All free on archive.org. All timeless.",
    meta_description: "20 free books that changed the world — all public domain, all available on archive.org. From Homer to Thoreau.",
    books: [
      "odyssey-homer",
      "iliad-homer",
      "republic-plato",
      "art-of-war-sun-tzu",
      "nicomachean-ethics-aristotle",
      "meditations-marcus-aurelius",
      "letters-seneca",
      "aesops-fables",
      "divine-comedy-dante",
      "prince-machiavelli",
      "essays-montaigne",
      "common-sense-thomas-paine",
      "wealth-of-nations-adam-smith",
      "autobiography-benjamin-franklin",
      "origin-of-species-darwin",
      "walden-thoreau",
      "tao-te-ching-lao-tzu",
      "principles-of-mathematics-newton",
    ],
  },
  {
    slug: "decision-making",
    title: "Books That Improve How You Think and Decide",
    description: "From ancient strategy to modern cognitive science — the best books on clear thinking.",
    meta_description: "The best books on decision-making, from Sun Tzu's Art of War to Kahneman's Thinking, Fast and Slow. Free options included.",
    books: [
      "art-of-war-sun-tzu",
      "prince-machiavelli",
      "thinking-fast-and-slow-kahneman",
      "antifragile-nassim-taleb",
      "nicomachean-ethics-aristotle",
      "meditations-marcus-aurelius",
    ],
  },
  {
    slug: "financial-independence",
    title: "Books for the Financially Independent Mind",
    description: "Not get-rich-quick. These books build the mental models for real wealth and freedom.",
    meta_description: "The best books on financial independence and wealth-building. From Adam Smith to Nassim Taleb — timeless money wisdom.",
    books: [
      "wealth-of-nations-adam-smith",
      "antifragile-nassim-taleb",
      "autobiography-benjamin-franklin",
      "walden-thoreau",
      "thinking-fast-and-slow-kahneman",
      "common-sense-thomas-paine",
    ],
  },
  {
    slug: "read-to-your-kids",
    title: "Lindy Books to Read With Your Kids",
    description: "Stories that have survived centuries because they speak to something universal in children (and adults).",
    meta_description: "The best timeless books for kids — Aesop's Fables, Homer's Odyssey, and more. Free to read online. Stories that last.",
    books: [
      "aesops-fables",
      "odyssey-homer",
      "iliad-homer",
      "divine-comedy-dante",
    ],
  },
];

/** Lookup helpers */
export function getBookBySlug(slug: string): CuratedBook | undefined {
  return CURATED_BOOKS.find((b) => b.slug === slug);
}

export function getListBySlug(slug: string): CuratedList | undefined {
  return CURATED_LISTS.find((l) => l.slug === slug);
}
