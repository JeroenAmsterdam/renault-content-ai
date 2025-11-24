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
const RESEARCH_AGENT_PROMPT = `Je bent een fact-gathering researcher voor Renault Trucks Nederland.

STRIKTE REGELS:
1. Verzamel ALLEEN verifieerbare feiten
2. Elke claim MOET een concrete bron hebben
3. Prioriteer deze bronnen (in volgorde):
   - renault-trucks.com (officiële website)
   - renault-trucks.nl (Nederlandse site)
   - Officiële persberichten van Renault Trucks
   - Technische specificatie sheets
4. Markeer twijfelachtige info als [NEEDS_VERIFICATION]
5. VERZIN NOOIT specificaties, cijfers of claims
6. Bij twijfel: niet includeren

CONFIDENCE SCORING:
- 0.95-1.0: Directe quote uit officiële Renault documentatie
- 0.85-0.94: Info van officiële Renault website
- 0.75-0.84: Info van betrouwbare automotive media met Renault bron
- 0.70-0.74: Info van betrouwbare media zonder directe Renault bron
- <0.70: Markeer als [NEEDS_VERIFICATION]

CATEGORIEËN:
- technical: Technische specificaties (motor, vermogen, batterij, etc.)
- specification: Product specificaties (gewicht, afmetingen, capaciteit)
- marketing: Marketing claims (milieuvriendelijk, kostenbesparend, etc.)
- general: Algemene informatie (bedrijfsinfo, marktpositie, etc.)

OUTPUT FORMAT:
Return een JSON object met deze structuur:
{
  "facts": [
    {
      "claim": "Concrete, verifieerbare claim",
      "source": "Naam van de bron",
      "sourceUrl": "Volledige URL",
      "confidence": 0.95,
      "category": "technical"
    }
  ],
  "needsVerification": [
    "Claims die interessant zijn maar niet geverifieerd konden worden"
  ],
  "summary": "Korte samenvatting van wat je hebt gevonden (2-3 zinnen)"
}

BELANGRIJK:
- Minimaal 3 facts vinden (tenzij echt geen betrouwbare info beschikbaar is)
- Maximaal 15 facts (focus op kwaliteit, niet kwantiteit)
- Elk fact MOET een sourceUrl hebben
- Gebruik ALLEEN Nederlandse bronnen voor Nederlandse site
- Geef voorkeur aan recente informatie (laatste 2 jaar)
`

/**
 * Run the Research Agent to gather facts on a specific topic
 *
 * @param topic - The main topic to research
 * @param keywords - Additional keywords to refine the search
 * @param sources - Optional custom URLs to extract facts from
 * @returns ResearchResult with verified facts and metrics
 */
export async function runResearchAgent(
  topic: string,
  keywords: string[] = [],
  sources: string[] = []
): Promise<ResearchResult> {
  const startTime = Date.now()

  try {
    console.log(`🔍 Research Agent starting: "${topic}"`)
    console.log(`   Keywords: ${keywords.join(', ') || 'none'}`)
    if (sources.length > 0) {
      console.log(`   Custom sources: ${sources.length} URLs provided`)
    }

    let allFacts: Fact[] = []

    // STEP 1: Extract from custom sources (if provided)
    if (sources.length > 0) {
      console.log('\n📄 Extracting facts from custom sources...')

      const sourcesFacts = await extractFromSources(sources, topic)
      allFacts = [...allFacts, ...sourcesFacts]

      console.log(`✅ Extracted ${sourcesFacts.length} facts from custom sources`)
    }

    // STEP 2: Web search (only if not enough facts from sources)
    if (allFacts.length < 8) {
      console.log('\n🌐 Performing web search for additional facts...')

      // Build search query
      const searchQuery = keywords.length > 0
        ? `${topic} ${keywords.join(' ')}`
        : topic

      // Call Claude with web search tool
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4000,
        temperature: 0.3, // Lower temp for more factual output
        tools: [
          {
            type: 'web_search_20250305' as const,
            name: 'web_search',
          },
        ],
        messages: [
          {
            role: 'user',
            content: `${RESEARCH_AGENT_PROMPT}

ONDERWERP: ${topic}
KEYWORDS: ${keywords.join(', ')}

${sources.length > 0 ? `NOTE: User provided ${sources.length} custom sources. Use web search only for additional context or missing information.` : 'Perform comprehensive web search.'}

Zoek gedetailleerde, verifieerbare informatie over dit onderwerp specifiek voor Renault Trucks. Focus op officiële bronnen en technische specificaties.

Gebruik web search om actuele en accurate informatie te vinden.

Return het resultaat als een geldig JSON object.`,
          },
        ],
      })

      const webFacts = parseResearchResponse(response)
      allFacts = [...allFacts, ...webFacts]
    }

    // Remove duplicates
    const uniqueFacts = deduplicateFacts(allFacts)

    // Filter out low-confidence facts
    const verifiedFacts = uniqueFacts.filter((fact) => fact.confidence >= 0.7)

    // Store facts in database (skip in containerized env)
    if (verifiedFacts.length > 0) {
      try {
        await storeFacts(verifiedFacts, topic)
      } catch (error) {
        console.warn('⚠️  Could not store in database (expected in dev):', (error as Error).message)
        console.log('✅ Facts would be stored in production environment')
        // Don't throw - research succeeded even if storage failed
      }
    }

    const duration = Date.now() - startTime

    console.log(
      `\n✅ Research completed: ${verifiedFacts.length} unique facts found`
    )

    return {
      facts: verifiedFacts,
      needsVerification: [],
      summary: `Found ${verifiedFacts.length} verified facts from ${sources.length > 0 ? 'custom sources and' : ''} web research`,
      duration: Date.now() - startTime,
    }
  } catch (error) {
    console.error('❌ Research Agent error:', error)
    throw error
  }
}

/**
 * Store verified facts in the Supabase database
 *
 * @param facts - Array of verified facts to store
 * @param topic - The topic these facts relate to
 */
async function storeFacts(facts: Fact[], topic: string): Promise<void> {
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
        agent_version: 'research_agent_v1',
      } as any, // Type assertion for Supabase JSONB field
    }))

    const { error } = await (supabaseAdmin.from('facts') as any).insert(
      factsToInsert
    )

    if (error) {
      console.warn('⚠️  Could not store facts in database:', error.message)
      // Don't throw - storage is optional
      return
    }

    console.log(`💾 Stored ${facts.length} facts in database`)
  } catch (error: any) {
    console.warn(
      '⚠️  Database storage skipped (expected in dev):',
      error.message
    )
    // Don't throw - graceful degradation
  }
}

/**
 * Parse research response from Claude API
 */
function parseResearchResponse(response: any): Fact[] {
  console.log(`Response has ${response.content.length} content blocks`)

  // Get all text blocks (there might be multiple with tool use)
  const textBlocks = response.content.filter((block: any) => block.type === 'text')
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
      throw new Error('No JSON object found in agent response')
    }
  }

  let result: any
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

  return result.facts
}

/**
 * Extract facts from custom URLs using web_fetch
 */
async function extractFromSources(
  urls: string[],
  topic: string
): Promise<Fact[]> {
  const facts: Fact[] = []

  for (const url of urls) {
    try {
      console.log(`  📥 Fetching: ${url}`)

      // Use web_fetch to get content
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 4000,
        temperature: 0.3,
        tools: [{
          type: 'web_fetch_20250305' as const,
          name: 'web_fetch'
        }],
        messages: [{
          role: 'user',
          content: `Fetch and extract facts from this URL: ${url}

Extract factual information relevant to: ${topic}

${RESEARCH_AGENT_PROMPT}

Focus on extracting:
- Technical specifications
- Concrete data points
- Verifiable claims
- Official statements

Output JSON with facts array.`
        }]
      })

      const urlFacts = parseResearchResponse(response)

      // Mark these as high confidence (user-provided sources)
      const enhancedFacts = urlFacts.map(fact => ({
        ...fact,
        confidence: Math.min(fact.confidence + 0.1, 0.98), // Boost confidence
        sourceUrl: url,
        category: fact.category || 'general'
      }))

      facts.push(...enhancedFacts)
      console.log(`  ✅ Extracted ${enhancedFacts.length} facts from ${url}`)

    } catch (error: any) {
      console.warn(`  ⚠️  Could not fetch ${url}:`, error.message)
      // Continue with other URLs
    }
  }

  return facts
}

/**
 * Remove duplicate facts based on claim text
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
