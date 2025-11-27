export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeft, DownloadIcon, CopyIcon, CheckCircle2Icon } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { PageWrapper } from '@/components/page-wrapper'
import { supabase } from '@/lib/supabase/client'

async function getArticle(id: string) {
  try {
    const cookieStore = await cookies()
    const clientSession = cookieStore.get('client_session')

    if (!clientSession) {
      console.error('No client session found')
      return null
    }

    const clientId = clientSession.value

    console.log('📄 Fetching article:', id)
    console.log('👤 Client ID:', clientId)

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('client_id', clientId)
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      return null
    }

    if (!article) {
      console.error('❌ Article not found')
      return null
    }

    // Type assertion needed because Supabase types are not properly inferred
    const typedArticle = article as any
    console.log('✅ Article loaded successfully:', typedArticle.title)
    return typedArticle

  } catch (error) {
    console.error('💥 Failed to fetch article:', error)
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
  const factsUsed = metadata.factsUsed || []
  const compliance = metadata.compliance || {}

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Link href="/articles">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 text-white hover:text-white hover:bg-white/10">
            <ChevronLeft className="w-4 h-4" />
            Terug naar artikelen
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
            {article.title}
          </h1>
          <div className="flex items-center gap-4 text-white/90 drop-shadow-md flex-wrap">
            <span>📅 {new Date(article.created_at).toLocaleDateString('nl-NL')}</span>
            <span>📊 {article.word_count} woorden</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              article.status === 'approved' ? 'bg-green-500/90 text-white' :
              article.status === 'needs_review' ? 'bg-yellow-500/90 text-white' :
              'bg-gray-500/90 text-white'
            }`}>
              {article.status}
            </span>
          </div>
        </div>

        {/* Quality Warnings */}
        {metadata.qualityWarnings && metadata.qualityWarnings.length > 0 && (
          <Card className="bg-yellow-50/95 backdrop-blur-sm border-yellow-300 border-2 mb-6 shadow-xl">
            <CardHeader>
              <CardTitle className="text-yellow-800 flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
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
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <Tabs defaultValue="article" className="w-full">
            <CardHeader>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="article">Artikel</TabsTrigger>
                <TabsTrigger value="facts">Facts ({factsUsed.length})</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Article Content */}
              <TabsContent value="article" className="prose prose-lg max-w-none mt-0">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </TabsContent>

              {/* Facts Used */}
              <TabsContent value="facts" className="mt-0">
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
              </TabsContent>

              {/* Compliance Report */}
              <TabsContent value="compliance" className="mt-0">
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
              </TabsContent>

              {/* Metadata */}
              <TabsContent value="metadata" className="mt-0">
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
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </PageWrapper>
  )
}
