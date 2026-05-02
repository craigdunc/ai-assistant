import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripKit — AI-Assisted Travel Catalogue",
  description: "Browse 100 travel products with AI-powered intent-to-interface search. Describe your trip and the catalogue adapts."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
