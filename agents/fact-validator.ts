/**
 * Fact Validator Agent
 *
 * Responsible for strict validation of facts from the Research Agent.
 * This is a critical anti-hallucination component.
 *
 * Key responsibilities:
 * - Validate source credibility
 * - Enforce confidence score thresholds
 * - Reject vague or unverifiable claims
 * - Provide clear reasoning for each rejection
 * - Hard stop if insufficient approved facts
 */

import { anthropic, MODEL } from '@/lib/anthropic/client'
import type { Fact } from '@/types/agent-types'

const VALIDATOR_PROMPT = `Je bent een fact validator voor Renault Trucks content.

VALIDATION RULES (STRICT):
1. Technical specs: ALLEEN uit officiële Renault documentatie
2. Confidence moet > 0.85 voor technical facts
3. Confidence moet > 0.75 voor general facts
4. Source credibility:
   - renault-trucks.com = HIGH
   - renault-trucks.nl = HIGH
   - Official press releases = HIGH
   - Automotive media = MEDIUM
   - General blogs = LOW (reject)
5. Vage claims ("ongeveer", "mogelijk", "zou kunnen") = REJECT
6. Claims zonder concrete bron = REJECT
7. Bij 1% twijfel: REJECT

APPROVAL CRITERIA:
✅ APPROVE als:
- Source is official Renault or verified automotive media
- Confidence score matches source credibility
- Claim is specific and verifiable
- No conflicting information

❌ REJECT als:
- Vague or unverifiable claim
- Low confidence score (< threshold)
- Unreliable source
- Contains speculation

OUTPUT FORMAT:
Return JSON:
{
  "approved": [
    {
      "claim": "...",
      "source": "...",
      "sourceUrl": "...",
      "confidence": 0.95,
      "category": "technical",
      "approvalReason": "Official Renault source with specific technical data"
    }
  ],
  "rejected": [
    {
      "claim": "...",
      "source": "...",
      "confidence": 0.65,
      "rejectionReason": "Confidence too low for technical claim"
    }
  ],
  "summary": "Approved X facts, rejected Y facts. Reasoning..."
}
`

export interface ValidationResult {
  approved: Fact[]
  rejected: Array<Fact & { rejectionReason: string }>
  summary: string
  approvalRate: number
}

/**
 * Run the Fact Validator Agent
 *
 * @param facts - Array of facts to validate
 * @returns ValidationResult with approved and rejected facts
 */
export async function runFactValidator(
  facts: Fact[]
): Promise<ValidationResult> {
  console.log(`🔍 Validator Agent starting: ${facts.length} facts to validate`)

  try {
    // Call Claude for validation
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4000,
      temperature: 0.1, // Very low temp for consistent validation
      messages: [
        {
          role: 'user',
          content: `${VALIDATOR_PROMPT}

FACTS TO VALIDATE:
${JSON.stringify(facts, null, 2)}

Valideer elk fact volgens de strikte regels. Return JSON met approved en rejected lists.`,
        },
      ],
    })

    // Parse response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from validator')
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
        throw new Error('Could not parse JSON from validator response')
      }
    }

    const result = JSON.parse(jsonText) as Omit<ValidationResult, 'approvalRate'>

    // Calculate approval rate
    const approvalRate =
      facts.length > 0 ? (result.approved.length / facts.length) * 100 : 0

    // Hard stop if too few approved facts
    if (result.approved.length < 5) {
      console.warn(
        `⚠️  Only ${result.approved.length} facts approved (minimum: 5)`
      )
      throw new InsufficientFactsError(
        `Only ${result.approved.length} facts approved. Need minimum 5 for content creation.`,
        result.rejected
      )
    }

    console.log(`✅ Validation complete:`)
    console.log(`   Approved: ${result.approved.length}`)
    console.log(`   Rejected: ${result.rejected.length}`)
    console.log(`   Approval rate: ${approvalRate.toFixed(0)}%`)

    return {
      ...result,
      approvalRate,
    }
  } catch (error) {
    console.error('❌ Validator Agent error:', error)
    throw error
  }
}

/**
 * Custom error for insufficient facts
 */
export class InsufficientFactsError extends Error {
  constructor(
    message: string,
    public rejectedFacts: Array<Fact & { rejectionReason: string }>
  ) {
    super(message)
    this.name = 'InsufficientFactsError'
  }
}
