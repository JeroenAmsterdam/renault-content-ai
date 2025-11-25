/**
 * Content Writer Agent
 *
 * Responsible for creating B2B articles with brand-specific tone and style.
 * Uses ONLY approved facts - no hallucination possible.
 *
 * Key responsibilities:
 * - Write 700-word SEO-optimized articles
 * - Follow client-specific tone-of-voice strictly
 * - Use ONLY approved facts from Validator Agent
 * - Target specific B2B audiences
 * - Generate proper SEO metadata
 */

import { anthropic, MODEL } from '@/lib/anthropic/client'
import { getBrandGuidelines, getAudienceProfile } from '@/lib/brand-knowledge'
import type { Fact } from '@/types/agent-types'

const WRITER_PROMPT = `Je bent een B2B content writer die werkt met client-specifieke brand guidelines.

STRIKTE CONSTRAINTS:
1. Gebruik ALLEEN facts uit de approved facts lijst
2. GEEN creative liberty bij specs, cijfers of claims
3. Bij ontbrekende informatie: gebruik [PLACEHOLDER: beschrijving]
4. Volg de client-specifieke tone-of-voice strikt
5. Target audience bepaalt diepgang en focus

TONE-OF-VOICE:
- Zakelijk maar toegankelijk
- Data-driven, geen marketing fluff
- Focus op praktische waarde (TCO, efficiency, sustainability)
- Geen superlatieven zonder bewijs
- B2B professionals als audience

ARTICLE STRUCTURE:
1. Title (SEO optimized, max 60 chars)
2. Meta description (max 155 chars)
3. Introduction (100 woorden)
   - Hook die relevant is voor target audience
   - Context van het onderwerp
   - Wat de lezer gaat leren
4. Body (500 woorden, 3-4 secties)
   - Gebruik subheadings (H2)
   - Elk punt onderbouwd met facts
   - Praktische voorbeelden waar mogelijk
5. Conclusie (100 woorden)
   - Samenvatting key points
   - Actionable takeaway
   - Relevante next step

SEO BEST PRACTICES:
- Natuurlijke keyword integratie
- Focus keyword in title, eerste paragraaf, H2
- Interne link suggesties (gerelateerde topics)
- Leesbare lengte zinnen (max 25 woorden)

OUTPUT FORMAT:
Return JSON:
{
  "title": "SEO geoptimaliseerde title",
  "metaDescription": "Korte samenvatting voor search results",
  "content": "# Title\\n\\nIntroductie...\\n\\n## Section 1\\n\\nContent...\\n\\n## Section 2...",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "wordCount": 723,
  "factsUsed": ["fact claim 1", "fact claim 2"],
  "internalLinkSuggestions": ["related topic 1", "related topic 2"]
}
`

export interface Article {
  title: string
  metaDescription: string
  content: string
  keywords: string[]
  wordCount: number
  factsUsed: string[]
  internalLinkSuggestions: string[]
}

export interface WriterInput {
  approvedFacts: Fact[]
  topic: string
  targetAudience: string
  keywords?: string[]
  desiredWordCount?: number
  briefing?: string
}

/**
 * Run the Content Writer Agent
 *
 * @param input - Writer configuration with approved facts and topic
 * @returns Complete article with metadata
 */
export async function runContentWriter(input: WriterInput): Promise<Article> {
  const {
    approvedFacts,
    topic,
    targetAudience,
    keywords = [],
    desiredWordCount = 700,
    briefing,
  } = input

  console.log(`✍️  Content Writer starting...`)
  console.log(`   Topic: ${topic}`)
  console.log(`   Audience: ${targetAudience}`)
  console.log(`   Available facts: ${approvedFacts.length}`)

  try {
    // Get brand guidelines and audience profile
    const brandGuidelines = getBrandGuidelines()
    const audienceProfile = getAudienceProfile(targetAudience)

    if (!audienceProfile) {
      throw new Error(`Unknown target audience: ${targetAudience}`)
    }

    // Create outline first
    const outline = generateOutline(topic, audienceProfile, approvedFacts)

    // Call Claude for content creation
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.3, // Balanced for creativity within constraints
      messages: [
        {
          role: 'user',
          content: `${WRITER_PROMPT}
${briefing ? `

BRIEFING FROM CLIENT:
${briefing}

IMPORTANT: Use this briefing as your PRIMARY GUIDANCE.
- Follow the suggested angle/approach
- Include any quotes provided
- Address the stated goals
- Match the requested focus/tone

` : ''}
BRAND GUIDELINES:
${JSON.stringify(brandGuidelines.toneOfVoice, null, 2)}

TARGET AUDIENCE: ${targetAudience}
Profile: ${JSON.stringify(audienceProfile, null, 2)}

APPROVED FACTS (use ONLY these):
${JSON.stringify(approvedFacts, null, 2)}

TOPIC: ${topic}

SEO KEYWORDS: ${keywords.join(', ')}

DESIRED WORD COUNT: ${desiredWordCount}

OUTLINE:
${outline}

Schrijf een compleet artikel volgens de structure. Return JSON format.

CRITICAL: Gebruik ALLEEN de approved facts. Verzin NIETS. Bij twijfel: [PLACEHOLDER].`,
        },
      ],
    })

    // Parse response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from writer')
    }

    // Extract JSON from response
    let jsonText = textContent.text

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
        throw new Error('Could not parse JSON from writer response')
      }
    }

    const article = JSON.parse(jsonText) as Article

    console.log(`✅ Article written:`)
    console.log(`   Title: ${article.title}`)
    console.log(`   Word count: ${article.wordCount}`)
    console.log(`   Facts used: ${article.factsUsed.length}`)

    return article
  } catch (error) {
    console.error('❌ Content Writer error:', error)
    throw error
  }
}

/**
 * Generate article outline based on topic, audience, and available facts
 */
function generateOutline(
  topic: string,
  audience: any,
  facts: Fact[]
): string {
  // Categorize facts
  const technicalFacts = facts.filter((f) => f.category === 'technical')
  const specFacts = facts.filter((f) => f.category === 'specification')

  // Generate outline based on available facts and audience interests
  const sections = [
    `## Introductie\n- Context: ${topic}\n- Relevantie voor ${audience.interests.join(', ')}`,
  ]

  if (technicalFacts.length > 0) {
    sections.push(
      `## Technische Specificaties\n- Gebruik facts over E-Tech technische details\n- Focus op ${audience.interests[0]}`
    )
  }

  if (specFacts.length > 0) {
    sections.push(
      `## Praktische Details\n- Concrete specificaties\n- Impact op ${audience.painPoints[0]}`
    )
  }

  sections.push(
    `## Praktische Toepassing\n- Focus on ${audience.painPoints.join(', ')}\n- Real-world relevance`
  )

  sections.push(
    `## Conclusie\n- Key takeaways\n- Actionable next steps voor ${audience.language} besluitvorming`
  )

  return sections.join('\n\n')
}
