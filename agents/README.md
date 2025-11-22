# AI Agents

Multi-agent system for Renault Trucks content creation. Each agent has a specialized role in the content workflow.

## System Architecture

```
┌─────────────────────────────────────────────────┐
│          Content Creation Workflow              │
└─────────────────────────────────────────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Research Agent       │
         │  (Fact Gathering)      │
         └────────────────────────┘
                      │
                      ▼ verified facts
         ┌────────────────────────┐
         │   Writer Agent         │
         │  (Content Creation)    │
         └────────────────────────┘
                      │
                      ▼ draft content
         ┌────────────────────────┐
         │  Compliance Agent      │
         │ (Anti-Hallucination)   │
         └────────────────────────┘
                      │
                      ▼ approved content
         ┌────────────────────────┐
         │   Social Agent         │
         │ (Platform Variants)    │
         └────────────────────────┘
```

## Available Agents

### 1. Research Agent ✅ (Implemented)

**Purpose:** Gather verified facts about Renault Trucks topics

**Capabilities:**
- Web search for official Renault Trucks information
- Source verification and confidence scoring
- Automatic fact storage in database
- Anti-hallucination foundation

**Usage:**
```typescript
import { runResearchAgent } from '@/agents/research-agent'

const result = await runResearchAgent(
  'Renault Trucks E-Tech actieradius',
  ['elektrisch', 'range', 'batterij']
)

console.log(`Found ${result.facts.length} verified facts`)
```

**Test:**
```bash
npm run test:research
```

**Confidence Scoring:**
- 0.95-1.0: Direct quote from official Renault documentation
- 0.85-0.94: Information from official Renault website
- 0.75-0.84: Information from reliable automotive media with Renault source
- 0.70-0.74: Information from reliable media without direct Renault source
- <0.70: Marked as [NEEDS_VERIFICATION]

**Source Priority:**
1. renault-trucks.com (official website)
2. renault-trucks.nl (Dutch site)
3. Official Renault Trucks press releases
4. Technical specification sheets
5. Reliable automotive media

### 2. Writer Agent (Coming Soon)

**Purpose:** Create high-quality content based on verified facts

**Planned Capabilities:**
- Fact-based content generation
- SEO optimization
- Multiple content formats (articles, blog posts, product descriptions)
- Tone adaptation (professional, technical, marketing)

### 3. Compliance Agent (Coming Soon)

**Purpose:** Verify content accuracy and detect hallucinations

**Planned Capabilities:**
- Cross-reference claims with facts database
- Detect unverified claims
- Flag contradictory information
- Suggest corrections
- Compliance scoring

### 4. Social Agent (Coming Soon)

**Purpose:** Generate platform-specific content variants

**Planned Capabilities:**
- LinkedIn optimization (professional tone, hashtags)
- Meta/Facebook adaptation (engaging, visual)
- Google Ads copy (concise, CTA-focused)
- Platform-specific metadata

### 5. Coordinator Agent (Future)

**Purpose:** Orchestrate multi-agent workflows

**Planned Capabilities:**
- Workflow management
- Agent communication
- Error handling
- Progress tracking
- Result aggregation

## Agent Configuration

All agents share a common configuration via `/lib/anthropic/client.ts`:

```typescript
export const AGENT_MODELS = {
  research: 'claude-sonnet-4-20250514',
  writer: 'claude-sonnet-4-20250514',
  compliance: 'claude-sonnet-4-20250514',
  social: 'claude-sonnet-4-20250514',
}
```

## Testing

Each agent has its own test script in `/scripts`:

```bash
npm run test:research    # Test Research Agent
npm run test:writer      # Test Writer Agent (coming soon)
npm run test:compliance  # Test Compliance Agent (coming soon)
npm run test:social      # Test Social Agent (coming soon)
```

## Environment Variables

Required for all agents:

```bash
# Anthropic API
ANTHROPIC_API_KEY=your_api_key

# Supabase (for fact storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Development Guidelines

### Adding a New Agent

1. Create agent file: `/agents/{agent-name}-agent.ts`
2. Define types in `/types/agent-types.ts`
3. Create test script: `/scripts/test-{agent-name}-agent.ts`
4. Add npm script to `package.json`
5. Update this README
6. Write documentation

### Agent Best Practices

**DO:**
- Use verified facts from database
- Log all operations for debugging
- Handle errors gracefully
- Provide detailed confidence scores
- Document sources
- Use lower temperature (0.3) for factual tasks

**DON'T:**
- Generate specifications without sources
- Skip fact verification
- Use high temperature for factual content
- Ignore error handling
- Forget to log metrics

## Metrics & Monitoring

All agents track:
- Execution duration
- Success/failure rate
- Facts gathered/used
- Confidence scores
- Error messages

Access metrics via database:
```typescript
import { getDashboardStats } from '@/lib/supabase/queries'

const stats = await getDashboardStats()
```

## Future Improvements

- [ ] Agent communication protocol
- [ ] Workflow orchestration
- [ ] Real-time collaboration between agents
- [ ] Agent performance analytics
- [ ] A/B testing for different prompts
- [ ] Agent versioning and rollback
- [ ] Cost tracking per agent
- [ ] Rate limiting and queuing

## Resources

- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Agent Types Reference](/types/agent-types.ts)
