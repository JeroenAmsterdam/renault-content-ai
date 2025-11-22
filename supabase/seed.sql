-- Seed data for Renault Trucks Content Management System
-- This file provides example data for development and testing

-- ============================================================================
-- FACTS - Verified information about Renault Trucks E-Tech
-- ============================================================================

INSERT INTO facts (claim, source, source_url, confidence_score, category, verified_by) VALUES
-- Technical specifications
('Renault Trucks E-Tech heeft een actieradius tot 300 kilometer',
 'Renault Trucks Official Specifications',
 'https://www.renault-trucks.com/nl/e-tech',
 0.98,
 'technical',
 'Technical Documentation Team'),

('De E-Tech is beschikbaar in verschillende gewichtsklasses van 16 tot 26 ton',
 'Renault Trucks E-Tech Range',
 'https://www.renault-trucks.com/nl/e-tech',
 0.97,
 'specification',
 'Product Team'),

('Laadtijd met 150kW snellader is ongeveer 1,5 uur',
 'Renault Trucks Charging Documentation',
 'https://www.renault-trucks.com/nl/e-tech/charging',
 0.95,
 'technical',
 'Technical Documentation Team'),

('Batterijcapaciteit varieert van 200 tot 400 kWh afhankelijk van het model',
 'Renault Trucks E-Tech Technical Specifications',
 'https://www.renault-trucks.com/nl/e-tech/specifications',
 0.96,
 'specification',
 'Engineering Team'),

-- Marketing claims
('Renault Trucks E-Tech reduceert CO2-uitstoot met 100% tijdens het rijden',
 'Renault Trucks Sustainability Report 2024',
 'https://www.renault-trucks.com/nl/sustainability',
 0.99,
 'marketing',
 'Marketing Team'),

('Tot 50% lagere operationele kosten ten opzichte van diesel over 5 jaar',
 'Renault Trucks TCO Analysis 2024',
 'https://www.renault-trucks.com/nl/e-tech/tco',
 0.92,
 'marketing',
 'Fleet Solutions Team'),

-- General information
('Renault Trucks is marktleider in elektrische distributietrucks in Europa',
 'European EV Truck Market Report Q3 2024',
 'https://www.example.com/market-report',
 0.89,
 'general',
 'Market Research Team'),

('Meer dan 500 Renault E-Tech trucks rijden momenteel in Nederland',
 'Renault Trucks Netherlands Fleet Statistics',
 'https://www.renault-trucks.com/nl/fleet-stats',
 0.91,
 'general',
 'Sales Team'),

('E-Tech is geschikt voor stadsdistributie en regionale transporten tot 300km',
 'Renault Trucks E-Tech Use Case Documentation',
 'https://www.renault-trucks.com/nl/e-tech/use-cases',
 0.97,
 'specification',
 'Product Team');

-- ============================================================================
-- ARTICLES - Example content pieces
-- ============================================================================

INSERT INTO articles (title, content, topic, target_audience, status, word_count, created_by, metadata) VALUES
-- Draft article
('TCO berekeningen voor elektrische vrachtwagens: Complete gids voor 2025',
 E'In deze uitgebreide gids behandelen we de Total Cost of Ownership (TCO) voor elektrische vrachtwagens.\n\nDe overstap naar elektrisch vervoer vereist een zorgvuldige financiële analyse. Hoewel de aanschafprijs hoger ligt, zijn de operationele kosten significant lager.\n\nBelangrijkste kostenfactoren:\n- Aanschafkosten en subsidies\n- Energiekosten vs. dieselkosten\n- Onderhoudskosten\n- Verzekeringen\n- Restwaarde\n\nOp basis van Renault Trucks analyse kunnen vlootbeheerders tot 50% besparen op operationele kosten over een periode van 5 jaar.',
 'TCO elektrisch',
 'fleet-managers',
 'draft',
 150,
 'content-agent-v1',
 '{"keywords": ["TCO", "elektrisch", "kosten", "fleet"], "seo_title": "TCO Elektrische Vrachtwagens 2025", "seo_description": "Complete gids voor TCO berekeningen elektrische trucks"}'),

-- Compliance check article
('Renault E-Tech: De toekomst van stadsdistributie',
 E'Stadsdistributie staat voor een revolutie. Steeds meer steden voeren zero-emissie zones in, waardoor elektrische trucks de enige optie worden voor leveringen in het stadscentrum.\n\nDe Renault Trucks E-Tech biedt een actieradius tot 300 kilometer, perfect geschikt voor dagelijkse distributierondes. Met een laadtijd van slechts 1,5 uur met een 150kW snellader, kan de truck tijdens de lunchpauze worden opgeladen.\n\nVoordelen voor stadsdistributie:\n- Zero emissies in de stad\n- Stille werking (geluidsreductie 50%)\n- Toegang tot alle zero-emissie zones\n- Lagere operationele kosten\n\nMeer dan 500 Renault E-Tech trucks rijden momenteel succesvol in Nederland.',
 'stadsdistributie',
 'logistics-managers',
 'compliance_check',
 180,
 'content-agent-v1',
 '{"keywords": ["stadsdistributie", "zero-emissie", "E-Tech"], "target_cities": ["Amsterdam", "Rotterdam", "Utrecht"]}'),

-- Approved article
('5 redenen waarom elektrische trucks uw vloot versterken',
 E'De transitie naar elektrisch transport is niet langer een vraag van "of", maar "wanneer". Hier zijn 5 redenen waarom elektrische trucks uw vloot direct kunnen versterken:\n\n1. **Kostenreductie**: Tot 50% lagere operationele kosten\n2. **Duurzaamheid**: 100% CO2-reductie tijdens het rijden\n3. **Toegankelijkheid**: Toegang tot alle zero-emissie zones\n4. **Betrouwbaarheid**: Minder onderdelen, minder onderhoud\n5. **Subsidies**: Aantrekkelijke aanschafsubsidies beschikbaar\n\nDe Renault Trucks E-Tech range biedt oplossingen van 16 tot 26 ton, geschikt voor diverse toepassingen.',
 'elektrische-vloot-voordelen',
 'fleet-managers',
 'approved',
 165,
 'content-agent-v1',
 '{"keywords": ["elektrisch", "vloot", "voordelen"], "content_type": "listicle"}');

-- ============================================================================
-- ARTICLE VERSIONS - Version history for one article
-- ============================================================================

-- Get the article ID for TCO article
DO $$
DECLARE
  article_uuid UUID;
BEGIN
  SELECT id INTO article_uuid FROM articles WHERE title LIKE 'TCO berekeningen%' LIMIT 1;

  IF article_uuid IS NOT NULL THEN
    INSERT INTO article_versions (article_id, content, version_number, changed_by, change_reason) VALUES
    (article_uuid,
     'Initial draft content about TCO for electric trucks...',
     1,
     'content-agent-v1',
     'Initial creation'),

    (article_uuid,
     'Revised content with more detailed cost breakdown...',
     2,
     'content-agent-v1',
     'Added detailed cost breakdown section');
  END IF;
END $$;

-- ============================================================================
-- SOCIAL VARIANTS - Platform-specific content
-- ============================================================================

-- Get article ID for social variants
DO $$
DECLARE
  article_uuid UUID;
BEGIN
  SELECT id INTO article_uuid FROM articles WHERE title LIKE '5 redenen%' LIMIT 1;

  IF article_uuid IS NOT NULL THEN
    -- LinkedIn variant
    INSERT INTO social_variants (article_id, platform, content, metadata) VALUES
    (article_uuid,
     'linkedin',
     E'🚛 5 redenen om uw vloot te versterken met elektrische trucks\n\n1️⃣ Kostenreductie tot 50%\n2️⃣ 100% CO2-reductie tijdens het rijden\n3️⃣ Toegang tot zero-emissie zones\n4️⃣ Lagere onderhoudskosten\n5️⃣ Aantrekkelijke subsidies\n\nDe Renault Trucks E-Tech: van 16 tot 26 ton. Klaar voor de toekomst.\n\n#ElektrischTransport #Duurzaamheid #FleetManagement #RenaultTrucks',
     '{"hashtags": ["ElektrischTransport", "Duurzaamheid", "FleetManagement"], "optimal_posting_time": "Tuesday 10:00"}'),

    -- Meta variant (Facebook/Instagram)
    (article_uuid,
     'meta',
     E'De toekomst is elektrisch! ⚡\n\nOntdek waarom steeds meer bedrijven kiezen voor elektrische trucks:\n\n✅ Tot 50% kostenbesparing\n✅ Volledig emissievrij\n✅ Toegang tot alle zones\n✅ Minder onderhoud\n✅ Subsidies beschikbaar\n\nRenault Trucks E-Tech: sterker, schoner, slimmer.\n\nLees meer op onze website! 👉',
     '{"content_type": "image_post", "call_to_action": "learn_more"}'),

    -- Google Ads variant
    (article_uuid,
     'google',
     E'Elektrische Vrachtwagens | Tot 50% Kostenbesparing\nRenault Trucks E-Tech - 16-26 ton. Zero emissies. Subsidies beschikbaar.\nOntdek de voordelen van elektrisch transport voor uw vloot.',
     '{"ad_type": "search", "keywords": ["elektrische vrachtwagen", "elektrische truck kopen", "zero emissie transport"]}');
  END IF;
END $$;

-- ============================================================================
-- COMPLIANCE LOGS - Example compliance checks
-- ============================================================================

-- Get article IDs for compliance logs
DO $$
DECLARE
  draft_article_uuid UUID;
  approved_article_uuid UUID;
BEGIN
  SELECT id INTO draft_article_uuid FROM articles WHERE status = 'draft' LIMIT 1;
  SELECT id INTO approved_article_uuid FROM articles WHERE status = 'approved' LIMIT 1;

  -- Failed compliance check (draft article)
  IF draft_article_uuid IS NOT NULL THEN
    INSERT INTO compliance_logs (article_id, passed, overall_score, issues, agent_version) VALUES
    (draft_article_uuid,
     false,
     72.5,
     '[
       {
         "type": "unverified_claim",
         "severity": "high",
         "claim": "50% lagere kosten",
         "message": "Claim needs source verification",
         "line": 12
       },
       {
         "type": "missing_source",
         "severity": "medium",
         "claim": "Renault Trucks analyse",
         "message": "No source URL provided",
         "line": 15
       }
     ]'::jsonb,
     'compliance-agent-v1.2');
  END IF;

  -- Passed compliance check (approved article)
  IF approved_article_uuid IS NOT NULL THEN
    INSERT INTO compliance_logs (article_id, passed, overall_score, issues, agent_version) VALUES
    (approved_article_uuid,
     true,
     94.8,
     '[]'::jsonb,
     'compliance-agent-v1.2');
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Verify all data was inserted correctly
DO $$
DECLARE
  fact_count INT;
  article_count INT;
  version_count INT;
  social_count INT;
  compliance_count INT;
BEGIN
  SELECT COUNT(*) INTO fact_count FROM facts;
  SELECT COUNT(*) INTO article_count FROM articles;
  SELECT COUNT(*) INTO version_count FROM article_versions;
  SELECT COUNT(*) INTO social_count FROM social_variants;
  SELECT COUNT(*) INTO compliance_count FROM compliance_logs;

  RAISE NOTICE 'Seed data inserted successfully:';
  RAISE NOTICE '  Facts: %', fact_count;
  RAISE NOTICE '  Articles: %', article_count;
  RAISE NOTICE '  Article Versions: %', version_count;
  RAISE NOTICE '  Social Variants: %', social_count;
  RAISE NOTICE '  Compliance Logs: %', compliance_count;
END $$;
