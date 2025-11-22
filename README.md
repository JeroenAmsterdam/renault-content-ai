# Renault Trucks Content System

A multi-agent AI content creation system for Renault Trucks, powered by Claude AI. This system uses specialized AI agents that collaborate to create, manage, and optimize high-quality content for the trucking industry.

## Overview

This Next.js 14 application provides the infrastructure for a sophisticated multi-agent system where different AI agents work together to produce comprehensive content including marketing materials, technical documentation, and industry articles.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **AI Integration:** Anthropic Claude API (@anthropic-ai/sdk)
- **Validation:** Zod
- **Font:** Inter (Google Fonts)

## Project Structure

```
/app              # Next.js pages and routing (App Router)
/components       # React components
  /ui            # shadcn UI components
/lib             # Utility functions and helpers
/agents          # AI agent implementations (to be built)
/types           # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Anthropic API key ([get one here](https://console.anthropic.com/))

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

   Then edit `.env.local` and add your API keys:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Design System

### Colors

The application uses Renault Trucks brand colors:

- **Primary Yellow:** `#FFD100` - Used for CTAs and accents
- **Primary Black:** `#000000` - Primary text and backgrounds
- **Neutral Grays:** Standard Tailwind gray scale

These colors are configured in `app/globals.css` and available as Tailwind utilities.

## Next Steps

- [ ] Implement agent architecture in `/agents`
- [ ] Build dashboard UI for content management
- [ ] Create agent coordination logic
- [ ] Add content templates and workflows
- [ ] Implement authentication and user management

## Development Notes

- Uses TypeScript strict mode for enhanced type safety
- Server components by default; use `"use client"` directive when needed
- Tailwind CSS v4 with modern @theme inline syntax
- shadcn/ui components can be added with: `npx shadcn@latest add <component>`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Anthropic Claude API](https://docs.anthropic.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## License

Proprietary - Renault Trucks
