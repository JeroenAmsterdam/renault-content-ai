import Link from 'next/link'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PlusIcon, FileTextIcon, ChevronLeft } from 'lucide-react'
import { PageWrapper } from '@/components/page-wrapper'
import { supabase } from '@/lib/supabase/client'

async function getArticles() {
  try {
    const cookieStore = await cookies()
    const clientSession = cookieStore.get('client_session')

    if (!clientSession) {
      console.error('No client session found')
      return []
    }

    const clientId = clientSession.value

    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Supabase error:', error)
      return []
    }

    return articles || []
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
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            Alle Artikelen
          </h1>
          <p className="text-white/90 drop-shadow-md text-lg">
            {articles.length} artikel{articles.length !== 1 ? 'en' : ''} gevonden
          </p>
        </div>

        {articles.length === 0 ? (
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="py-12 text-center">
            <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Geen artikelen gevonden</h3>
            <p className="text-gray-600 mb-4">
              Maak je eerste artikel om te beginnen
            </p>
            <Link href="/create">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold shadow-lg">
                <PlusIcon className="mr-2 h-5 w-5" />
                Nieuw Artikel Maken
              </Button>
            </Link>
          </CardContent>
        </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <Link key={article.id} href={`/articles/${article.id}`}>
                <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-shadow duration-300 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="line-clamp-2 mb-4">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📊 {article.word_count} woorden</p>
                    <p>📅 {new Date(article.created_at).toLocaleDateString('nl-NL')}</p>
                    <p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        article.status === 'approved' ? 'bg-green-100 text-green-800' :
                        article.status === 'needs_review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {article.status}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
