import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase/client'
import { createContent } from '@/lib/orchestrator'

// POST /api/articles/:id/rewrite - Create new version of article
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const clientSession = cookieStore.get('client_session')

    if (!clientSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientId = clientSession.value
    const { id } = await params
    const body = await request.json()
    const { versionNotes } = body

    if (!versionNotes || typeof versionNotes !== 'string') {
      return NextResponse.json(
        { success: false, error: 'versionNotes is required' },
        { status: 400 }
      )
    }

    console.log('📝 REWRITE: Creating new version of article:', id)
    console.log('👤 REWRITE: Client ID:', clientId)
    console.log('📋 REWRITE: Version notes:', versionNotes)

    const supabase = getSupabaseAdmin()

    // Step 1: Get current article
    const { data: articles, error: fetchError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('client_id', clientId)

    if (fetchError) {
      console.error('❌ REWRITE: Failed to fetch article:', fetchError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch article' },
        { status: 500 }
      )
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    const currentArticle = articles[0] as any

    // Step 2: Determine parent article ID
    // If current article is v1 (parent_article_id is null), it becomes the parent
    // Otherwise, use the existing parent_article_id
    const parentArticleId = currentArticle.parent_article_id || currentArticle.id
    const newVersion = (currentArticle.version || 1) + 1

    console.log('🔄 REWRITE: Parent article ID:', parentArticleId)
    console.log('🔄 REWRITE: New version:', newVersion)

    // Step 3: Run orchestrator with original params + version notes
    const orchestratorInput = {
      topic: currentArticle.topic,
      targetAudience: currentArticle.target_audience || 'general',
      keywords: currentArticle.metadata?.keywords || [],
      sources: currentArticle.metadata?.sources || [],
      versionNotes, // Add version notes to orchestrator input
      clientId
    }

    console.log('🚀 REWRITE: Running orchestrator with input:', orchestratorInput)

    const result = await createContent(orchestratorInput)

    if (!result.success) {
      console.error('❌ REWRITE: Orchestrator failed:', result.error)
      return NextResponse.json(
        { success: false, error: result.error || 'Orchestrator failed' },
        { status: 500 }
      )
    }

    // Step 4: Update the new article with version info
    const { data: newArticle, error: updateError } = await (supabase
      .from('articles') as any)
      .update({
        version: newVersion,
        parent_article_id: parentArticleId,
        version_notes: versionNotes
      })
      .eq('id', result.articleId)
      .select()
      .single()

    if (updateError) {
      console.error('❌ REWRITE: Failed to update version info:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update version info' },
        { status: 500 }
      )
    }

    console.log('✅ REWRITE: Successfully created version', newVersion, 'with ID:', result.articleId)

    return NextResponse.json({
      success: true,
      articleId: result.articleId,
      version: newVersion,
      parentArticleId
    })

  } catch (error: any) {
    console.error('💥 REWRITE: Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
