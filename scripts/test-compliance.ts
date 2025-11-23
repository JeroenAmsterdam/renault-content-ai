/**
 * Full Pipeline Test with Compliance Check
 *
 * Tests all 4 agents in sequence:
 * 1. Research Agent - gathers facts
 * 2. Validator Agent - validates facts
 * 3. Writer Agent - creates article
 * 4. Compliance Checker - final quality gate
 */

// Load environment variables FIRST (before any imports)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the agents
import { runResearchAgent } from '../agents/research-agent'
import { runFactValidator } from '../agents/fact-validator'
import { runContentWriter } from '../agents/content-writer'
import { runComplianceChecker } from '../agents/compliance-checker'

async function main() {
  console.log('🧪 Testing Full Pipeline with Compliance...\n')
  console.log('══════════════════════════════════════════════════\n')

  const startTime = Date.now()

  try {
    // Step 1: Research
    console.log('Step 1: Research Agent')
    console.log('──────────────────────────────────────────────────')
    const research = await runResearchAgent(
      'Renault Trucks E-Tech duurzaamheid',
      ['duurzaam', 'CO2', 'elektrisch', 'milieu']
    )
    console.log(`✅ ${research.facts.length} facts found\n`)

    // Step 2: Validation
    console.log('Step 2: Validator Agent')
    console.log('──────────────────────────────────────────────────')
    const validation = await runFactValidator(research.facts)
    console.log(
      `✅ ${validation.approved.length} facts approved (${validation.approvalRate.toFixed(0)}% approval rate)\n`
    )

    // Step 3: Writing
    console.log('Step 3: Content Writer Agent')
    console.log('──────────────────────────────────────────────────')
    const article = await runContentWriter({
      approvedFacts: validation.approved,
      topic: 'Duurzaamheid en CO2-reductie met Renault Trucks E-Tech',
      targetAudience: 'sustainability-officers',
      keywords: ['duurzaam', 'CO2', 'elektrisch', 'ESG'],
      desiredWordCount: 700,
    })
    console.log(`✅ Article written (${article.wordCount} words)\n`)

    // Step 4: Compliance Check
    console.log('Step 4: Compliance Checker Agent')
    console.log('──────────────────────────────────────────────────')
    const compliance = await runComplianceChecker(article, validation.approved)

    const duration = Date.now() - startTime

    // Results
    console.log('\n🎯 FULL PIPELINE RESULTS:')
    console.log('══════════════════════════════════════════════════')
    console.log(`Article: ${article.title}`)
    console.log(`Word count: ${article.wordCount}`)
    console.log(`Facts used: ${article.factsUsed.length}`)
    console.log(`Total duration: ${(duration / 1000).toFixed(1)}s`)
    console.log(
      `\n✅ COMPLIANCE: ${compliance.approved ? '✅ APPROVED' : '❌ REJECTED'}`
    )
    console.log(`Overall score: ${compliance.overallScore}/100`)

    console.log('\n📊 CHECK SCORES:')
    console.log('──────────────────────────────────────────────────')
    Object.entries(compliance.checks).forEach(([name, check]) => {
      const icon = check.passed ? '✅' : '❌'
      console.log(`${icon} ${name}: ${check.score}/100`)
    })

    if (compliance.issues.length > 0) {
      console.log('\n⚠️  ISSUES:')
      console.log('──────────────────────────────────────────────────')
      compliance.issues.forEach((issue) => {
        const icon =
          issue.severity === 'critical'
            ? '🔴'
            : issue.severity === 'warning'
              ? '🟡'
              : '🔵'
        console.log(`${icon} [${issue.severity}] ${issue.description}`)
        if (issue.suggestion) {
          console.log(`   → ${issue.suggestion}`)
        }
      })
    }

    if (compliance.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:')
      console.log('──────────────────────────────────────────────────')
      compliance.recommendations.forEach((rec) => {
        console.log(`   • ${rec}`)
      })
    }

    console.log('\n✅ Full pipeline test successful!')
    console.log('══════════════════════════════════════════════════')
    console.log('🚀 Ready for production deployment!\n')
  } catch (error: any) {
    if (error.name === 'ComplianceError') {
      console.error('\n❌ COMPLIANCE FAILED:')
      console.error('══════════════════════════════════════════════════')
      error.criticalIssues.forEach((issue: any) => {
        console.error(`🔴 ${issue.description}`)
        if (issue.suggestion) {
          console.error(`   → ${issue.suggestion}`)
        }
      })
      console.log('\nArticle blocked from publication due to critical issues.')
    } else {
      console.error('\n❌ Test failed:', error.message)
      if (error.stack) {
        console.error(error.stack)
      }
    }
    process.exit(1)
  }
}

main()
