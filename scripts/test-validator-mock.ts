/**
 * Mock test for Fact Validator Agent
 *
 * Tests validator logic with pre-defined mock data (no API calls)
 * Demonstrates approved vs rejected facts with clear reasoning
 */

// Load environment variables FIRST (before any imports)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the agents
import { runFactValidator } from '../agents/fact-validator'
import type { Fact } from '../types/agent-types'

async function main() {
  console.log('🧪 Testing Validator Agent (with mock data)...\n')
  console.log('══════════════════════════════════════════════════\n')

  // Mock facts - mix van goede en slechte
  const mockFacts: Fact[] = [
    // GOOD facts (should be approved)
    {
      claim: 'Renault Trucks E-Tech heeft een actieradius tot 300 kilometer',
      source: 'Renault Trucks Official Website',
      sourceUrl: 'https://renault-trucks.com/e-tech',
      confidence: 0.95,
      category: 'technical',
    },
    {
      claim: 'E-Tech is beschikbaar in 16 ton en 26 ton configuraties',
      source: 'Renault Trucks E-Tech Range',
      sourceUrl: 'https://renault-trucks.nl/e-tech',
      confidence: 0.93,
      category: 'specification',
    },
    {
      claim: 'Laadtijd met 150kW snellader is ongeveer 1.5 uur',
      source: 'Renault Trucks Charging Documentation',
      sourceUrl: 'https://renault-trucks.com/charging',
      confidence: 0.91,
      category: 'technical',
    },
    {
      claim: 'Renault Trucks E-Tech heeft geen directe CO2-uitstoot tijdens gebruik',
      source: 'Renault Trucks Sustainability Report 2024',
      sourceUrl: 'https://renault-trucks.com/sustainability',
      confidence: 0.97,
      category: 'general',
    },
    {
      claim: 'E-Tech beschikt over regeneratief remmen voor energie terugwinning',
      source: 'Renault Trucks Technical Specifications',
      sourceUrl: 'https://renault-trucks.com/specs',
      confidence: 0.89,
      category: 'technical',
    },
    {
      claim: 'De E-Tech range is ontworpen voor urban en regional distribution',
      source: 'Renault Trucks Product Information',
      sourceUrl: 'https://renault-trucks.com/products',
      confidence: 0.88,
      category: 'general',
    },

    // BAD facts (should be rejected)
    {
      claim: 'E-Tech zou mogelijk goedkoper kunnen zijn dan diesel trucks',
      source: 'Transport Blog',
      sourceUrl: 'https://transport-blog.com/speculation',
      confidence: 0.65,
      category: 'general',
    },
    {
      claim: 'De batterij gaat ongeveer 10 jaar mee',
      source: 'Auto Magazine',
      sourceUrl: 'https://auto-mag.com/estimate',
      confidence: 0.72,
      category: 'technical',
    },
    {
      claim: 'Renault Trucks is marktleider in elektrische vrachtwagens',
      source: 'Industry News',
      sourceUrl: 'https://industry-news.com/article',
      confidence: 0.68,
      category: 'marketing',
    },
    {
      claim: 'De E-Tech SuperMax 5000 heeft 1000km range',
      source: 'Future Concepts Blog',
      sourceUrl: 'https://future-blog.com/concepts',
      confidence: 0.55,
      category: 'technical',
    },
  ]

  try {
    console.log(`Testing with ${mockFacts.length} mock facts...`)
    console.log('──────────────────────────────────────────────────\n')

    // Run validator
    const validation = await runFactValidator(mockFacts)

    // Display results
    console.log('\n📊 VALIDATION RESULTS:')
    console.log('══════════════════════════════════════════════════')
    console.log(`Total facts: ${mockFacts.length}`)
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

    console.log('\n✅ Validator Agent test successful!')
    console.log('══════════════════════════════════════════════════\n')
  } catch (error: any) {
    if (error.name === 'InsufficientFactsError') {
      console.error('\n❌ VALIDATION FAILED: Insufficient approved facts')
      console.error('══════════════════════════════════════════════════')
      console.error(error.message)
      console.log('\nThis is expected behavior - validator should reject low quality facts!')
      console.log('\nRejected facts:')
      error.rejectedFacts.forEach((fact: any, i: number) => {
        console.error(`\n${i + 1}. ${fact.claim}`)
        console.error(`   Reason: ${fact.rejectionReason}`)
      })
    } else {
      console.error('\n❌ Test failed:', error)
      process.exit(1)
    }
  }
}

main()
