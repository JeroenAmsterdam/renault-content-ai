import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeftIcon, DownloadIcon, CopyIcon, CheckCircle2Icon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

async function getArticle(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://renault-content-ai.vercel.app'
    const url = `${baseUrl}/api/articles/${id}`

    console.log('Fetching article from:', url)

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    console.log('API response:', data)

    if (!data.success) {
      console.error('API returned error:', data.error)
      return null
    }

    console.log('Article loaded successfully:', data.article.id)
    return data.article

  } catch (error) {
    console.error('Failed to fetch article:', error)
    return null
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

export default async function ArticlePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  const metadata = article.metadata || {}
  const compliance = metadata.compliance || {}
  const factsUsed = metadata.factsUsed || []

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/articles">
          <Button variant="ghost" className="mb-4">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Terug naar overzicht
          </Button>
        </Link>

        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-secondary mb-3">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Badge className={getStatusColor(article.status)}>
                {article.status}
              </Badge>
              <span>{article.word_count} woorden</span>
              <span>•</span>
              <span>{article.target_audience}</span>
              <span>•</span>
              <span>{new Date(article.created_at).toLocaleDateString('nl-NL')}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <CopyIcon className="mr-2 h-4 w-4" />
              Kopiëren
            </Button>
            <Button variant="outline" size="sm">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        {/* Meta description */}
        {metadata.metaDescription && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm text-gray-700">
                <strong>Meta Description:</strong> {metadata.metaDescription}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quality Warnings */}
        {metadata.qualityWarnings && metadata.qualityWarnings.length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200 mt-4">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                Quality Warnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {metadata.qualityWarnings.map((warning: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-900">
                    {warning}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-yellow-800 mt-4">
                💡 Review these issues before publishing. You may want to regenerate with additional sources.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="article" className="space-y-6">
        <TabsList>
          <TabsTrigger value="article">Artikel</TabsTrigger>
          <TabsTrigger value="facts">
            Facts ({factsUsed.length})
          </TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
        </TabsList>

        {/* Article Content */}
        <TabsContent value="article">
          <Card>
            <CardContent className="pt-6">
              <article className="prose prose-lg max-w-none">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </article>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facts Used */}
        <TabsContent value="facts">
          <Card>
            <CardHeader>
              <CardTitle>Facts Gebruikt in Artikel</CardTitle>
            </CardHeader>
            <CardContent>
              {factsUsed.length === 0 ? (
                <p className="text-gray-600">Geen facts data beschikbaar</p>
              ) : (
                <div className="space-y-4">
                  {factsUsed.map((fact: string, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2Icon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{fact}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Report */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Report</CardTitle>
            </CardHeader>
            <CardContent>
              {compliance.score ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {compliance.score}/100
                    </div>
                    <p className="text-gray-600">Overall Compliance Score</p>
                  </div>

                  {/* Individual Checks */}
                  {compliance.checks && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg mb-3">Check Details:</h3>
                      {Object.entries(compliance.checks).map(([key, check]: [string, any]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            {check.passed ? (
                              <CheckCircle2Icon className="h-5 w-5 text-green-600" />
                            ) : (
                              <span className="h-5 w-5 text-red-600">✗</span>
                            )}
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                          </div>
                          <Badge variant={check.passed ? 'default' : 'destructive'}>
                            {check.score}/100
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">Geen compliance data beschikbaar</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metadata */}
        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Article Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <dt className="font-medium text-gray-600">Topic:</dt>
                  <dd className="text-gray-900">{article.topic}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="font-medium text-gray-600">Target Audience:</dt>
                  <dd className="text-gray-900">{article.target_audience}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="font-medium text-gray-600">Word Count:</dt>
                  <dd className="text-gray-900">{article.word_count}</dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="font-medium text-gray-600">Status:</dt>
                  <dd>
                    <Badge className={getStatusColor(article.status)}>
                      {article.status}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <dt className="font-medium text-gray-600">Created:</dt>
                  <dd className="text-gray-900">
                    {new Date(article.created_at).toLocaleString('nl-NL')}
                  </dd>
                </div>
                {article.updated_at && (
                  <div className="flex justify-between py-2 border-b">
                    <dt className="font-medium text-gray-600">Updated:</dt>
                    <dd className="text-gray-900">
                      {new Date(article.updated_at).toLocaleString('nl-NL')}
                    </dd>
                  </div>
                )}
                {metadata.keywords && metadata.keywords.length > 0 && (
                  <div className="py-2">
                    <dt className="font-medium text-gray-600 mb-2">Keywords:</dt>
                    <dd className="flex flex-wrap gap-2">
                      {metadata.keywords.map((keyword: string) => (
                        <Badge key={keyword} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
