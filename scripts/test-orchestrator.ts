/**
 * Orchestrator Test Script
 *
 * Tests the complete content creation workflow through the orchestrator
 */

// Load environment variables FIRST (before any imports)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the orchestrator
import { createContent } from '../lib/orchestrator'

async function main() {
  console.log('🧪 Testing Orchestrator - Full Content Creation Workflow\n')
  console.log('══════════════════════════════════════════════════\n')

  try {
    const result = await createContent({
      topic: 'Renault Trucks E-Tech voor urban distribution',
      targetAudience: 'fleet-managers',
      keywords: ['urban', 'distributie', 'elektrisch', 'city'],
      desiredWordCount: 700,
      userId: 'test-user',
    })

    if (result.success) {
      console.log('\n🎉 SUCCESS!')
      console.log('══════════════════════════════════════════════════')
      console.log(`Article ID: ${result.articleId}`)
      console.log(`Title: ${result.article?.title}`)
      console.log(`Word count: ${result.article?.wordCount}`)
      console.log(`Compliance score: ${result.compliance?.overallScore}/100`)
      console.log(
        `Total duration: ${(result.workflow.totalDuration / 1000).toFixed(1)}s`
      )

      console.log('\n📊 Workflow Steps:')
      console.log('──────────────────────────────────────────────────')
      result.workflow.steps.forEach((step) => {
        const icon =
          step.status === 'completed'
            ? '✅'
            : step.status === 'failed'
              ? '❌'
              : '⏳'
        console.log(
          `${icon} ${step.name}: ${step.duration ? (step.duration / 1000).toFixed(1) + 's' : 'pending'}`
        )
        if (step.data) {
          console.log(`   ${JSON.stringify(step.data)}`)
        }
      })

      if (result.compliance?.issues && result.compliance.issues.length > 0) {
        console.log('\n⚠️  Compliance Issues:')
        console.log('──────────────────────────────────────────────────')
        result.compliance.issues.forEach((issue) => {
          const icon =
            issue.severity === 'critical'
              ? '🔴'
              : issue.severity === 'warning'
                ? '🟡'
                : '🔵'
          console.log(`${icon} [${issue.severity}] ${issue.description}`)
        })
      }

      if (
        result.compliance?.recommendations &&
        result.compliance.recommendations.length > 0
      ) {
        console.log('\n💡 Recommendations:')
        console.log('──────────────────────────────────────────────────')
        result.compliance.recommendations.forEach((rec) => {
          console.log(`   • ${rec}`)
        })
      }

      console.log('\n✅ Orchestrator test successful!')
      console.log('══════════════════════════════════════════════════\n')
    } else {
      console.log('\n❌ WORKFLOW FAILED')
      console.log('══════════════════════════════════════════════════')
      console.log(`Error: ${result.error}`)
      console.log(`Type: ${result.errorType}`)

      console.log('\n📊 Workflow Steps:')
      console.log('──────────────────────────────────────────────────')
      result.workflow.steps.forEach((step) => {
        const icon =
          step.status === 'completed'
            ? '✅'
            : step.status === 'failed'
              ? '❌'
              : '⏳'
        console.log(`${icon} ${step.name}: ${step.status}`)
        if (step.error) {
          console.log(`   Error: ${step.error}`)
        }
      })

      if (result.errorDetails) {
        console.log('\n📋 Error Details:')
        console.log('──────────────────────────────────────────────────')
        console.log(JSON.stringify(result.errorDetails, null, 2))
      }

      console.log('\n⚠️  This failure is expected if:')
      console.log('   - Insufficient facts were approved (<5)')
      console.log('   - Compliance check found critical issues')
      console.log('   - [PLACEHOLDER] tags remain in content')
      console.log('══════════════════════════════════════════════════\n')
    }
  } catch (error: any) {
    console.error('\n❌ Test failed with exception:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
