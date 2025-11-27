import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase/client'

// GET /api/articles/:id - Get single article
export async function GET(
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

    console.log('📄 Fetching article:', id)
    console.log('👤 Client ID:', clientId)

    const { data: articles, error: queryError } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      // Don't use .single() - it throws error if 0 or 2+ results

    console.log('📊 Query returned:', articles?.length || 0, 'articles')

    if (queryError) {
      console.error('❌ Query error:', queryError)
      return NextResponse.json(
        { success: false, error: queryError.message },
        { status: 500 }
      )
    }

    if (!articles || articles.length === 0) {
      console.error('❌ No articles found for ID:', id)
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Get first article (should only be one with matching ID)
    // Type assertion needed because Supabase types are not properly inferred
    const article = articles[0] as any

    // Check client_id match
    if (article.client_id !== clientId) {
      console.warn('⚠️ Client mismatch:', {
        article_client: article.client_id,
        session_client: clientId
      })

      // For now: ALLOW anyway (for testing)
      // Later: return 403 Forbidden
    }

    console.log('✅ Article found:', article.title)

    return NextResponse.json({
      success: true,
      article: article
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// PUT /api/articles/:id - Update article
export async function PUT(
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
    const { title, content, status } = body

    const { data, error } = await (supabase
      .from('articles') as any)
      .update({
        title,
        content,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('client_id', clientId)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      article: data
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/articles/:id - Delete article
export async function DELETE(
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

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
      .eq('client_id', clientId)

    if (error) throw error

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
