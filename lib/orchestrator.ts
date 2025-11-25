/**
 * Content Creation Orchestrator
 *
 * Coordinates the complete content creation workflow:
 * Research → Validate → Write → Compliance → Storage
 *
 * Responsibilities:
 * - Workflow management and progress tracking
 * - Error handling for all scenarios
 * - Database integration
 * - Comprehensive logging
 * - Production-ready reliability
 */

import { runResearchAgent } from '@/agents/research-agent'
import {
  runFactValidator,
  InsufficientFactsError,
} from '@/agents/fact-validator'
import { runContentWriter } from '@/agents/content-writer'
import {
  runComplianceChecker,
  ComplianceError,
} from '@/agents/compliance-checker'
import { getSupabaseAdmin } from '@/lib/supabase/client'
import type { Article, ComplianceResult } from '@/types/agent-types'

export interface ContentRequest {
  topic: string
  targetAudience: string
  keywords?: string[]
  desiredWordCount?: number
  userId?: string
  sources?: string[]
  briefing?: string
  clientId?: string  // Add client_id for multi-tenant support
}

export interface WorkflowStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: number
  endTime?: number
  duration?: number
  data?: any
  error?: string
}

export interface ContentResult {
  success: boolean
  articleId?: string
  article?: Article & { id?: string }
  compliance?: ComplianceResult
  qualityWarnings?: string[]
  error?: string
  errorType?: string
  errorDetails?: any
  workflow: {
    steps: WorkflowStep[]
    totalDuration: number
    completedAt: string
  }
}

/**
 * Workflow Logger - tracks progress through pipeline
 */
class WorkflowLogger {
  private steps: WorkflowStep[] = []
  private startTime: number

  constructor() {
    this.startTime = Date.now()
  }

  startStep(name: string) {
    const step: WorkflowStep = {
      name,
      status: 'running',
      startTime: Date.now(),
    }
    this.steps.push(step)
    console.log(`\n▶️  ${name}...`)
  }

  completeStep(name: string, data?: any) {
    const step = this.steps.find((s) => s.name === name)
    if (step) {
      step.status = 'completed'
      step.endTime = Date.now()
      step.duration = step.endTime - (step.startTime || 0)
      step.data = data
      console.log(`✅ ${name} completed (${step.duration}ms)`)
    }
  }

  failStep(name: string, error: string) {
    const step = this.steps.find((s) => s.name === name)
    if (step) {
      step.status = 'failed'
      step.endTime = Date.now()
      step.duration = step.endTime - (step.startTime || 0)
      step.error = error
      console.log(`❌ ${name} failed: ${error}`)
    }
  }

  getWorkflow() {
    return {
      steps: this.steps,
      totalDuration: Date.now() - this.startTime,
      completedAt: new Date().toISOString(),
    }
  }
}

/**
 * Retry helper for handling rate limits
 *
 * @param fn - Function to execute with retry logic
 * @param maxRetries - Maximum number of retries (default: 2)
 * @returns Promise with the result of the function
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRateLimit =
        error.message?.includes('rate_limit') ||
        error.message?.includes('429') ||
        error.status === 429

      if (isRateLimit && i < maxRetries - 1) {
        console.log(`⏱️  Rate limit hit, waiting 60 seconds... (attempt ${i + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 60000))
        continue
      }
      throw error
    }
  }
  throw new Error('Max retries exceeded')
}

/**
 * Create Content - Main orchestrator function
 *
 * Runs complete workflow with error handling and progress tracking
 */
export async function createContent(
  request: ContentRequest
): Promise<ContentResult> {
  const logger = new WorkflowLogger()

  console.log('\n🚀 Starting content creation workflow...')
  console.log(`Topic: ${request.topic}`)
  console.log(`Audience: ${request.targetAudience}`)

  const qualityWarnings: string[] = []

  try {
    // STEP 1: Research (30-60s)
    logger.startStep('Research')
    const research = await withRetry(() =>
      runResearchAgent(
        request.topic,
        request.keywords || [],
        request.sources || []
      )
    )
    logger.completeStep('Research', {
      factsFound: research.facts.length,
      duration: research.duration,
    })

    // STEP 2: Validation (15-30s)
    logger.startStep('Validation')
    const validation = await runFactValidator(research.facts)
    logger.completeStep('Validation', {
      approved: validation.approved.length,
      rejected: validation.rejected.length,
      approvalRate: validation.approvalRate,
    })

    // CHECK: Minimum 5 approved facts (warning, not blocking)
    if (validation.approved.length < 5) {
      qualityWarnings.push(
        `⚠️ Only ${validation.approved.length} verified facts found. Article may lack depth.`
      )
      console.warn(`⚠️  Low fact count: ${validation.approved.length} facts`)
    }

    if (validation.approvalRate < 0.6) {
      qualityWarnings.push(
        `⚠️ Low fact approval rate (${Math.round(validation.approvalRate * 100)}%). Many sources were rejected.`
      )
      console.warn(`⚠️  Low approval rate: ${Math.round(validation.approvalRate * 100)}%`)
    }

    // STEP 3: Content Writing (45-90s)
    logger.startStep('Writing')
    const article = await runContentWriter({
      approvedFacts: validation.approved,
      topic: request.topic,
      targetAudience: request.targetAudience,
      keywords: request.keywords,
      desiredWordCount: request.desiredWordCount,
      briefing: request.briefing,
    })
    logger.completeStep('Writing', {
      wordCount: article.wordCount,
      factsUsed: article.factsUsed.length,
    })

    // STEP 4: Compliance Check (20-40s)
    logger.startStep('Compliance')
    const compliance = await runComplianceChecker(article, validation.approved)
    logger.completeStep('Compliance', {
      approved: compliance.approved,
      score: compliance.overallScore,
    })

    // CHECK: Compliance (warning, not blocking)
    if (!compliance.approved) {
      qualityWarnings.push(
        `⚠️ Compliance check failed (score: ${compliance.overallScore}/100)`
      )

      const criticalIssues = compliance.issues.filter((i) => i.severity === 'critical')
      if (criticalIssues.length > 0) {
        qualityWarnings.push(
          `Critical issues: ${criticalIssues.map((i) => i.description).join(', ')}`
        )
      }

      console.warn(`⚠️  Compliance issues: ${criticalIssues.length} critical`)
    }

    // STEP 5: Save to Database
    logger.startStep('Storage')
    const saved = await saveArticle({
      article,
      compliance,
      facts: validation.approved,
      userId: request.userId,
      request,
      qualityWarnings,
    })
    logger.completeStep('Storage', {
      articleId: saved.id,
    })

    // SUCCESS
    console.log('\n✅ Content creation completed successfully!')
    console.log(`Article ID: ${saved.id}`)
    if (qualityWarnings.length > 0) {
      console.log(`⚠️  ${qualityWarnings.length} quality warnings`)
    }
    console.log(`Total time: ${(logger.getWorkflow().totalDuration / 1000).toFixed(1)}s`)

    return {
      success: true,
      articleId: saved.id,
      article: {
        ...article,
        id: saved.id,
      },
      compliance,
      qualityWarnings,
      workflow: logger.getWorkflow(),
    }
  } catch (error: any) {
    console.error('\n❌ Content creation failed:', error.message)

    // Specific error handling
    if (error instanceof InsufficientFactsError) {
      return {
        success: false,
        error: 'Insufficient verified facts',
        errorType: 'insufficient_facts',
        errorDetails: {
          approved: error.rejectedFacts.length,
          message:
            'Not enough high-quality facts were found to create reliable content',
          rejected: error.rejectedFacts.map((f) => ({
            claim: f.claim,
            reason: f.rejectionReason,
          })),
        },
        workflow: logger.getWorkflow(),
      }
    }

    if (error instanceof ComplianceError) {
      return {
        success: false,
        error: 'Compliance check failed',
        errorType: 'compliance_failed',
        errorDetails: {
          message: 'Article contains critical issues that block publication',
          issues: error.criticalIssues,
        },
        workflow: logger.getWorkflow(),
      }
    }

    // Generic error
    return {
      success: false,
      error: error.message,
      errorType: 'unknown',
      errorDetails: {
        name: error.name,
        stack: error.stack,
      },
      workflow: logger.getWorkflow(),
    }
  }
}

/**
 * Save article to database
 */
async function saveArticle(data: any) {
  console.log('🔍 === SAVE ARTICLE DEBUG ===')
  console.log('Environment check:')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
  console.log('- SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  console.log('\n📦 Data to insert:')
  const insertData = {
    title: data.article.title,
    content: data.article.content,
    topic: data.request.topic,
    target_audience: data.request.targetAudience,
    status: 'draft', // Use 'draft' to match database constraint
    word_count: data.article.wordCount,
    created_by: data.userId || 'system',
    client_id: data.request.clientId, // Add client_id for multi-tenant support
    metadata: {
      keywords: data.article.keywords,
      factsUsed: data.article.factsUsed,
      compliance: {
        score: data.compliance.overallScore,
        checks: data.compliance.checks,
      },
      metaDescription: data.article.metaDescription,
      internalLinkSuggestions: data.article.internalLinkSuggestions,
      qualityWarnings: data.qualityWarnings || [],
    },
  }

  console.log('Insert data:', JSON.stringify(insertData, null, 2))

  try {
    console.log('\n💾 Attempting Supabase insert...')
    const supabaseAdmin = getSupabaseAdmin()

    const { data: article, error } = await (supabaseAdmin
      .from('articles') as any)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('❌ SUPABASE ERROR:')
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Hint:', error.hint)
      console.error('Code:', error.code)
      console.error('Full error:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('✅ SUCCESS! Article saved:', article.id)
    console.log('Article data:', JSON.stringify(article, null, 2))
    return article

  } catch (error: any) {
    console.error('💥 EXCEPTION in saveArticle:')
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)

    // Still throw to see full error in response
    throw error
  }
}
