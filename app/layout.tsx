import type { Metadata } from "next";
import "./globals.css";

// Note: Using system fonts due to environment restrictions
// In production, consider using next/font/local with Inter font files
// or enable Google Fonts if network allows

export const metadata: Metadata = {
  title: "Renault Trucks Content System",
  description: "Multi-agent content creation system for Renault Trucks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
