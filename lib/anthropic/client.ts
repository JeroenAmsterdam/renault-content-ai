/**
 * Anthropic Claude Client Configuration
 *
 * Centralized configuration for all Claude AI agent interactions.
 * Used by all agents in the multi-agent system.
 */

import Anthropic from '@anthropic-ai/sdk'

// Validate API key
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY environment variable is required')
}

/**
 * Main Anthropic client instance
 * Shared across all agents for efficiency
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

/**
 * Default model for all agents
 * Claude Sonnet 4 - Latest model with extended thinking and web search
 */
export const MODEL = 'claude-sonnet-4-20250514'

/**
 * Agent-specific model configurations
 */
export const AGENT_MODELS = {
  research: MODEL, // Research agent uses latest model for accuracy
  writer: MODEL, // Writer agent for content creation
  compliance: MODEL, // Compliance checking
  social: MODEL, // Social media variant generation
} as const

/**
 * Default parameters for agent calls
 */
export const DEFAULT_PARAMS = {
  maxTokens: 4000,
  temperature: 0.3, // Lower temp for more consistent, factual outputs
} as const

/**
 * Helper function to create a message with consistent error handling
 */
export async function createMessage(params: Anthropic.MessageCreateParams) {
  try {
    const response = await anthropic.messages.create(params)
    return response
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error('Anthropic API Error:', {
        status: error.status,
        message: error.message,
        type: error.type,
      })
    }
    throw error
  }
}
