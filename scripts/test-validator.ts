/**
 * Test script for Fact Validator Agent
 *
 * This tests the complete Research → Validator chain:
 * 1. Research Agent gathers facts from web search
 * 2. Validator Agent validates each fact strictly
 * 3. Results show approved vs rejected facts with reasoning
 */

// Load environment variables FIRST (before any imports)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the agents
import { runResearchAgent } from '../agents/research-agent'
import { runFactValidator } from '../agents/fact-validator'

async function main() {
  console.log('🧪 Testing Validator Agent...\n')
  console.log('══════════════════════════════════════════════════\n')

  try {
    // Step 1: Get facts from Research Agent
    console.log('Step 1: Running Research Agent...')
    console.log('──────────────────────────────────────────────────')
    const research = await runResearchAgent(
      'Renault Trucks E-Tech specificaties',
      ['elektrisch', 'technisch', 'capaciteit', 'actieradius']
    )

    console.log(`\n✅ Research complete: ${research.facts.length} facts found\n`)

    // Step 2: Validate facts
    console.log('Step 2: Running Validator Agent...')
    console.log('──────────────────────────────────────────────────')
    const validation = await runFactValidator(research.facts)

    // Display results
    console.log('\n📊 VALIDATION RESULTS:')
    console.log('══════════════════════════════════════════════════')
    console.log(`Total facts: ${research.facts.length}`)
    console.log(`Approved: ${validation.approved.length}`)
    console.log(`Rejected: ${validation.rejected.length}`)
    console.log(`Approval rate: ${validation.approvalRate.toFixed(0)}%`)

    console.log('\n✅ APPROVED FACTS:')
    console.log('══════════════════════════════════════════════════')
    validation.approved.forEach((fact, i) => {
      console.log(`\n${i + 1}. ${fact.claim}`)
      console.log(`   📚 Source: ${fact.source}`)
      console.log(`   🔗 URL: ${fact.sourceUrl || 'N/A'}`)
      console.log(`   📊 Confidence: ${(fact.confidence * 100).toFixed(0)}%`)
      console.log(`   🏷️  Category: ${fact.category}`)
      if ('approvalReason' in fact) {
        console.log(`   ✅ Reason: ${(fact as any).approvalReason}`)
      }
    })

    if (validation.rejected.length > 0) {
      console.log('\n❌ REJECTED FACTS:')
      console.log('══════════════════════════════════════════════════')
      validation.rejected.forEach((fact, i) => {
        console.log(`\n${i + 1}. ${fact.claim}`)
        console.log(`   📚 Source: ${fact.source}`)
        console.log(`   📊 Original confidence: ${(fact.confidence * 100).toFixed(0)}%`)
        console.log(`   ❌ Reason: ${fact.rejectionReason}`)
      })
    }

    console.log('\n📝 SUMMARY:')
    console.log('──────────────────────────────────────────────────')
    console.log(validation.summary)

    console.log('\n✅ Test completed successfully!')
    console.log('══════════════════════════════════════════════════\n')
  } catch (error: any) {
    if (error.name === 'InsufficientFactsError') {
      console.error('\n❌ VALIDATION FAILED: Insufficient approved facts')
      console.error('══════════════════════════════════════════════════')
      console.error(error.message)
      console.error('\nRejected facts:')
      error.rejectedFacts.forEach((fact: any, i: number) => {
        console.error(`\n${i + 1}. ${fact.claim}`)
        console.error(`   Reason: ${fact.rejectionReason}`)
      })
    } else {
      console.error('\n❌ Test failed:', error)
    }
    process.exit(1)
  }
}

main()
