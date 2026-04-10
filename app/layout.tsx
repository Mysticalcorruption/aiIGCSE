import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "aiIGCSE Revision Planner",
  description: "Interactive revision planner, timer, calendar and preparedness tracker"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
