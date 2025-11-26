import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase/client'

/**
 * DEBUG ENDPOINT - Check articles database state
 *
 * This endpoint helps diagnose why articles aren't showing:
 * - Lists ALL articles in the database (admin query)
 * - Shows client_id for each article (including NULL)
 * - Compares with current session client_id
 * - Provides SQL fix for orphaned articles
 */
export async function GET(request: Request) {
  console.log('\n🔍 === ARTICLES DEBUG ENDPOINT ===')
  console.log('Timestamp:', new Date().toISOString())

  try {
    // Get current session
    const cookieStore = await cookies()
    const clientSession = cookieStore.get('client_session')
    const currentClientId = clientSession?.value || 'NO_SESSION'

    console.log('\n1️⃣ CURRENT SESSION:')
    console.log('- Has session cookie:', !!clientSession)
    console.log('- Client ID:', currentClientId)

    // Get admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin()

    // Query ALL articles (no client_id filter)
    console.log('\n2️⃣ QUERYING ALL ARTICLES (ADMIN):')
    const { data: allArticles, error: allError } = await supabaseAdmin
      .from('articles')
      .select('id, title, client_id, created_at, status')
      .order('created_at', { ascending: false })

    if (allError) {
      console.error('❌ Error querying all articles:', allError)
      throw allError
    }

    console.log('- Total articles in database:', allArticles?.length || 0)

    // Categorize articles
    const articles = (allArticles || []) as any[]
    const articlesWithClientId = articles.filter(a => a.client_id !== null)
    const articlesWithoutClientId = articles.filter(a => a.client_id === null)
    const articlesForCurrentClient = articles.filter(a => a.client_id === currentClientId)

    console.log('\n3️⃣ ARTICLES BREAKDOWN:')
    console.log('- Articles with client_id:', articlesWithClientId.length)
    console.log('- Articles WITHOUT client_id (NULL):', articlesWithoutClientId.length)
    console.log('- Articles for current client:', articlesForCurrentClient.length)

    // Get all unique client IDs
    const uniqueClientIds = [...new Set(articlesWithClientId.map(a => a.client_id))]
    console.log('- Unique client IDs in database:', uniqueClientIds)

    // Get all clients
    console.log('\n4️⃣ QUERYING ALL CLIENTS:')
    const { data: clientsData, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name')

    const clients = (clientsData || []) as any[]

    if (clientsError) {
      console.error('❌ Error querying clients:', clientsError)
    } else {
      console.log('- Total clients:', clients.length)
      clients.forEach((c: any) => {
        console.log(`  - ${c.name} (${c.id})`)
      })
    }

    // Build diagnostic report
    const diagnosticReport = {
      currentSession: {
        hasSession: !!clientSession,
        clientId: currentClientId,
      },
      database: {
        totalArticles: articles.length,
        articlesWithClientId: articlesWithClientId.length,
        articlesWithoutClientId: articlesWithoutClientId.length,
        articlesForCurrentClient: articlesForCurrentClient.length,
        uniqueClientIds,
      },
      clients,
      orphanedArticles: articlesWithoutClientId.map((a: any) => ({
        id: a.id,
        title: a.title,
        created_at: a.created_at,
        status: a.status,
      })),
      allArticlesDetailed: articles.map((a: any) => ({
        id: a.id,
        title: a.title,
        client_id: a.client_id || 'NULL',
        created_at: a.created_at,
        status: a.status,
        belongsToCurrentClient: a.client_id === currentClientId,
      })),
    }

    // Generate SQL fix if there are orphaned articles
    let sqlFix = null
    if (articlesWithoutClientId.length > 0 && clients && clients.length > 0) {
      const firstClient = clients[0]
      sqlFix = {
        problem: `Found ${articlesWithoutClientId.length} articles with NULL client_id`,
        solution: `Assign them to a client`,
        sql: `UPDATE articles SET client_id = '${firstClient.id}' WHERE client_id IS NULL;`,
        warning: 'This will assign all orphaned articles to: ' + firstClient.name,
      }
      console.log('\n⚠️ ORPHANED ARTICLES DETECTED!')
      console.log('SQL Fix:', sqlFix.sql)
    }

    console.log('\n✅ Debug report generated')
    console.log('=== END DEBUG ===\n')

    return NextResponse.json({
      success: true,
      diagnostic: diagnosticReport,
      sqlFix,
      timestamp: new Date().toISOString(),
    })

  } catch (error: any) {
    console.error('\n❌ DEBUG ENDPOINT ERROR:')
    console.error('- Error:', error.message)
    console.error('=== END DEBUG ===\n')

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    )
  }
}
