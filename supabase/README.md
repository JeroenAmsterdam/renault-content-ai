# Supabase Database Setup

This directory contains database migrations and seed data for the Renault Trucks Content Management System.

## Prerequisites

- Supabase account ([sign up here](https://supabase.com))
- Supabase project created
- Supabase CLI installed (optional but recommended)

## Quick Start

### Option 1: Using Supabase Dashboard (Recommended for first-time setup)

1. **Go to your Supabase project dashboard**
   - Navigate to: https://app.supabase.com/project/bqtntithhlxtwndvhsgz

2. **Run the migration**
   - Go to the SQL Editor
   - Copy the contents of `migrations/20241122000000_initial_schema.sql`
   - Paste and execute

3. **Run the seed data (optional)**
   - Still in SQL Editor
   - Copy the contents of `seed.sql`
   - Paste and execute

4. **Verify the tables**
   - Go to Table Editor
   - You should see: `facts`, `articles`, `article_versions`, `social_variants`, `compliance_logs`

### Option 2: Using Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref bqtntithhlxtwndvhsgz
   ```

4. **Run migrations**
   ```bash
   supabase db push
   ```

5. **Run seed data**
   ```bash
   supabase db reset
   # Or manually run seed.sql through the dashboard
   ```

## Database Schema Overview

### Tables

1. **facts** - Single source of truth for verified claims
   - Stores all verified information with sources
   - Confidence scores for reliability
   - Categories: technical, marketing, general, specification

2. **articles** - Main content storage
   - Full article content with metadata
   - Status tracking: draft → compliance_check → approved → published
   - Word count, topics, target audience

3. **article_versions** - Audit trail
   - Complete version history
   - Automatic versioning on content changes
   - Change tracking and reasons

4. **social_variants** - Platform-specific content
   - LinkedIn, Meta, Google variants
   - Platform-optimized content
   - Metadata for each platform

5. **compliance_logs** - Anti-hallucination tracking
   - Compliance check results
   - Issue detection and scoring
   - Agent version tracking

## Environment Variables

Make sure to set up your environment variables in `.env.local`:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://bqtntithhlxtwndvhsgz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Testing the Connection

Create a simple test file to verify the connection:

```typescript
// test-supabase.ts
import { supabase } from '@/lib/supabase/client'

async function testConnection() {
  const { data, error } = await supabase.from('facts').select('count')

  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('Connection successful! Facts count:', data)
  }
}

testConnection()
```

## Usage Examples

### Query Facts

```typescript
import { getFacts, getHighConfidenceFacts } from '@/lib/supabase/queries'

// Get all technical facts
const techFacts = await getFacts('technical')

// Get high-confidence facts (>= 0.9)
const reliableFacts = await getHighConfidenceFacts(0.9)
```

### Create Article

```typescript
import { createArticle } from '@/lib/supabase/queries'

const newArticle = await createArticle({
  title: 'New Article Title',
  content: 'Article content...',
  topic: 'sustainability',
  status: 'draft',
  metadata: {
    keywords: ['sustainable', 'transport']
  }
})
```

### Run Compliance Check

```typescript
import { getLatestComplianceLog } from '@/lib/supabase/queries'

const complianceResult = await getLatestComplianceLog(articleId)

if (complianceResult && !complianceResult.passed) {
  console.log('Compliance issues:', complianceResult.issues)
}
```

## Migrations

To create a new migration:

1. Create a new file in `migrations/` with the format: `YYYYMMDDHHMMSS_description.sql`
2. Write your SQL DDL statements
3. Run the migration using Supabase CLI or dashboard

## Row Level Security (RLS)

RLS is currently disabled for development. To enable in production:

1. Uncomment RLS policies in the migration file
2. Customize policies based on your authentication setup
3. Enable RLS on each table

## Troubleshooting

### Connection Issues

- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure API keys are valid

### Migration Errors

- Check SQL syntax
- Verify table/column names
- Ensure no conflicting constraints

### Type Errors

- Regenerate types: `npx supabase gen types typescript --project-id bqtntithhlxtwndvhsgz`
- Update `lib/supabase/database.types.ts`

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SQL Editor](https://app.supabase.com/project/bqtntithhlxtwndvhsgz/sql)
- [Supabase Table Editor](https://app.supabase.com/project/bqtntithhlxtwndvhsgz/editor)
