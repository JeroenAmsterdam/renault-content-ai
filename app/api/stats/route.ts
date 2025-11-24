import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

// GET /api/stats - Dashboard statistics
export async function GET() {
  try {
    // Count articles by status
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('status, created_at')

    if (articlesError) throw articlesError

    // Count facts
    const { count: factsCount, error: factsError } = await supabase
      .from('facts')
      .select('*', { count: 'exact', head: true })

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
