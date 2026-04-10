import "./globals.css";

export const metadata = {
  title: "AI IGCSE Revision Planner V3",
  description: "Notion-style GCSE revision planner with calendar + preparedness tracking"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
