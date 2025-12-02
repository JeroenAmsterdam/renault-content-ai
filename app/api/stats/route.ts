import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase/client'

// GET /api/stats - Dashboard statistics for the logged-in client
export async function GET() {
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

    const supabase = getSupabaseAdmin()

    // Count articles by status for this client
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('status, created_at')
      .eq('client_id', clientId)

    if (articlesError) throw articlesError

    // Count facts for this client
    const { count: factsCount, error: factsError } = await supabase
      .from('facts')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', clientId)

    if (factsError) throw factsError

    // Calculate stats
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const articlesThisMonth = (articles as any)?.filter((a: any) =>
      new Date(a.created_at) >= thisMonth
    ).length || 0

    const approvedArticles = (articles as any)?.filter((a: any) =>
      a.status === 'approved'
    ).length || 0

    return NextResponse.json({
      success: true,
      stats: {
        articlesThisMonth,
        totalArticles: articles?.length || 0,
        approvedArticles,
        factsVerified: factsCount || 0,
        avgComplianceScore: 94 // TODO: Calculate from actual data
      }
    })

  } catch (error: any) {
    console.error('Stats Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
