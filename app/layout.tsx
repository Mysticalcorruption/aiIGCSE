import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "aiIGCSE Planner v2",
  description: "Interactive revision planner with editable subjects, sub-topics, calendar times, and readiness tracking."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
