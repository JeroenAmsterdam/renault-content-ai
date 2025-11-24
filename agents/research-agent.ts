/**
 * Research Agent
 *
 * Responsible for gathering verified facts about Renault Trucks topics.
 * This is the foundation for anti-hallucination in the content system.
 *
 * Key responsibilities:
 * - Web search for official Renault Trucks information
 * - Document each claim with source and URL
 * - Assign confidence scores (0.0 - 1.0)
 * - Mark questionable information as [NEEDS_VERIFICATION]
 * - Store verified facts in Supabase database
 */

import { anthropic, MODEL } from '@/lib/anthropic/client'
import { getSupabaseAdmin } from '@/lib/supabase/client'
import type { ResearchResult, Fact } from '@/types/agent-types'

/**
 * System prompt for the Research Agent
 * Defines strict rules for fact verification and confidence scoring
 */
const RESEARCH_AGENT_PROMPT = `Fact-gathering researcher voor Renault Trucks NL.

REGELS:
1. Alleen verifieerbare feiten met bron
2. Prioriteer: renault-trucks.com/nl, officiële persberichten
3. Nooit specificaties verzinnen
4. Bij twijfel: niet includeren

CONFIDENCE: 0.95+ officieel, 0.85+ Renault site, 0.70+ media
CATEGORIEËN: technical, specification, marketing, general

OUTPUT JSON:
{
  "facts": [{"claim": "...", "source": "...", "sourceUrl": "...", "confidence": 0.95, "category": "technical"}],
  "needsVerification": [],
  "summary": "..."
}

3-15 facts, elk met sourceUrl, Nederlandse bronnen, recente info.
`

/**
 * Run the Research Agent to gather facts on a specific topic
 *
 * @param topic - The main topic to research
 * @param keywords - Additional keywords to refine the search
 * @param sources - Optional custom URLs to extract facts from
 * @param sources - Optional custom URLs to extract facts from (not implemented yet)
 * @returns ResearchResult with verified facts and metrics
 */
export async function runResearchAgent(
  topic: string,
  keywords: string[] = [],
  sources: string[] = []
): Promise<ResearchResult> {
  console.log(`🔍 Research Agent starting: ${topic}`)
  console.log(`   Keywords: ${keywords.join(', ')}`)
  if (sources.length > 0) {
    console.log(`   Custom sources: ${sources.length} URLs provided`)
  }

  const startTime = Date.now()

  try {
    // Perform web search (will prioritize custom sources if provided)
    console.log('\n🌐 Performing web search...')
    if (sources.length > 0) {
      console.log(`   Prioritizing ${sources.length} custom sources`)
    }

    // Build search query
    const searchQuery = keywords.length > 0
      ? `${topic} ${keywords.join(' ')}`
      : topic

    console.log(`   Search query: "${searchQuery}"`)

    // Build custom sources instruction
    const sourcesInstruction = sources.length > 0
      ? `\n\nPRIORITEIT BRONNEN (gebruik deze EERST):
${sources.map((url, i) => `${i + 1}. ${url}`).join('\n')}

Search deze URLs PRIORITAIR. Gebruik web search om ze te vinden en te analyseren.
Geef feiten uit deze bronnen extra voorkeur.`
      : ''
    console.log(`🔍 Research Agent starting: "${searchQuery}"`)
    if (sources.length > 0) {
      console.log(`   Note: ${sources.length} custom sources provided (feature pending)`)
    }

    // Call Claude with web search tool
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2500, // Reduced from 4000 to optimize token usage
      temperature: 0.3, // Lower temp for more factual output
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
          max_uses: 2, // Limit to 2 searches to reduce token usage
        },
      ],
      messages: [
        {
          role: 'user',
          content: `${RESEARCH_AGENT_PROMPT}

ONDERWERP: ${topic}
KEYWORDS: ${keywords.join(', ')}
${sourcesInstruction}

Zoek gedetailleerde, verifieerbare informatie over dit onderwerp specifiek voor Renault Trucks. Focus op officiële bronnen en technische specificaties.

Gebruik web search om actuele en accurate informatie te vinden.

Return het resultaat als een geldig JSON object.`,
        },
      ],
    })

    // Parse response - look through ALL content blocks for JSON
    console.log(`Response has ${response.content.length} content blocks`)

    // Get all text blocks (there might be multiple with tool use)
    const textBlocks = response.content.filter((block) => block.type === 'text')
    if (textBlocks.length === 0) {
      throw new Error('No text response from agent')
    }

    // Try each text block to find one with JSON (prefer last block)
    let jsonText = ''
    for (let i = textBlocks.length - 1; i >= 0; i--) {
      const block = textBlocks[i]
      if (block.type === 'text') {
        const text = block.text
        // Check if this block contains JSON
        if (text.includes('{') && text.includes('}')) {
          jsonText = text
          console.log(`Found JSON in text block ${i + 1}/${textBlocks.length}`)
          break
        }
      }
    }

    if (!jsonText) {
      console.error('No JSON found in any text blocks')
      textBlocks.forEach((block, i) => {
        if (block.type === 'text') {
          console.error(`Block ${i + 1}:`, block.text.substring(0, 200))
        }
      })
      throw new Error('No JSON object found in agent response')
    }

    console.log('Raw response preview:', jsonText.substring(0, 200))

    // Try to extract JSON from markdown code blocks first
    const codeBlockMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (codeBlockMatch) {
      jsonText = codeBlockMatch[1]
    } else {
      // Try to find JSON object in text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      } else {
        console.error('Could not find JSON in response:', jsonText)
        throw new Error('No JSON object found in agent response')
      }
    }

    let result: Omit<ResearchResult, 'duration'>
    try {
      result = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parse error. Extracted text:', jsonText)
      throw new Error(`Failed to parse JSON: ${parseError}`)
    }

    // Validate result structure
    if (!result.facts || !Array.isArray(result.facts)) {
      throw new Error('Invalid response structure: missing facts array')
    }

    // Filter out low-confidence facts
    let facts = result.facts.filter((fact) => fact.confidence >= 0.7)

    // Boost confidence for facts from custom sources
    if (sources.length > 0) {
      const sourceDomains = sources.map(url => {
        try {
          return new URL(url).hostname
        } catch {
          return url
        }
      })

      facts = facts.map(fact => {
        const factDomain = fact.sourceUrl ? new URL(fact.sourceUrl).hostname : ''
        const isFromCustomSource = sourceDomains.some(domain => factDomain.includes(domain))

        if (isFromCustomSource) {
          console.log(`   ⭐ Boosting confidence for fact from custom source: ${fact.sourceUrl}`)
          return {
            ...fact,
            confidence: Math.min(fact.confidence + 0.1, 0.98)
          }
        }
        return fact
      })
    }

    // Remove duplicates
    const uniqueFacts = deduplicateFacts(facts)

    console.log(`\n✅ Research completed: ${uniqueFacts.length} unique facts found`)

    // Store facts in database
    if (uniqueFacts.length > 0) {
      try {
        await storeFacts(uniqueFacts, topic)
      } catch (error: any) {
        console.warn('⚠️  Could not store in database (expected in dev):', error.message)
      }
    }

    return {
      facts: uniqueFacts,
      needsVerification: [],
      summary: `Found ${uniqueFacts.length} verified facts from ${sources.length > 0 ? 'custom sources and' : ''} web research`,
      duration: Date.now() - startTime
    }
  } catch (error) {
    console.error('❌ Research Agent error:', error)
    throw error
  }
}

/**
 * Remove duplicate facts based on claim text
 *
 * @param facts - Array of facts that may contain duplicates
 * @returns Array of unique facts
 */
function deduplicateFacts(facts: Fact[]): Fact[] {
  const seen = new Set<string>()
  const unique: Fact[] = []

  for (const fact of facts) {
    const key = fact.claim.toLowerCase().trim()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(fact)
    }
  }

  return unique
}

/**
 * Store verified facts in the Supabase database
 *
 * @param facts - Array of verified facts to store
 * @param topic - The topic these facts relate to
 */
async function storeFacts(facts: Fact[], topic: string): Promise<void> {
  if (facts.length === 0) return

  try {
    const supabaseAdmin = getSupabaseAdmin()

    const factsToInsert = facts.map((fact) => ({
      claim: fact.claim,
      source: fact.source,
      source_url: fact.sourceUrl || null,
      confidence_score: fact.confidence,
      category: fact.category,
      verified_by: 'research_agent_v1',
      metadata: {
        topic,
        discovered_at: new Date().toISOString(),
      },
    }))

    const { error } = await supabaseAdmin
      .from('facts')
      .insert(factsToInsert as any) // Type assertion for Supabase insert

    if (error) {
      console.warn('⚠️  Could not store facts in database:', error.message)
      console.log('   Facts will be available in article metadata')
    } else {
      console.log(`💾 Stored ${facts.length} facts in database`)
    }
  } catch (error: any) {
    console.warn(
      '⚠️  Database storage skipped (expected in containerized dev):',
      error.message
    )
    console.log('✅ Facts are still available for content creation')
  }
}

/**
 * Retrieve facts from database by topic
 *
 * @param topic - Topic to search for
 * @param minConfidence - Minimum confidence score (default: 0.7)
 */
export async function getFactsByTopic(
  topic: string,
  minConfidence: number = 0.7
) {
  try {
    const supabaseAdmin = getSupabaseAdmin()

    const { data, error } = await supabaseAdmin
      .from('facts')
      .select('*')
      .ilike('metadata->>topic', `%${topic}%`)
      .gte('confidence_score', minConfidence)
      .order('confidence_score', { ascending: false })

    if (error) throw error

    return data
  } catch (error) {
    console.error('Failed to retrieve facts:', error)
    throw error
  }
}
