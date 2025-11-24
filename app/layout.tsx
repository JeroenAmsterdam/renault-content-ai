import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Renault Trucks Content System',
  description: 'AI-powered content creation with zero-hallucination enforcement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased">
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}
