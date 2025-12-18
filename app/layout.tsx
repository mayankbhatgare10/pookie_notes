import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pookie Notes",
  description: "Notes 2.0 - The ultimate note-taking experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

