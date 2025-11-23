/**
 * Mock test for Content Writer Agent
 *
 * Tests Writer Agent with pre-approved mock facts (no API rate limits)
 * Skips Research and Validator agents
 */

// Load environment variables FIRST (before any imports)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the agents
import { runContentWriter } from '../agents/content-writer'
import type { Fact } from '../types/agent-types'
import fs from 'fs'

async function main() {
  console.log('🧪 Testing Content Writer Agent (with mock data)...\n')
  console.log('══════════════════════════════════════════════════\n')

  const startTime = Date.now()

  // Mock approved facts (high quality facts that passed validation)
  const approvedFacts: Fact[] = [
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
  ]

  try {
    console.log('Using mock approved facts (skipping Research & Validator)')
    console.log(`Approved facts: ${approvedFacts.length}\n`)

    // Write content
    console.log('Running Content Writer Agent...')
    console.log('──────────────────────────────────────────────────')
    const article = await runContentWriter({
      approvedFacts,
      topic: 'Renault Trucks E-Tech: Specificaties en Praktische Toepassingen',
      targetAudience: 'fleet-managers',
      keywords: ['E-Tech', 'elektrisch', 'actieradius', 'vrachtwagens'],
      desiredWordCount: 700,
    })

    const duration = Date.now() - startTime

    // Display results
    console.log('\n📄 ARTICLE CREATED:')
    console.log('══════════════════════════════════════════════════')
    console.log(`Title: ${article.title}`)
    console.log(`Meta: ${article.metaDescription}`)
    console.log(`Word count: ${article.wordCount}`)
    console.log(`Facts used: ${article.factsUsed.length}/${approvedFacts.length}`)
    console.log(`Keywords: ${article.keywords.join(', ')}`)
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`)

    console.log('\n📝 FULL ARTICLE:')
    console.log('══════════════════════════════════════════════════')
    console.log(article.content)
    console.log('══════════════════════════════════════════════════')

    console.log('\n✅ FACTS USED IN ARTICLE:')
    console.log('──────────────────────────────────────────────────')
    article.factsUsed.forEach((fact, i) => {
      console.log(`${i + 1}. ${fact}`)
    })

    if (article.internalLinkSuggestions.length > 0) {
      console.log('\n🔗 INTERNAL LINK SUGGESTIONS:')
      console.log('──────────────────────────────────────────────────')
      article.internalLinkSuggestions.forEach((link) => {
        console.log(`- ${link}`)
      })
    }

    // Save to file
    const outputDir = path.join(process.cwd(), 'output')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir)
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `article-mock-${timestamp}.md`
    const filepath = path.join(outputDir, filename)

    const fullContent = `---
title: ${article.title}
description: ${article.metaDescription}
keywords: ${article.keywords.join(', ')}
wordCount: ${article.wordCount}
targetAudience: fleet-managers
factsUsed: ${article.factsUsed.length}
generatedAt: ${new Date().toISOString()}
testType: mock
---

${article.content}

---

## Metadata

**Facts Used:**
${article.factsUsed.map((fact, i) => `${i + 1}. ${fact}`).join('\n')}

**Internal Link Suggestions:**
${article.internalLinkSuggestions.map((link) => `- ${link}`).join('\n')}

**Test Stats:**
- Mock approved facts: ${approvedFacts.length}
- Facts used in article: ${article.factsUsed.length}
- Word count: ${article.wordCount}
- Duration: ${(duration / 1000).toFixed(1)}s
`

    fs.writeFileSync(filepath, fullContent)

    console.log(`\n💾 Article saved to: ${filepath}`)

    console.log('\n✅ Content Writer test successful!')
    console.log('══════════════════════════════════════════════════\n')
  } catch (error: any) {
    console.error('\n❌ Test failed:', error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()
