-- Initial database schema for Renault Trucks Content Management System
-- Migration: 20241122000000_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- FACTS TABLE
-- Single source of truth for all verified claims and information
-- ============================================================================
CREATE TABLE facts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  category TEXT CHECK (category IN ('technical', 'marketing', 'general', 'specification')),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE facts IS 'Verified facts and claims with sources for content creation';
COMMENT ON COLUMN facts.confidence_score IS 'Confidence level from 0.00 to 1.00';
COMMENT ON COLUMN facts.category IS 'Classification of the fact type';

-- ============================================================================
-- ARTICLES TABLE
-- Main content storage with metadata and status tracking
-- ============================================================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  topic TEXT NOT NULL,
  target_audience TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'compliance_check', 'approved', 'published')),
  word_count INTEGER,
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE articles IS 'Main articles storage with full content and metadata';
COMMENT ON COLUMN articles.status IS 'Content lifecycle status';
COMMENT ON COLUMN articles.metadata IS 'Additional metadata: keywords, SEO, tags, etc.';

-- ============================================================================
-- ARTICLE VERSIONS TABLE
-- Complete audit trail for all article changes
-- ============================================================================
CREATE TABLE article_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  changed_by TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  change_reason TEXT
);

COMMENT ON TABLE article_versions IS 'Version history and audit trail for articles';
COMMENT ON COLUMN article_versions.version_number IS 'Sequential version number per article';

-- ============================================================================
-- SOCIAL VARIANTS TABLE
-- Platform-specific content variations (LinkedIn, Meta, Google)
-- ============================================================================
CREATE TABLE social_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'meta', 'google')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

COMMENT ON TABLE social_variants IS 'Platform-optimized content variants for social media';
COMMENT ON COLUMN social_variants.platform IS 'Social media platform: linkedin, meta, or google';

-- ============================================================================
-- COMPLIANCE LOGS TABLE
-- Anti-hallucination tracking and compliance verification
-- ============================================================================
CREATE TABLE compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  passed BOOLEAN NOT NULL,
  overall_score DECIMAL(5,2),
  issues JSONB DEFAULT '[]'::jsonb,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  agent_version TEXT
);

COMMENT ON TABLE compliance_logs IS 'Compliance checks and hallucination detection logs';
COMMENT ON COLUMN compliance_logs.issues IS 'Array of detected issues with details';
COMMENT ON COLUMN compliance_logs.overall_score IS 'Overall compliance score (0-100)';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Articles indexes
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_topic ON articles(topic);

-- Facts indexes
CREATE INDEX idx_facts_category ON facts(category);
CREATE INDEX idx_facts_confidence ON facts(confidence_score DESC);
CREATE INDEX idx_facts_created_at ON facts(created_at DESC);

-- Compliance logs indexes
CREATE INDEX idx_compliance_article ON compliance_logs(article_id);
CREATE INDEX idx_compliance_passed ON compliance_logs(passed);
CREATE INDEX idx_compliance_checked_at ON compliance_logs(checked_at DESC);

-- Social variants indexes
CREATE INDEX idx_social_article ON social_variants(article_id);
CREATE INDEX idx_social_platform ON social_variants(platform);

-- Article versions indexes
CREATE INDEX idx_versions_article ON article_versions(article_id, version_number DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for articles updated_at
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create article version on update
CREATE OR REPLACE FUNCTION create_article_version()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create version if content changed
  IF OLD.content IS DISTINCT FROM NEW.content THEN
    INSERT INTO article_versions (article_id, content, version_number, changed_by)
    VALUES (
      OLD.id,
      OLD.content,
      COALESCE((
        SELECT MAX(version_number) + 1
        FROM article_versions
        WHERE article_id = OLD.id
      ), 1),
      NEW.created_by
    );
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic article versioning
CREATE TRIGGER create_article_version_trigger
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION create_article_version();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Note: Disabled by default, enable based on authentication requirements
-- ============================================================================

-- ALTER TABLE facts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE article_versions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE social_variants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;

-- Example policy (uncomment and customize as needed):
-- CREATE POLICY "Allow public read access to published articles"
--   ON articles FOR SELECT
--   USING (status = 'published');
