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
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold text-secondary mb-2">
          Lebowski Labs
        </h1>
        <p className="text-gray-600">
          I had a rough day, and I hate the f*cking Eagles
        </p>
      </div>
      <Button
        onClick={handleLogout}
        variant="outline"
      >
        Uitloggen
      </Button>
    </div>
  )
}
