import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusIcon, FileTextIcon, CheckCircle2Icon, DatabaseIcon } from 'lucide-react'

async function getStats() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stats`, {
      cache: 'no-store'
    })
    const data = await response.json()
    return data.stats || null
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    return null
  }
}

export default async function HomePage() {
  const stats = await getStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-secondary mb-2">
          AI Content Platform
        </h1>
        <p className="text-gray-600">
          Enterprise content creation met zero-hallucination
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Artikelen deze maand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {stats?.articlesThisMonth || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Totaal artikelen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {stats?.totalArticles || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {stats?.avgComplianceScore || 0}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Facts Geverifieerd
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">
              {stats?.factsVerified || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-8">
        <Link href="/create">
          <Button size="lg" className="bg-primary hover:bg-primary-dark text-white">
            <PlusIcon className="mr-2 h-5 w-5" />
            Nieuw Artikel
          </Button>
        </Link>
        <Link href="/articles">
          <Button size="lg" variant="outline">
            <FileTextIcon className="mr-2 h-5 w-5" />
            Alle Artikelen
          </Button>
        </Link>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CheckCircle2Icon className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Zero-Hallucination</CardTitle>
            <CardDescription>
              4-laags verificatie systeem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Source verification</li>
              <li>✓ Fact validation</li>
              <li>✓ Content compliance</li>
              <li>✓ Final quality gate</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileTextIcon className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Content Creation</CardTitle>
            <CardDescription>
              B2B geoptimaliseerd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ SEO optimization</li>
              <li>✓ Multi-audience targeting</li>
              <li>✓ Brand compliance</li>
              <li>✓ Complete traceability</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <DatabaseIcon className="h-8 w-8 text-accent mb-2" />
            <CardTitle>Enterprise Ready</CardTitle>
            <CardDescription>
              Production deployment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>✓ Vercel hosting</li>
              <li>✓ Supabase database</li>
              <li>✓ API integration</li>
              <li>✓ Workflow tracking</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
