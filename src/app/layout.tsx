import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preflight",
  description: "AI Venture Preflight for founders before they build."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
