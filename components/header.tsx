'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function Header() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4 mb-8">
      <img
        src="/the-dude.png"
        alt="The Dude"
        className="w-20 h-20 rounded-full border-4 border-white shadow-2xl ring-4 ring-orange-300/50"
      />
      <div>
        <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-1">
          Lebowski Labs
        </h1>
        <p className="text-white/90 drop-shadow-md">
          AI Content Platform • The Dude Abides ✌️
        </p>
      </div>
      <div className="ml-auto">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="bg-white/90 hover:bg-white border-2 border-orange-300"
        >
          Uitloggen
        </Button>
      </div>
    </div>
  )
}
