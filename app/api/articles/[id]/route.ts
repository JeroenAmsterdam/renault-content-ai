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

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('client_id', clientId)
      .single()

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }

    if (!article) {
      console.error('❌ Article not found - no data returned')
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      )
    }

    // Type assertion needed because Supabase types are not properly inferred
    const typedArticle = article as any
    console.log('✅ Article found:', typedArticle.title)

    return NextResponse.json({
      success: true,
      article: typedArticle
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
