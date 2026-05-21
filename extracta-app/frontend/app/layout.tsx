import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Extracta",
  description: "AI-powered data extraction from clinical PDFs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
