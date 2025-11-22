/**
 * Type Definitions for AI Agents
 *
 * Shared types across all agents in the multi-agent content system.
 */

// ============================================================================
// RESEARCH AGENT TYPES
// ============================================================================

export interface Fact {
  claim: string
  source: string
  sourceUrl?: string
  confidence: number
  category: 'technical' | 'marketing' | 'general' | 'specification'
}

export interface ResearchResult {
  facts: Fact[]
  needsVerification: string[]
  summary: string
  duration: number
}

// ============================================================================
// VALIDATOR AGENT TYPES
// ============================================================================

export interface ValidationResult {
  approved: Fact[]
  rejected: Array<Fact & { rejectionReason: string }>
  summary: string
  approvalRate: number
}

// ============================================================================
// AGENT CONFIGURATION
// ============================================================================

export interface AgentConfig {
  name: string
  model: string
  maxTokens: number
  temperature: number
}

export interface AgentMetrics {
  startTime: number
  endTime: number
  duration: number
  tokensUsed?: number
  success: boolean
  errors?: string[]
}

// ============================================================================
// CONTENT CREATION TYPES
// ============================================================================

export interface ContentRequest {
  topic: string
  targetAudience: string
  keywords: string[]
  tone?: 'professional' | 'casual' | 'technical' | 'marketing'
  length?: 'short' | 'medium' | 'long'
  facts?: Fact[]
}

export interface ContentResult {
  title: string
  content: string
  wordCount: number
  metadata: {
    keywords: string[]
    factsUsed: string[]
    confidence: number
  }
  duration: number
}

// ============================================================================
// COMPLIANCE CHECK TYPES
// ============================================================================

export interface ComplianceIssue {
  type: 'unverified_claim' | 'missing_source' | 'low_confidence' | 'hallucination_detected'
  severity: 'low' | 'medium' | 'high' | 'critical'
  claim?: string
  message: string
  line?: number
  suggestion?: string
}

export interface ComplianceResult {
  passed: boolean
  overallScore: number
  issues: ComplianceIssue[]
  checkedClaims: number
  verifiedClaims: number
  duration: number
}

// ============================================================================
// SOCIAL MEDIA TYPES
// ============================================================================

export type SocialPlatform = 'linkedin' | 'meta' | 'google'

export interface SocialVariantRequest {
  articleId: string
  platform: SocialPlatform
  originalContent: string
  maxLength?: number
}

export interface SocialVariant {
  platform: SocialPlatform
  content: string
  metadata: {
    hashtags?: string[]
    callToAction?: string
    optimalPostingTime?: string
  }
}

export interface SocialVariantResult {
  variants: SocialVariant[]
  duration: number
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

export interface WorkflowStep {
  name: string
  agent: 'research' | 'writer' | 'compliance' | 'social'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  result?: any
  error?: string
  duration?: number
}

export interface ContentWorkflow {
  id: string
  topic: string
  steps: WorkflowStep[]
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
}

// ============================================================================
// AGENT RESPONSE TYPES
// ============================================================================

export interface AgentResponse<T> {
  success: boolean
  data?: T
  error?: string
  metrics: AgentMetrics
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type AgentType = 'research' | 'writer' | 'compliance' | 'social' | 'coordinator'

export interface AgentStatus {
  name: AgentType
  active: boolean
  tasksCompleted: number
  averageDuration: number
  lastError?: string
}
