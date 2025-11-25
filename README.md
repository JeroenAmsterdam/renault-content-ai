# Lebowski Labs - AI Content Platform

Enterprise content creation platform met zero-hallucination enforcement.

## Features

- **Multi-client support** - Isolated workspaces for multiple clients with custom branding
- **Zero-hallucination** - 4-layer verification system (Research → Validation → Writing → Compliance)
- **Custom brand settings per client** - Each client maintains their own tone-of-voice and guidelines
- **AI-powered content generation** - Powered by Claude AI with specialized agent architecture

Built for marketing agencies.

## Tech Stack

- **Framework:** Next.js 16 (App Router with Turbopack)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **AI Integration:** Anthropic Claude API (@anthropic-ai/sdk)
- **Authentication:** HTTP Basic Auth + Session-based client isolation
- **Validation:** Zod

## Agent Architecture

The platform uses a multi-agent system where specialized AI agents collaborate:

1. **Research Agent** - Gathers facts from web sources and custom URLs
2. **Fact Validator** - Verifies accuracy and assigns confidence scores
3. **Content Writer** - Creates SEO-optimized articles using only approved facts
4. **Compliance Checker** - Validates brand guidelines and tone-of-voice
5. **Orchestrator** - Coordinates the entire workflow

## Project Structure

```
/app                    # Next.js pages and routing (App Router)
  /api                 # API routes
  /articles            # Article listing and detail pages
  /create              # Article creation form
  /login               # Client authentication
/agents                # AI agent implementations
/components            # React components
  /ui                  # shadcn UI components
/lib                   # Utility functions and helpers
/supabase              # Database migrations and seeds
/mcp-servers           # MCP server for brand knowledge
/types                 # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Anthropic API key ([get one here](https://console.anthropic.com/))
- Supabase project ([create one here](https://supabase.com/))

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd renault-content-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and add your credentials:
   ```
   ANTHROPIC_API_KEY=your_anthropic_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SITE_PASSWORD=your_site_password
   ```

4. **Set up database**

   Run migrations in your Supabase dashboard SQL editor:
   ```bash
   # Execute files in order:
   supabase/migrations/20241122000000_initial_schema.sql
   supabase/migrations/20250125_add_clients.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:*` - Run individual agent tests

## Multi-Client Architecture

Each client has:
- **Isolated data** - Row Level Security ensures clients only see their own content
- **Custom branding** - Brand settings stored in database (colors, tone-of-voice)
- **Unique authentication** - Organization name + password login
- **Independent workflows** - Articles, facts, and metadata are client-specific

## Development Notes

- Uses TypeScript strict mode for enhanced type safety
- Server components by default; use `"use client"` directive when needed
- Tailwind CSS v4 with modern @theme inline syntax
- All database queries use RLS policies for security
- Token usage optimization to stay within API rate limits

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## License

Proprietary - Lebowski Labs
