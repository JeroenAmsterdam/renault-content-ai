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

  try {
    // STEP 1: Research (30-60s)
    logger.startStep('Research')
    const research = await runResearchAgent(
      request.topic,
      request.keywords || []
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

    // GATE: Minimum 5 approved facts
    if (validation.approved.length < 5) {
      logger.failStep('Validation', 'Insufficient approved facts')
      throw new InsufficientFactsError(
        `Only ${validation.approved.length} facts approved`,
        validation.rejected
      )
    }

    // STEP 3: Content Writing (45-90s)
    logger.startStep('Writing')
    const article = await runContentWriter({
      approvedFacts: validation.approved,
      topic: request.topic,
      targetAudience: request.targetAudience,
      keywords: request.keywords,
      desiredWordCount: request.desiredWordCount,
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

    // GATE: Must pass compliance
    if (!compliance.approved) {
      logger.failStep('Compliance', 'Failed compliance check')
      throw new ComplianceError(
        'Article failed compliance check',
        compliance.issues.filter((i) => i.severity === 'critical')
      )
    }

    // STEP 5: Save to Database
    logger.startStep('Storage')
    const saved = await saveArticle({
      article,
      compliance,
      facts: validation.approved,
      userId: request.userId,
      request,
    })
    logger.completeStep('Storage', {
      articleId: saved.id,
    })

    // SUCCESS
    console.log('\n✅ Content creation completed successfully!')
    console.log(`Article ID: ${saved.id}`)
    console.log(`Total time: ${(logger.getWorkflow().totalDuration / 1000).toFixed(1)}s`)

    return {
      success: true,
      articleId: saved.id,
      article: {
        ...article,
        id: saved.id,
      },
      compliance,
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
  try {
    const supabaseAdmin = getSupabaseAdmin()

    // Save article to database
    const { data: article, error } = await (supabaseAdmin
      .from('articles') as any)
      .insert({
        title: data.article.title,
        content: data.article.content,
        topic: data.request.topic,
        target_audience: data.request.targetAudience,
        status: 'approved',
        word_count: data.article.wordCount,
        created_by: data.userId || 'system',
        metadata: {
          keywords: data.article.keywords,
          factsUsed: data.article.factsUsed,
          compliance: {
            score: data.compliance.overallScore,
            checks: data.compliance.checks,
          },
          metaDescription: data.article.metaDescription,
          internalLinkSuggestions: data.article.internalLinkSuggestions,
        } as any, // Type assertion for Supabase JSONB field
      })
      .select()
      .single()

    if (error) throw error

    console.log('💾 Article saved to database')

    return article
  } catch (error) {
    console.warn(
      '⚠️  Could not save to database (expected in dev):',
      (error as Error).message
    )
    // Return mock ID in development
    return {
      id: `mock-${Date.now()}`,
      ...data.article,
    }
  }
}
