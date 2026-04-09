import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IGCSE French Oral Coach",
  description: "ChatGPT-style French speaking practice with text and realtime voice."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
