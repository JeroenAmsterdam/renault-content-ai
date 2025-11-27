import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createContent } from '@/lib/orchestrator'

export const maxDuration = 180 // 3 minutes timeout

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const clientSession = cookieStore.get('client_session')

    if (!clientSession) {
      return NextResponse.json({
        success: false,
        error: 'Not logged in - no session cookie found'
      }, { status: 401 })
    }

    const clientId = clientSession.value
    console.log('🎯 API: Creating article for client:', clientId)

    const body = await request.json()
    console.log('📦 API: Request body:', {
      topic: body.topic,
      targetAudience: body.targetAudience,
      hasKeywords: !!body.keywords,
      hasSources: !!body.sources,
      hasBriefing: !!body.briefing
    })

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

    // Run orchestrator with client_id
    const result = await createContent({
      topic,
      targetAudience,
      keywords: keywords || [],
      desiredWordCount: desiredWordCount || 700,
      sources: sources || [],
      briefing: briefing || undefined,
      userId: clientId,
      clientId: clientId
    })

    console.log('✅ API: Article created:', result.article?.id)

    return NextResponse.json({
      success: true,
      articleId: result.article?.id,
      article: result.article,
      compliance: result.compliance,
      qualityWarnings: result.qualityWarnings,
      workflow: result.workflow
    })

  } catch (error: any) {
    // CRITICAL: Log full error details
    console.error('💥 API ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error during article creation'
      },
      { status: 500 }
    )
  }
}
