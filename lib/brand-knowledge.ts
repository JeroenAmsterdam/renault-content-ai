/**
 * Brand Knowledge Library
 *
 * Provides access to client-specific brand guidelines and tone-of-voice rules.
 * Used by Content Writer Agent to ensure brand consistency.
 */

import brandData from '@/mcp-servers/brand-knowledge/brand-data.json'

/**
 * Get all brand guidelines
 */
export function getBrandGuidelines() {
  return brandData
}

/**
 * Validate text against client-specific tone-of-voice guidelines
 *
 * @param text - Content to validate
 * @returns Validation result with issues and score
 */
export function validateToneOfVoice(text: string): {
  valid: boolean
  issues: string[]
  score: number
} {
  const issues: string[] = []
  const avoidWords = brandData.toneOfVoice.avoidWords

  // Check for avoid words (marketing hyperbole)
  avoidWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    if (regex.test(text)) {
      issues.push(`Vermijd woord: "${word}"`)
    }
  })

  // Check for vague claims
  const vaguePatterns = [
    { pattern: /ongeveer/gi, message: 'Bevat "ongeveer" - wees specifieker' },
    { pattern: /mogelijk/gi, message: 'Bevat "mogelijk" - te vaag' },
    { pattern: /zou kunnen/gi, message: 'Bevat "zou kunnen" - gebruik feiten' },
    { pattern: /waarschijnlijk/gi, message: 'Bevat "waarschijnlijk" - te speculatief' },
  ]

  vaguePatterns.forEach(({ pattern, message }) => {
    if (pattern.test(text)) {
      issues.push(message)
    }
  })

  // Calculate score (100 - 15 points per issue)
  const score = Math.max(0, 100 - issues.length * 15)

  return {
    valid: score >= 70,
    issues,
    score,
  }
}

/**
 * Get target audience profile
 *
 * @param audience - Target audience key
 * @returns Audience profile with interests, pain points, and language preferences
 */
export function getAudienceProfile(audience: string) {
  return brandData.targetAudiences[
    audience as keyof typeof brandData.targetAudiences
  ]
}

/**
 * Get correct technical terminology
 */
export function getTechnicalTerminology() {
  return brandData.technicalTerminology
}

/**
 * Validate technical terminology usage
 *
 * @param text - Content to check
 * @returns List of terminology issues
 */
export function validateTerminology(text: string): string[] {
  const issues: string[] = []
  const { avoid } = brandData.technicalTerminology

  Object.entries(avoid).forEach(([term, correction]) => {
    const regex = new RegExp(`\\b${term}\\b`, 'gi')
    if (regex.test(text)) {
      issues.push(`Gebruik "${term}" niet - ${correction}`)
    }
  })

  return issues
}
