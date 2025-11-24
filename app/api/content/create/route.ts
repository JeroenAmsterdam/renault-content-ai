import { NextResponse } from 'next/server'
import { createContent } from '@/lib/orchestrator'

export const maxDuration = 180 // 3 minutes timeout

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const { topic, targetAudience, keywords, desiredWordCount } = body

    if (!topic || !targetAudience) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: topic and targetAudience'
        },
        { status: 400 }
      )
    }

    // Run orchestrator
    const result = await createContent({
      topic,
      targetAudience,
      keywords: keywords || [],
      desiredWordCount: desiredWordCount || 700,
      userId: 'web-user' // TODO: Add auth later
    })

    return NextResponse.json(result)

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
