'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2Icon, CheckCircle2Icon, AlertCircleIcon } from 'lucide-react'
import { createArticle } from '@/lib/api-client'

type WorkflowStep = {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export default function CreatePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('fleet-managers')
  const [keywords, setKeywords] = useState('')
  const [sources, setSources] = useState('')
  const [briefing, setBriefing] = useState('')
  const [currentStep, setCurrentStep] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const steps = [
    'Research',
    'Validation',
    'Writing',
    'Compliance',
    'Storage'
  ]

  async function handleCreate() {
    if (!topic) {
      setError('Onderwerp is verplicht')
      return
    }

    setIsCreating(true)
    setError('')
    setProgress(0)

    try {
      // Simulate progress updates (in real app, use SSE or polling)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90))
      }, 3000)

      setCurrentStep('Research')

      const result = await createArticle({
        topic,
        targetAudience: audience,
        keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
        sources: sources.split('\n').map(s => s.trim()).filter(Boolean),
        briefing: briefing.trim() || undefined
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (result.success) {
        setCurrentStep('Completed')
        // Redirect to article after short delay
        setTimeout(() => {
          router.push(`/articles/${result.articleId}`)
        }, 1500)
      } else {
        setError(result.error || 'Er ging iets mis')
        setIsCreating(false)
      }

    } catch (err: any) {
      setError(err.message || 'Er ging iets mis')
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary mb-2">
          Nieuw Artikel Maken
        </h1>
        <p className="text-gray-600">
          AI genereert content met verified facts
        </p>
      </div>

      {!isCreating ? (
        <Card>
          <CardHeader>
            <CardTitle>Content Details</CardTitle>
            <CardDescription>
              Vul de gegevens in voor het artikel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic">Onderwerp *</Label>
              <Input
                id="topic"
                placeholder="Bijv: TCO berekeningen voor elektrische trucks"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">Doelgroep *</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger id="audience">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fleet-managers">Fleet Managers</SelectItem>
                  <SelectItem value="logistics-directors">Logistiek Directeuren</SelectItem>
                  <SelectItem value="sustainability-officers">Duurzaamheidsmanagers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (optioneel)</Label>
              <Input
                id="keywords"
                placeholder="TCO, elektrisch, kosten (comma separated)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Meerdere keywords scheiden met komma's
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sources">
                Bronnen (optioneel)
                <span className="text-sm text-gray-500 font-normal ml-2">
                  URLs van betrouwbare bronnen
                </span>
              </Label>
              <textarea
                id="sources"
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="https://renault-trucks.nl/artikel-1&#10;https://example.com/article-2&#10;&#10;Één URL per regel"
                value={sources}
                onChange={(e) => setSources(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Voeg URLs toe van artikelen, specs, of documentatie.
                Deze bronnen krijgen prioriteit bij fact extraction.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="briefing">
                Briefing (optioneel)
                <span className="text-sm text-gray-500 font-normal ml-2">
                  Geef context, insteek, doel of quotes
                </span>
              </Label>
              <textarea
                id="briefing"
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Bijvoorbeeld:&#10;&#10;• Focus op TCO voordelen voor MKB&#10;• Interview quote van Jan de Vries (Fleet Manager): 'We besparen 20% op brandstof'&#10;• Doel: Overtuigen van switch naar elektrisch&#10;• Insteek: Praktische tips, geen theory"
                value={briefing}
                onChange={(e) => setBriefing(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                💡 Hoe specifieker je briefing, hoe beter het artikel aansluit op je doel
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
                <AlertCircleIcon className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={handleCreate}
              className="w-full bg-primary hover:bg-primary-dark text-white"
              size="lg"
            >
              🚀 Artikel Genereren
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Artikel wordt gegenereerd...</CardTitle>
            <CardDescription>
              Dit kan 2-3 minuten duren
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />

            <div className="space-y-3">
              {steps.map((step, index) => {
                const isActive = currentStep === step
                const isCompleted = steps.indexOf(currentStep) > index || currentStep === 'Completed'

                return (
                  <div key={step} className="flex items-center gap-3">
                    {isCompleted ? (
                      <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                    ) : isActive ? (
                      <Loader2Icon className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={isActive ? 'font-semibold text-primary' : 'text-gray-600'}>
                      {step}
                    </span>
                    {isActive && (
                      <Badge variant="outline" className="ml-auto">
                        Bezig...
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {currentStep === 'Completed' && (
              <div className="text-center text-green-600 font-semibold">
                ✅ Artikel succesvol gemaakt! Redirecting...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
