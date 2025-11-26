import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lebowski Labs - AI Content Platform',
  description: 'Enterprise content creation platform met zero-hallucination enforcement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
