'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [clientName, setClientName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName, password })
      })

      const data = await response.json()

      if (data.success) {
        // Store client info in sessionStorage for immediate UI update
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('client_name', data.client.name)
        }
        router.push('/')
        router.refresh()
      } else {
        setError(data.error || 'Ongeldige inloggegevens')
      }
    } catch (err) {
      setError('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-secondary">
            Lebowski Labs
          </CardTitle>
          <CardDescription>
            AI Content Platform voor Marketing Bureaus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Organisatie</Label>
              <Input
                id="clientName"
                placeholder="bijv. Renault Trucks"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Voer de volledige naam in zoals: "Renault Trucks" of "Olympisch Stadion"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Bezig met inloggen...' : '🔓 Inloggen'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
