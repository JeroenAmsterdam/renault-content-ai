/**
 * Database Type Definitions
 *
 * TypeScript types for all Supabase tables and their relationships.
 * These types ensure type safety when working with database queries.
 *
 * Note: In production, these types can be auto-generated using:
 * npx supabase gen types typescript --project-id <project-id> > lib/supabase/database.types.ts
 */

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Fact {
  id: string
  claim: string
  source: string
  source_url: string | null
  confidence_score: number
  category: FactCategory
  verified_at: string
  verified_by: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface Article {
  id: string
  title: string
  content: string
  topic: string
  target_audience: string | null
  status: ArticleStatus
  word_count: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  metadata: ArticleMetadata
}

export interface ArticleVersion {
  id: string
  article_id: string
  content: string
  version_number: number
  changed_by: string | null
  changed_at: string
  change_reason: string | null
}

export interface SocialVariant {
  id: string
  article_id: string
  platform: SocialPlatform
  content: string
  created_at: string
  metadata: SocialMetadata
}

export interface ComplianceLog {
  id: string
  article_id: string
  passed: boolean
  overall_score: number | null
  issues: ComplianceIssue[]
  checked_at: string
  agent_version: string | null
}

// ============================================================================
// ENUM TYPES
// ============================================================================

export type FactCategory = 'technical' | 'marketing' | 'general' | 'specification'

export type ArticleStatus = 'draft' | 'compliance_check' | 'approved' | 'published'

export type SocialPlatform = 'linkedin' | 'meta' | 'google'

// ============================================================================
// METADATA TYPES
// ============================================================================

export interface ArticleMetadata {
  keywords?: string[]
  seo_title?: string
  seo_description?: string
  tags?: string[]
  content_type?: string
  target_cities?: string[]
  [key: string]: any
}

export interface SocialMetadata {
  hashtags?: string[]
  optimal_posting_time?: string
  content_type?: string
  call_to_action?: string
  ad_type?: string
  keywords?: string[]
  [key: string]: any
}

export interface ComplianceIssue {
  type: ComplianceIssueType
  severity: 'low' | 'medium' | 'high' | 'critical'
  claim?: string
  message: string
  line?: number
  suggestion?: string
}

export type ComplianceIssueType =
  | 'unverified_claim'
  | 'missing_source'
  | 'low_confidence'
  | 'hallucination_detected'
  | 'contradictory_information'
  | 'outdated_information'
  | 'tone_violation'
  | 'factual_error'

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export type FactInsert = Omit<Fact, 'id' | 'created_at' | 'verified_at'> & {
  id?: string
  verified_at?: string
  created_at?: string
}

export type ArticleInsert = Omit<Article, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type ArticleVersionInsert = Omit<ArticleVersion, 'id' | 'changed_at'> & {
  id?: string
  changed_at?: string
}

export type SocialVariantInsert = Omit<SocialVariant, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type ComplianceLogInsert = Omit<ComplianceLog, 'id' | 'checked_at'> & {
  id?: string
  checked_at?: string
}

// ============================================================================
// UPDATE TYPES (for updating records)
// ============================================================================

export type FactUpdate = Partial<Omit<Fact, 'id' | 'created_at'>>

export type ArticleUpdate = Partial<Omit<Article, 'id' | 'created_at'>>

export type ArticleVersionUpdate = Partial<Omit<ArticleVersion, 'id' | 'article_id'>>

export type SocialVariantUpdate = Partial<Omit<SocialVariant, 'id' | 'article_id'>>

export type ComplianceLogUpdate = Partial<Omit<ComplianceLog, 'id' | 'article_id'>>

// ============================================================================
// QUERY RESULT TYPES (with joins)
// ============================================================================

export interface ArticleWithCompliance extends Article {
  compliance_logs: ComplianceLog[]
}

export interface ArticleWithSocial extends Article {
  social_variants: SocialVariant[]
}

export interface ArticleWithVersions extends Article {
  article_versions: ArticleVersion[]
}

export interface ArticleFull extends Article {
  compliance_logs: ComplianceLog[]
  social_variants: SocialVariant[]
  article_versions: ArticleVersion[]
}

// ============================================================================
// DATABASE SCHEMA TYPE (for Supabase client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      facts: {
        Row: Fact
        Insert: FactInsert
        Update: FactUpdate
      }
      articles: {
        Row: Article
        Insert: ArticleInsert
        Update: ArticleUpdate
      }
      article_versions: {
        Row: ArticleVersion
        Insert: ArticleVersionInsert
        Update: ArticleVersionUpdate
      }
      social_variants: {
        Row: SocialVariant
        Insert: SocialVariantInsert
        Update: SocialVariantUpdate
      }
      compliance_logs: {
        Row: ComplianceLog
        Insert: ComplianceLogInsert
        Update: ComplianceLogUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      fact_category: FactCategory
      article_status: ArticleStatus
      social_platform: SocialPlatform
    }
  }
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
