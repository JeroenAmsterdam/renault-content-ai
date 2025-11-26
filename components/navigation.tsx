'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  // Don't show navigation on login page
  if (pathname === '/login') {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-orange-300 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Avatar */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/the-dude.png"
              alt="The Dude"
              className="w-12 h-12 rounded-full border-2 border-orange-300 shadow-lg ring-2 ring-orange-200/50"
            />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Lebowski Labs
              </h1>
              <p className="text-xs text-gray-600">The Dude Abides ✌️</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                pathname === '/'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/create"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                pathname === '/create'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Nieuw Artikel
            </Link>
            <Link
              href="/articles"
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                pathname === '/articles'
                  ? 'bg-gradient-to-r from-orange-400 to-pink-400 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Alle Artikelen
            </Link>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="ml-4 bg-white hover:bg-gray-50 border-2 border-orange-300 text-gray-700 font-medium"
            >
              Uitloggen
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
