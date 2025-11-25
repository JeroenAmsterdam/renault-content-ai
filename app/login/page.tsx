'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AlertCircleIcon } from 'lucide-react'

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
        router.push('/')
        router.refresh()
      } else {
        setError('Ongeldige inloggegevens')
      }
    } catch (err) {
      setError('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Lebowski Labs
          </CardTitle>
          <CardDescription>
            Enterprise content creation voor marketing bureaus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Organisatie</Label>
              <Input
                id="clientName"
                placeholder="Voer uw organisatienaam in"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                <AlertCircleIcon className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white"
              disabled={loading}
            >
              {loading ? 'Bezig...' : 'Inloggen'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Powered by Lebowski Labs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
