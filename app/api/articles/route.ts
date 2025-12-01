import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase/client'

// GET /api/articles - List all articles for the logged-in client
export async function GET(request: Request) {
  console.log('\n🔍 === ARTICLES API DEBUG ===')
  console.log('Timestamp:', new Date().toISOString())

  try {
    // DEBUG: Check cookies
    console.log('\n1️⃣ CHECKING COOKIES:')
    const cookieStore = await cookies()
    const clientSession = cookieStore.get('client_session')
    console.log('- client_session cookie exists:', !!clientSession)
    console.log('- client_session value:', clientSession?.value || 'NOT FOUND')

    if (!clientSession) {
      console.log('❌ No client session found - returning 401')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const clientId = clientSession.value
    console.log('✅ Client ID from session:', clientId)

    // DEBUG: Check query parameters
    console.log('\n2️⃣ CHECKING QUERY PARAMETERS:')
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '10')
    console.log('- Status filter:', status || 'none')
    console.log('- Limit:', limit)

    // DEBUG: Build query
    console.log('\n3️⃣ BUILDING SUPABASE QUERY:')
    console.log('- Querying table: articles')
    console.log('- Filter: client_id =', clientId)
    console.log('- Order: created_at DESC')
    console.log('- Limit:', limit)

    const supabaseAdmin = getSupabaseAdmin()
    let query = supabaseAdmin
      .from('articles')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      console.log('- Additional filter: status =', status)
      query = query.eq('status', status)
    }

    // DEBUG: Execute query
    console.log('\n4️⃣ EXECUTING QUERY...')
    const { data, error } = await query

    if (error) {
      console.error('❌ SUPABASE ERROR:')
      console.error('- Message:', error.message)
      console.error('- Details:', error.details)
      console.error('- Hint:', error.hint)
      console.error('- Code:', error.code)
      throw error
    }

    // DEBUG: Check results
    console.log('\n5️⃣ QUERY RESULTS:')
    console.log('- Articles found:', data?.length || 0)
    if (data && data.length > 0) {
      const articles = data as any[]
      console.log('- First article ID:', articles[0].id)
      console.log('- First article client_id:', articles[0].client_id)
      console.log('- First article title:', articles[0].title)
      console.log('- All article IDs:', articles.map((a: any) => a.id).join(', '))
    } else {
      console.log('⚠️ NO ARTICLES FOUND!')
      console.log('⚠️ This could mean:')
      console.log('  1. No articles exist for client_id:', clientId)
      console.log('  2. Articles exist but have NULL client_id')
      console.log('  3. Articles exist but have different client_id')
    }

    console.log('\n✅ Returning response with', data?.length || 0, 'articles')
    console.log('=== END ARTICLES API DEBUG ===\n')

    return NextResponse.json({
      success: true,
      articles: data || []
    })

  } catch (error: any) {
    console.error('\n❌ API ERROR:')
    console.error('- Error name:', error.name)
    console.error('- Error message:', error.message)
    console.error('- Error stack:', error.stack)
    console.error('=== END ARTICLES API DEBUG ===\n')

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
