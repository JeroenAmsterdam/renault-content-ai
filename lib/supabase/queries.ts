/**
 * Supabase Query Helper Functions
 *
 * Type-safe database queries for the Renault Trucks Content Management System.
 * These functions provide a clean API for common database operations.
 */

import { supabase, getSupabaseAdmin, unwrapSupabaseResponse } from './client'
import type {
  Fact,
  Article,
  ArticleInsert,
  ArticleUpdate,
  ArticleVersion,
  SocialVariant,
  SocialVariantInsert,
  ComplianceLog,
  ComplianceLogInsert,
  FactCategory,
  ArticleStatus,
  SocialPlatform,
  ArticleFull,
} from './database.types'

// ============================================================================
// FACTS QUERIES
// ============================================================================

/**
 * Get all facts, optionally filtered by category
 */
export async function getFacts(category?: FactCategory) {
  let query = supabase
    .from('facts')
    .select('*')
    .order('confidence_score', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Fact[]
}

/**
 * Get facts with high confidence (>= threshold)
 */
export async function getHighConfidenceFacts(threshold: number = 0.9) {
  const { data, error } = await supabase
    .from('facts')
    .select('*')
    .gte('confidence_score', threshold)
    .order('confidence_score', { ascending: false })

  if (error) throw error
  return data as Fact[]
}

/**
 * Search facts by claim text
 */
export async function searchFacts(searchTerm: string) {
  const { data, error } = await supabase
    .from('facts')
    .select('*')
    .ilike('claim', `%${searchTerm}%`)
    .order('confidence_score', { ascending: false })

  if (error) throw error
  return data as Fact[]
}

/**
 * Get a single fact by ID
 */
export async function getFact(id: string) {
  const { data, error } = await supabase
    .from('facts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Fact
}

// ============================================================================
// ARTICLES QUERIES
// ============================================================================

/**
 * Get all articles, optionally filtered by status
 */
export async function getArticles(status?: ArticleStatus) {
  let query = supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Article[]
}

/**
 * Get a single article by ID
 */
export async function getArticle(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Article
}

/**
 * Get article with all related data (compliance logs, social variants, versions)
 */
export async function getArticleFull(id: string) {
  const { data, error } = await supabase
    .from('articles')
    .select(
      `
      *,
      compliance_logs(*),
      social_variants(*),
      article_versions(*)
    `
    )
    .eq('id', id)
    .single()

  if (error) throw error
  return data as ArticleFull
}

/**
 * Create a new article (requires admin privileges)
 */
export async function createArticle(article: ArticleInsert) {
  const admin = getSupabaseAdmin()

  const { data, error } = await (admin
    .from('articles') as any)
    .insert(article)
    .select()
    .single()

  if (error) throw error
  return data as Article
}

/**
 * Update an article (requires admin privileges)
 */
export async function updateArticle(id: string, updates: ArticleUpdate) {
  const admin = getSupabaseAdmin()

  const { data, error } = await (admin
    .from('articles') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Article
}

/**
 * Delete an article (requires admin privileges)
 */
export async function deleteArticle(id: string) {
  const admin = getSupabaseAdmin()

  const { error } = await admin.from('articles').delete().eq('id', id)

  if (error) throw error
  return true
}

/**
 * Search articles by title or content
 */
export async function searchArticles(searchTerm: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Article[]
}

/**
 * Get articles by topic
 */
export async function getArticlesByTopic(topic: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('topic', topic)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Article[]
}

// ============================================================================
// ARTICLE VERSIONS QUERIES
// ============================================================================

/**
 * Get all versions for an article
 */
export async function getArticleVersions(articleId: string) {
  const { data, error } = await supabase
    .from('article_versions')
    .select('*')
    .eq('article_id', articleId)
    .order('version_number', { ascending: false })

  if (error) throw error
  return data as ArticleVersion[]
}

/**
 * Get a specific version of an article
 */
export async function getArticleVersion(articleId: string, versionNumber: number) {
  const { data, error } = await supabase
    .from('article_versions')
    .select('*')
    .eq('article_id', articleId)
    .eq('version_number', versionNumber)
    .single()

  if (error) throw error
  return data as ArticleVersion
}

// ============================================================================
// SOCIAL VARIANTS QUERIES
// ============================================================================

/**
 * Get all social variants for an article
 */
export async function getSocialVariants(articleId: string) {
  const { data, error } = await supabase
    .from('social_variants')
    .select('*')
    .eq('article_id', articleId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as SocialVariant[]
}

/**
 * Get social variant for a specific platform
 */
export async function getSocialVariantByPlatform(
  articleId: string,
  platform: SocialPlatform
) {
  const { data, error } = await supabase
    .from('social_variants')
    .select('*')
    .eq('article_id', articleId)
    .eq('platform', platform)
    .single()

  if (error) throw error
  return data as SocialVariant
}

/**
 * Create a social variant (requires admin privileges)
 */
export async function createSocialVariant(variant: SocialVariantInsert) {
  const admin = getSupabaseAdmin()

  const { data, error } = await (admin
    .from('social_variants') as any)
    .insert(variant)
    .select()
    .single()

  if (error) throw error
  return data as SocialVariant
}

/**
 * Delete a social variant (requires admin privileges)
 */
export async function deleteSocialVariant(id: string) {
  const admin = getSupabaseAdmin()

  const { error } = await admin.from('social_variants').delete().eq('id', id)

  if (error) throw error
  return true
}

// ============================================================================
// COMPLIANCE LOGS QUERIES
// ============================================================================

/**
 * Get all compliance logs for an article
 */
export async function getComplianceLogs(articleId: string) {
  const { data, error } = await supabase
    .from('compliance_logs')
    .select('*')
    .eq('article_id', articleId)
    .order('checked_at', { ascending: false })

  if (error) throw error
  return data as ComplianceLog[]
}

/**
 * Get the latest compliance log for an article
 */
export async function getLatestComplianceLog(articleId: string) {
  const { data, error } = await supabase
    .from('compliance_logs')
    .select('*')
    .eq('article_id', articleId)
    .order('checked_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found
  return data as ComplianceLog | null
}

/**
 * Create a compliance log (requires admin privileges)
 */
export async function createComplianceLog(log: ComplianceLogInsert) {
  const admin = getSupabaseAdmin()

  const { data, error } = await (admin
    .from('compliance_logs') as any)
    .insert(log)
    .select()
    .single()

  if (error) throw error
  return data as ComplianceLog
}

/**
 * Get failed compliance checks
 */
export async function getFailedComplianceChecks() {
  const { data, error } = await supabase
    .from('compliance_logs')
    .select(
      `
      *,
      articles(id, title, status)
    `
    )
    .eq('passed', false)
    .order('checked_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================================
// WORKFLOW HELPERS
// ============================================================================

/**
 * Complete workflow: Create article, run compliance check, create social variants
 */
export async function createArticleWithWorkflow(
  article: ArticleInsert,
  runCompliance: boolean = true
) {
  const admin = getSupabaseAdmin()

  // 1. Create article
  const newArticle = await createArticle(article)

  // 2. Run compliance check if requested (placeholder - actual implementation would call compliance agent)
  if (runCompliance) {
    // This would be replaced with actual compliance check logic
    console.log(`Running compliance check for article ${newArticle.id}`)
  }

  return newArticle
}

/**
 * Get articles requiring compliance check
 */
export async function getArticlesAwaitingCompliance() {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'compliance_check')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Article[]
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const [
    totalArticles,
    draftArticles,
    publishedArticles,
    failedCompliance,
    totalFacts,
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'draft'),
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('compliance_logs')
      .select('*', { count: 'exact', head: true })
      .eq('passed', false),
    supabase.from('facts').select('*', { count: 'exact', head: true }),
  ])

  return {
    totalArticles: totalArticles.count || 0,
    draftArticles: draftArticles.count || 0,
    publishedArticles: publishedArticles.count || 0,
    failedCompliance: failedCompliance.count || 0,
    totalFacts: totalFacts.count || 0,
  }
}
