export interface DiscoverQuestion {
  id: string;
  question: string;
  placeholder: string;
  helpText?: string;
}

export const DISCOVER_QUESTIONS: DiscoverQuestion[] = [
  {
    id: "goal",
    question: "What do you want to become?",
    placeholder: "e.g., A calmer parent, financially independent, a better thinker, someone who builds things...",
    helpText: "Not what genre you like — what kind of person you're trying to be.",
  },
  {
    id: "context",
    question: "What's going on in your life right now?",
    placeholder: "e.g., Raising two young kids in NYC, switching careers, starting a business, dealing with burnout...",
    helpText: "This helps us find books that meet you where you are.",
  },
  {
    id: "spark",
    question: "What book, idea, or person has changed how you see the world?",
    placeholder: "e.g., Meditations by Marcus Aurelius, Nassim Taleb, a conversation with my grandmother...",
    helpText: "We'll find books in that intellectual lineage.",
  },
  {
    id: "avoid",
    question: "What kind of books do you NOT want?",
    placeholder: "e.g., Self-help fluff, anything too academic, business books that could be a blog post...",
    helpText: "Optional — helps us filter out noise.",
  },
];
