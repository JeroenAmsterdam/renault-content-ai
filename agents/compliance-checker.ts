/**
 * Compliance Checker Agent
 *
 * Final quality gate before publication.
 * Verifies fact accuracy, tone-of-voice, technical correctness, completeness, and SEO.
 *
 * Key responsibilities:
 * - Detect hallucinated specifications
 * - Verify all claims are traceable to approved facts
 * - Check tone-of-voice compliance
 * - Ensure no [PLACEHOLDER] tags remain
 * - Validate SEO metadata
 * - Block publication on critical issues
 */

import { anthropic, MODEL } from '@/lib/anthropic/client'
import { validateToneOfVoice } from '@/lib/brand-knowledge'
import type {
  Fact,
  Article,
  ComplianceCheck,
  ComplianceIssue,
  ComplianceResult,
} from '@/types/agent-types'

const COMPLIANCE_PROMPT = `Je bent een compliance checker voor Renault Trucks content.

COMPLIANCE CHECKS (ALL MUST PASS):

1. FACT VERIFICATION
   - Elke concrete claim moet traceable zijn naar fact database
   - Numerieke waarden moeten exact matchen
   - Specificaties moeten uit approved facts komen
   - CRITICAL: Geen hallucinated specs

2. TONE-OF-VOICE
   - Volgt Renault Trucks brand guidelines
   - B2B appropriate (geen hyperbole)
   - Zakelijk maar toegankelijk
   - Geen marketing fluff woorden

3. TECHNICAL ACCURACY
   - Correcte terminologie (E-Tech niet E-tech)
   - Geen verouderde specs
   - Geen conflicterende informatie
   - Realistische claims

4. COMPLETENESS
   - Geen [PLACEHOLDER] tags
   - Alle secties compleet
   - Meta data aanwezig
   - Voldoende lengte (650-800 woorden)

5. SEO COMPLIANCE
   - Title < 60 chars
   - Meta description < 155 chars
   - Keywords naturally integrated
   - Proper heading structure

SEVERITY LEVELS:
- CRITICAL: Blocks publication (hallucination, missing facts)
- WARNING: Should fix but not blocking (tone issues, SEO)
- INFO: Suggestions for improvement

OUTPUT FORMAT:
{
  "approved": true/false,
  "overallScore": 87,
  "checks": {
    "factVerification": { "passed": true, "score": 95, "issues": [] },
    "toneOfVoice": { "passed": true, "score": 88, "issues": [] },
    "technical": { "passed": true, "score": 90, "issues": [] },
    "completeness": { "passed": true, "score": 85, "issues": [] },
    "seo": { "passed": true, "score": 82, "issues": [] }
  },
  "issues": [
    {
      "severity": "warning",
      "check": "seo",
      "description": "Title could be more specific",
      "location": "meta.title",
      "suggestion": "Add target audience to title"
    }
  ],
  "recommendations": [
    "Consider adding more specific examples",
    "Could strengthen conclusion with actionable next steps"
  ]
}
`

/**
 * Run the Compliance Checker Agent
 *
 * @param article - Article to check
 * @param usedFacts - Approved facts that should be referenced
 * @returns Compliance result with approval status
 */
export async function runComplianceChecker(
  article: Article,
  usedFacts: Fact[]
): Promise<ComplianceResult> {
  console.log(`🛡️  Compliance Checker starting...`)
  console.log(`   Article: ${article.title}`)
  console.log(`   Word count: ${article.wordCount}`)
  console.log(`   Facts to verify: ${usedFacts.length}`)

  try {
    // Pre-checks (fast, deterministic)
    const preChecks = runPreChecks(article, usedFacts)

    // If pre-checks fail critically, stop here
    if (preChecks.critical) {
      console.log(`❌ Pre-checks failed critically`)
      return {
        approved: false,
        overallScore: 0,
        checks: preChecks.checks,
        issues: preChecks.issues,
        recommendations: [],
      }
    }

    // AI-powered deep check
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      temperature: 0.1, // Very low for consistent checking
      messages: [
        {
          role: 'user',
          content: `${COMPLIANCE_PROMPT}

ARTICLE TO CHECK:
Title: ${article.title}
Meta: ${article.metaDescription}
Word Count: ${article.wordCount}
Content:
${article.content}

APPROVED FACTS (article must only use these):
${JSON.stringify(usedFacts, null, 2)}

FACTS CLAIMED TO BE USED:
${JSON.stringify(article.factsUsed, null, 2)}

Voer een strikte compliance check uit. Return JSON format.

CRITICAL: Elke claim in het artikel moet traceable zijn naar de approved facts.`,
        },
      ],
    })

    // Parse response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from compliance checker')
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
        throw new Error('Could not parse JSON from compliance checker')
      }
    }

    const result = JSON.parse(jsonText) as ComplianceResult

    // Hard stop if not approved
    if (!result.approved) {
      console.log(`❌ Compliance check FAILED`)
      console.log(`   Overall score: ${result.overallScore}/100`)
      console.log(
        `   Critical issues: ${result.issues.filter((i) => i.severity === 'critical').length}`
      )

      throw new ComplianceError(
        'Article failed compliance check',
        result.issues.filter((i) => i.severity === 'critical')
      )
    }

    console.log(`✅ Compliance check PASSED`)
    console.log(`   Overall score: ${result.overallScore}/100`)
    console.log(
      `   Warnings: ${result.issues.filter((i) => i.severity === 'warning').length}`
    )

    return result
  } catch (error) {
    console.error('❌ Compliance Checker error:', error)
    throw error
  }
}

/**
 * Run fast pre-checks before AI validation
 */
function runPreChecks(
  article: Article,
  usedFacts: Fact[]
): {
  critical: boolean
  issues: ComplianceIssue[]
  checks: ComplianceResult['checks']
} {
  const issues: ComplianceIssue[] = []
  let critical = false

  // Check for [PLACEHOLDER] tags
  if (article.content.includes('[PLACEHOLDER')) {
    issues.push({
      severity: 'critical',
      check: 'completeness',
      description: 'Article contains [PLACEHOLDER] tags',
      location: 'content',
      suggestion: 'Research missing information or remove placeholder',
    })
    critical = true
  }

  // Check word count
  if (article.wordCount < 650) {
    issues.push({
      severity: 'warning',
      check: 'completeness',
      description: `Article too short: ${article.wordCount} words (min 650)`,
      location: 'content',
    })
  }

  // Check title length
  if (article.title.length > 60) {
    issues.push({
      severity: 'warning',
      check: 'seo',
      description: `Title too long: ${article.title.length} chars (max 60)`,
      location: 'meta.title',
    })
  }

  // Check meta description
  if (article.metaDescription.length > 155) {
    issues.push({
      severity: 'warning',
      check: 'seo',
      description: `Meta description too long: ${article.metaDescription.length} chars (max 155)`,
      location: 'meta.description',
    })
  }

  // Tone-of-voice check
  const toneCheck = validateToneOfVoice(article.content)
  if (!toneCheck.valid) {
    toneCheck.issues.forEach((issue) => {
      issues.push({
        severity: 'warning',
        check: 'toneOfVoice',
        description: issue,
        location: 'content',
      })
    })
  }

  return {
    critical,
    issues,
    checks: {
      factVerification: { passed: true, score: 100, issues: [] },
      toneOfVoice: {
        passed: toneCheck.valid,
        score: toneCheck.score,
        issues: toneCheck.issues,
      },
      technical: { passed: true, score: 100, issues: [] },
      completeness: { passed: !critical, score: critical ? 0 : 100, issues: [] },
      seo: { passed: true, score: 90, issues: [] },
    },
  }
}

/**
 * Custom error for compliance failures
 */
export class ComplianceError extends Error {
  constructor(
    message: string,
    public criticalIssues: ComplianceIssue[]
  ) {
    super(message)
    this.name = 'ComplianceError'
  }
}
