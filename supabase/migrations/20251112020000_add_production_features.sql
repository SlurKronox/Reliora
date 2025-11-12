/*
  # Add Production Features (Credits, GA4, Public Links, Branding, Billing)

  1. New Columns in workspaces table
    - brandPrimary (text, nullable) - Primary brand color hex
    - brandAccent (text, nullable) - Accent brand color hex
    - brandLogoUrl (text, nullable) - URL to brand logo
    - creditLimit (integer, default 1000) - Monthly credit limit
    - creditUsed (integer, default 0) - Credits used in current period
    - creditPeriodStart (timestamptz, default now()) - Start of current credit period
    - plan (text, nullable) - Subscription plan: starter|pro|agency
    - stripeCustomerId (text, nullable) - Stripe customer ID
    - stripeSubscriptionId (text, nullable) - Stripe subscription ID

  2. New Columns in reports table
    - aiModel (text, nullable) - AI model used for generation
    - costCredits (integer, nullable) - Credits consumed by this report
    - useRealData (boolean, default false) - Whether real GA4 data was used

  3. New Columns in clients table
    - ga4PropertyId (text, nullable) - Google Analytics 4 property ID
    - ga4PropertyDisplay (text, nullable) - Display name for GA4 property

  4. New Tables
    - google_connections - OAuth tokens for GA4 access per workspace
    - ga4_report_cache - Cache GA4 data for 12 hours
    - public_reports - Public shareable links for reports
    - credit_ledger - Audit trail of credit usage

  5. Security
    - Enable RLS on all new tables
    - Add policies for workspace-scoped access
*/

-- Add new columns to workspaces table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'brand_primary'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN brand_primary TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'brand_accent'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN brand_accent TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'brand_logo_url'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN brand_logo_url TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'credit_limit'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN credit_limit INTEGER DEFAULT 1000 NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'credit_used'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN credit_used INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'credit_period_start'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN credit_period_start TIMESTAMPTZ DEFAULT now() NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'plan'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN plan TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workspaces' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE workspaces ADD COLUMN stripe_subscription_id TEXT;
  END IF;
END $$;

-- Add new columns to reports table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'ai_model'
  ) THEN
    ALTER TABLE reports ADD COLUMN ai_model TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'cost_credits'
  ) THEN
    ALTER TABLE reports ADD COLUMN cost_credits INTEGER;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'use_real_data'
  ) THEN
    ALTER TABLE reports ADD COLUMN use_real_data BOOLEAN DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add new columns to clients table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'ga4_property_id'
  ) THEN
    ALTER TABLE clients ADD COLUMN ga4_property_id TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'ga4_property_display'
  ) THEN
    ALTER TABLE clients ADD COLUMN ga4_property_display TEXT;
  END IF;
END $$;

-- Create google_connections table
CREATE TABLE IF NOT EXISTS google_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id)
);

-- Create ga4_report_cache table
CREATE TABLE IF NOT EXISTS ga4_report_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  ga4_property_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(workspace_id, client_id, ga4_property_id, period_start, period_end)
);

-- Create public_reports table
CREATE TABLE IF NOT EXISTS public_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  revoked_at TIMESTAMPTZ,
  UNIQUE(report_id)
);

-- Create credit_ledger table
CREATE TABLE IF NOT EXISTS credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga4_report_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_connections
CREATE POLICY "Users can view own workspace Google connection"
  ON google_connections FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own workspace Google connection"
  ON google_connections FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for ga4_report_cache
CREATE POLICY "Users can view own workspace GA4 cache"
  ON ga4_report_cache FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own workspace GA4 cache"
  ON ga4_report_cache FOR ALL
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for public_reports (anyone with token can view)
CREATE POLICY "Anyone can view non-revoked public reports"
  ON public_reports FOR SELECT
  TO anon, authenticated
  USING (revoked_at IS NULL);

CREATE POLICY "Users can manage own workspace public reports"
  ON public_reports FOR ALL
  TO authenticated
  USING (
    report_id IN (
      SELECT r.id FROM reports r
      JOIN clients c ON c.id = r.client_id
      WHERE c.workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    report_id IN (
      SELECT r.id FROM reports r
      JOIN clients c ON c.id = r.client_id
      WHERE c.workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies for credit_ledger
CREATE POLICY "Users can view own workspace credit ledger"
  ON credit_ledger FOR SELECT
  TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_connections_workspace ON google_connections(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ga4_cache_workspace_client ON ga4_report_cache(workspace_id, client_id);
CREATE INDEX IF NOT EXISTS idx_ga4_cache_created ON ga4_report_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_public_reports_token ON public_reports(token) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_credit_ledger_workspace ON credit_ledger(workspace_id, created_at DESC);
