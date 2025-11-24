import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, FileTextIcon } from 'lucide-react'

async function getArticles() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/articles?limit=20`, {
      cache: 'no-store'
    })
    const data = await response.json()
    return data.articles || []
  } catch (error) {
    console.error('Failed to fetch articles:', error)
    return []
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800'
    case 'needs_review': return 'bg-yellow-100 text-yellow-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'compliance_check': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-secondary mb-2">
            Alle Artikelen
          </h1>
          <p className="text-gray-600">
            {articles.length} artikel{articles.length !== 1 ? 'en' : ''} gevonden
          </p>
        </div>
        <Link href="/create">
          <Button className="bg-primary hover:bg-primary-dark text-white">
            <PlusIcon className="mr-2 h-5 w-5" />
            Nieuw Artikel
          </Button>
        </Link>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen artikelen gevonden</h3>
            <p className="text-gray-600 mb-4">
              Maak je eerste artikel om te beginnen
            </p>
            <Link href="/create">
              <Button className="bg-primary hover:bg-primary-dark text-white">
                Nieuw Artikel Maken
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {articles.map((article: any) => (
            <Link key={article.id} href={`/articles/${article.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {article.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span>{article.word_count} woorden</span>
                        <span>•</span>
                        <span>{article.target_audience}</span>
                        <span>•</span>
                        <span>{new Date(article.created_at).toLocaleDateString('nl-NL')}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(article.status)}>
                      {article.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
