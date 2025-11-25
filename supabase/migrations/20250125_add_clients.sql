-- Multi-client agency platform migration
-- Adds client isolation for multi-tenant content platform

-- Enable pgcrypto for bcrypt password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Clients table (each client is a separate organization)
CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  brand_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add client_id to articles
ALTER TABLE articles
ADD COLUMN client_id uuid REFERENCES clients(id);

-- Add client_id to facts (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'facts') THEN
    ALTER TABLE facts ADD COLUMN client_id uuid REFERENCES clients(id);
  END IF;
END $$;

-- Row Level Security: Users only see their client's data
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Client isolation for articles"
ON articles
FOR ALL
USING (client_id::text = current_setting('app.current_client_id', true));

-- Insert initial client (Renault Trucks)
INSERT INTO clients (name, password_hash, brand_settings) VALUES
(
  'Renault Trucks',
  crypt('renault2025', gen_salt('bf')),
  '{
    "name": "Renault Trucks",
    "colors": {
      "primary": "#0000FF",
      "accent": "#E3021B",
      "secondary": "#000000"
    },
    "toneOfVoice": {
      "formality": "je",
      "style": "Zakelijk, informatief, data-driven",
      "characteristics": ["Direct", "Professioneel", "Betrouwbaar"],
      "avoidWords": ["revolutionair", "beste", "uniek"]
    },
    "terminology": {
      "E-Tech": "hoofdletter T verplicht",
      "actieradius": "niet range"
    }
  }'::jsonb
);

-- Example: Add another client
-- INSERT INTO clients (name, password_hash, brand_settings) VALUES
-- (
--   'Olympisch Stadion',
--   crypt('olympisch2025', gen_salt('bf')),
--   '{
--     "name": "Olympisch Stadion",
--     "colors": {
--       "primary": "#FF6B35",
--       "accent": "#004E89"
--     }
--   }'::jsonb
-- );

-- Create index for performance
CREATE INDEX idx_articles_client_id ON articles(client_id);
CREATE INDEX idx_clients_name ON clients(name);
