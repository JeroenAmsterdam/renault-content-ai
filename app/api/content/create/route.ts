import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createContent } from '@/lib/orchestrator'

export const maxDuration = 180 // 3 minutes timeout

export async function POST(request: Request) {
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
    const body = await request.json()

    // Validate input
    const { topic, targetAudience, keywords, desiredWordCount, sources, briefing } = body

    if (!topic || !targetAudience) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: topic and targetAudience'
        },
        { status: 400 }
      )
    }

    console.log('🎯 Creating article for client:', clientId)

    // Run orchestrator with client_id
    const result = await createContent({
      topic,
      targetAudience,
      keywords: keywords || [],
      desiredWordCount: desiredWordCount || 700,
      sources: sources || [],
      briefing: briefing || undefined,
      userId: 'web-user', // TODO: Add user-level auth later
      clientId // Add client_id from session
    })

    console.log('✅ Article created:', result.articleId)

    // Return article ID at top level AND in article object for redundancy
    return NextResponse.json({
      success: result.success,
      articleId: result.articleId,  // Explicit ID at top level
      article: result.article,
      compliance: result.compliance,
      qualityWarnings: result.qualityWarnings,
      workflow: result.workflow
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    )
  }
}
