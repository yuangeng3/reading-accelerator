import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reading Accelerator — Discover Timeless Books, Free at Your Library",
  description:
    "Find the best books ranked by timelessness, not trends. Read public domain classics free on archive.org or borrow from your local library.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
