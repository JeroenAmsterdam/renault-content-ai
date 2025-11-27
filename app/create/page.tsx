'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2Icon, CheckCircle2Icon, AlertCircleIcon, ChevronLeft } from 'lucide-react'
import { createArticle } from '@/lib/api-client'
import { PageWrapper } from '@/components/page-wrapper'

type WorkflowStep = {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
}

export default function CreatePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [topic, setTopic] = useState('')
  const [audience, setAudience] = useState('')
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

    if (!audience) {
      setError('Doelgroep is verplicht')
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

        // Get article ID - try multiple paths for robustness
        const articleId = result.articleId || result.article?.id

        console.log('✅ CREATE PAGE: Article created successfully')
        console.log('📝 CREATE PAGE: Article ID:', articleId)
        console.log('📋 CREATE PAGE: Full result:', JSON.stringify(result, null, 2))

        if (!articleId) {
          console.error('❌ CREATE PAGE: No article ID in response!')
          console.error('❌ CREATE PAGE: Result object:', result)
          // Fallback: redirect to articles list
          setTimeout(() => {
            window.location.href = '/articles'
          }, 1500)
          return
        }

        // Add delay to ensure Supabase replication completes
        console.log('⏳ CREATE PAGE: Waiting 2 seconds for Supabase replication...')
        console.log('🔄 CREATE PAGE: Will redirect to:', `/articles/${articleId}`)

        setTimeout(() => {
          console.log('🚀 CREATE PAGE: Starting redirect NOW')
          window.location.href = `/articles/${articleId}`
        }, 2000)  // Increased from 1500ms to 2000ms
      } else {
        console.error('❌ CREATE PAGE: Article creation failed')
        console.error('❌ CREATE PAGE: Error:', result.error)
        console.error('❌ CREATE PAGE: Full result:', result)
        setError(result.error || 'Er ging iets mis')
        setIsCreating(false)
      }

    } catch (err: any) {
      console.error('💥 Article creation error:', err)
      setError(err.message || 'Er ging iets mis')
      setIsCreating(false)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 text-white hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
            Terug naar dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
            Nieuw Artikel Maken
          </h1>
          <p className="text-white/90 drop-shadow-md text-lg">
            AI genereert content met verified facts
          </p>
        </div>

        {!isCreating ? (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
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
                placeholder="Waar gaat het artikel over?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience">
                Doelgroep & Tone-of-Voice *
                <span className="text-sm text-gray-500 font-normal ml-2">
                  Beschrijf je doelgroep en gewenste aanpak
                </span>
              </Label>
              <Textarea
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder="Bijvoorbeeld:&#10;&#10;Fleet Managers bij internationale transportbedrijven. Aanspreken met 'je', zakelijke en data-driven toon.&#10;&#10;Of:&#10;&#10;Ouders van basisschool scholieren in Amsterdam Oud-Zuid. Aanspreken met 'u', opwekkende en inspirerende stijl. Focus op veiligheid en community."
                rows={5}
                className="resize-none"
                required
              />
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium">💡 Tips voor beste resultaten:</p>
                <ul className="text-xs space-y-1 ml-4 list-disc">
                  <li><strong>Wie:</strong> Functie, industrie, locatie</li>
                  <li><strong>Aanspreekvorm:</strong> 'je' of 'u'</li>
                  <li><strong>Toon:</strong> Zakelijk, inspirerend, technisch, toegankelijk</li>
                  <li><strong>Focus:</strong> Specifieke pijnpunten of interesses</li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (optioneel)</Label>
              <Input
                id="keywords"
                placeholder="Voer relevante zoekwoorden in, gescheiden door komma's"
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
                placeholder="https://example.com/article-1&#10;https://example.com/article-2&#10;&#10;Één URL per regel"
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
                placeholder="Bijvoorbeeld:&#10;&#10;• Focus op kostenbesparingen en ROI&#10;• Interview quote: 'Deze oplossing heeft ons 25% bespaard'&#10;• Doel: Overtuigen van beslissers om over te stappen&#10;• Insteek: Praktische tips met concrete voorbeelden"
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
              className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold shadow-lg"
              size="lg"
            >
              🚀 Artikel Genereren
            </Button>
          </CardContent>
        </Card>
        ) : (
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
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
    </PageWrapper>
  )
}
