/**
 * Test Script for Research Agent
 *
 * Run with: npm run test:research
 *
 * This script tests the Research Agent by running a fact-gathering
 * operation on Renault Trucks E-Tech topics.
 */

// Load environment variables FIRST (before any imports)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the agent
import { runResearchAgent } from '../agents/research-agent'

async function main() {
  console.log('🧪 Testing Research Agent...\n')
  console.log('═'.repeat(50))

  try {
    // Test research on E-Tech range and charging
    const result = await runResearchAgent(
      'Renault Trucks E-Tech actieradius en laadtijd',
      ['elektrisch', 'range', 'batterij', 'laden', '2024']
    )

    console.log('\n📊 RESULTS:')
    console.log('═'.repeat(50))
    console.log(`Facts found: ${result.facts.length}`)
    console.log(`Needs verification: ${result.needsVerification.length}`)
    console.log(`Duration: ${result.duration}ms`)

    console.log('\n📝 SUMMARY:')
    console.log('─'.repeat(50))
    console.log(result.summary)

    console.log('\n✅ VERIFIED FACTS:')
    console.log('═'.repeat(50))
    result.facts.forEach((fact, i) => {
      console.log(`\n${i + 1}. ${fact.claim}`)
      console.log(`   📚 Source: ${fact.source}`)
      console.log(`   🔗 URL: ${fact.sourceUrl || 'N/A'}`)
      console.log(
        `   📊 Confidence: ${(fact.confidence * 100).toFixed(0)}%`
      )
      console.log(`   🏷️  Category: ${fact.category}`)
    })

    if (result.needsVerification.length > 0) {
      console.log('\n⚠️  NEEDS VERIFICATION:')
      console.log('─'.repeat(50))
      result.needsVerification.forEach((item, i) => {
        console.log(`${i + 1}. ${item}`)
      })
    }

    console.log('\n✅ Test completed successfully!')
    console.log('═'.repeat(50))
  } catch (error) {
    console.error('\n❌ Test failed:')
    console.error(error)
    process.exit(1)
  }
}

main()
