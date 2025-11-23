/**
 * Test script for Content Writer Agent
 *
 * Tests the complete content creation pipeline:
 * 1. Research Agent - gathers facts
 * 2. Validator Agent - validates facts
 * 3. Writer Agent - creates article
 *
 * Outputs final article to /output directory
 */

// Load environment variables FIRST (before any imports)
import { config } from 'dotenv'
import path from 'path'
config({ path: path.resolve(process.cwd(), '.env.local') })

// Now import the agents
import { runResearchAgent } from '../agents/research-agent'
import { runFactValidator } from '../agents/fact-validator'
import { runContentWriter } from '../agents/content-writer'
import fs from 'fs'

async function main() {
  console.log('🧪 Testing Content Writer Agent...\n')
  console.log('══════════════════════════════════════════════════\n')

  const startTime = Date.now()

  try {
    // Step 1: Research
    console.log('Step 1: Research Agent')
    console.log('──────────────────────────────────────────────────')
    const research = await runResearchAgent(
      'Renault Trucks E-Tech elektrische vrachtwagens',
      ['E-Tech', 'elektrisch', 'actieradius', 'laden']
    )
    console.log(`✅ ${research.facts.length} facts found\n`)

    // Step 2: Validate
    console.log('Step 2: Validator Agent')
    console.log('──────────────────────────────────────────────────')
    const validation = await runFactValidator(research.facts)
    console.log(`✅ ${validation.approved.length} facts approved (${validation.approvalRate.toFixed(0)}% approval rate)\n`)

    // Step 3: Write content
    console.log('Step 3: Content Writer Agent')
    console.log('──────────────────────────────────────────────────')
    const article = await runContentWriter({
      approvedFacts: validation.approved,
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
    console.log(`Facts used: ${article.factsUsed.length}/${validation.approved.length}`)
    console.log(`Keywords: ${article.keywords.join(', ')}`)
    console.log(`Total duration: ${(duration / 1000).toFixed(1)}s`)

    console.log('\n📝 CONTENT PREVIEW:')
    console.log('──────────────────────────────────────────────────')
    console.log(article.content.substring(0, 500) + '...\n')

    console.log('✅ FACTS USED IN ARTICLE:')
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
    const filename = `article-${timestamp}.md`
    const filepath = path.join(outputDir, filename)

    const fullContent = `---
title: ${article.title}
description: ${article.metaDescription}
keywords: ${article.keywords.join(', ')}
wordCount: ${article.wordCount}
targetAudience: fleet-managers
factsUsed: ${article.factsUsed.length}
generatedAt: ${new Date().toISOString()}
---

${article.content}

---

## Metadata

**Facts Used:**
${article.factsUsed.map((fact, i) => `${i + 1}. ${fact}`).join('\n')}

**Internal Link Suggestions:**
${article.internalLinkSuggestions.map((link) => `- ${link}`).join('\n')}

**Pipeline Stats:**
- Research: ${research.facts.length} facts gathered
- Validation: ${validation.approved.length} approved, ${validation.rejected.length} rejected
- Writing: ${article.wordCount} words
- Total duration: ${(duration / 1000).toFixed(1)}s
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
