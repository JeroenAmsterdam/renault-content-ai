'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCwIcon } from 'lucide-react'

interface RewriteFormProps {
  articleId: string
  currentVersion: number
}

export function RewriteForm({ articleId, currentVersion }: RewriteFormProps) {
  const router = useRouter()
  const [versionNotes, setVersionNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!versionNotes.trim()) {
      setError('Rewrite briefing is verplicht')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/articles/${articleId}/rewrite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ versionNotes: versionNotes.trim() })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create new version')
      }

      // Redirect to new version
      router.push(`/articles/${data.articleId}`)
      router.refresh()

    } catch (err: any) {
      console.error('Rewrite error:', err)
      setError(err.message || 'Er is iets misgegaan')
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <RefreshCwIcon className="w-5 h-5" />
          Nieuwe versie maken
        </CardTitle>
        <CardDescription>
          Maak een aangepaste versie van dit artikel. Beschrijf wat je wilt aanpassen.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="versionNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Rewrite briefing *
            </label>
            <Textarea
              id="versionNotes"
              placeholder="Bijvoorbeeld: Maak het artikel korter en toegankelijker voor niet-technische lezers. Focus op praktische voordelen in plaats van specificaties."
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
              rows={4}
              disabled={isLoading}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Dit wordt versie {currentVersion + 1}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !versionNotes.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold"
          >
            {isLoading ? (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                Nieuwe versie wordt gemaakt...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4 mr-2" />
                Herschrijven (v{currentVersion + 1})
              </>
            )}
          </Button>

          {isLoading && (
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
              <p className="font-medium mb-1">⏳ Even geduld...</p>
              <p className="text-xs">
                Het artikel wordt opnieuw gegenereerd met jouw aanpassingen.
                Dit kan 1-2 minuten duren.
              </p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
