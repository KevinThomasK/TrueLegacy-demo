-- Create enum types for roles and statuses
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'sales');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'converted', 'lost');
CREATE TYPE activity_type AS ENUM ('call', 'email', 'meeting', 'note', 'status_change');
CREATE TYPE assignment_strategy AS ENUM ('round_robin', 'load_based', 'custom');

-- Users and Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'agent',
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company_name TEXT,
  company_industry TEXT,
  company_size TEXT,
  lead_source TEXT NOT NULL,
  status lead_status DEFAULT 'new',
  lead_value DECIMAL(12, 2),
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  marital_status TEXT,
  children_count INTEGER,
  siblings_info TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Lead Details (extended information)
CREATE TABLE IF NOT EXISTS lead_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  address_proof_type TEXT,
  address_proof_verified BOOLEAN DEFAULT false,
  identification_number TEXT,
  family_income TEXT,
  occupation TEXT,
  education_level TEXT,
  preferred_contact_method TEXT,
  best_contact_time TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Documents (address proof, photos, etc)
CREATE TABLE IF NOT EXISTS lead_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_url TEXT,
  verified BOOLEAN DEFAULT false,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Activities (calls, emails, meetings, notes)
CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  activity_type activity_type NOT NULL,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performed_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  outcome TEXT,
  next_followup_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Opportunities (deal tracking)
CREATE TABLE IF NOT EXISTS lead_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  opportunity_name TEXT NOT NULL,
  opportunity_value DECIMAL(12, 2) NOT NULL,
  expected_close_date DATE,
  probability_percent INTEGER DEFAULT 0,
  stage TEXT NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto Assignment Rules
CREATE TABLE IF NOT EXISTS auto_assignment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  strategy assignment_strategy NOT NULL,
  is_active BOOLEAN DEFAULT true,
  lead_source_filter TEXT,
  lead_industry_filter TEXT,
  assigned_to_team TEXT[],
  round_robin_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Assignment History
CREATE TABLE IF NOT EXISTS lead_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  assigned_from UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  rule_id UUID REFERENCES auto_assignment_rules(id) ON DELETE SET NULL,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  assignment_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead Conversions Analytics
CREATE TABLE IF NOT EXISTS lead_conversion_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  conversion_status BOOLEAN DEFAULT false,
  converted_date TIMESTAMP WITH TIME ZONE,
  conversion_value DECIMAL(12, 2),
  days_to_conversion INTEGER,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_source TEXT,
  industry TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_leads_created_by ON leads(created_by);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX idx_lead_activities_performed_by ON lead_activities(performed_by);
CREATE INDEX idx_lead_documents_lead_id ON lead_documents(lead_id);
CREATE INDEX idx_lead_opportunities_lead_id ON lead_opportunities(lead_id);
CREATE INDEX idx_assignment_history_lead_id ON lead_assignment_history(lead_id);
CREATE INDEX idx_conversion_analytics_lead_id ON lead_conversion_analytics(lead_id);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_assignment_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_conversion_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for leads
CREATE POLICY "Agents can view their own leads" ON leads
  FOR SELECT USING (auth.uid() = created_by OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Sales can view assigned leads" ON leads
  FOR SELECT USING (auth.uid() = assigned_to OR (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent'));

CREATE POLICY "Agents can insert leads" ON leads
  FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent'));

CREATE POLICY "Sales can update assigned leads" ON leads
  FOR UPDATE USING (auth.uid() = assigned_to OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for lead_details
CREATE POLICY "Users can view lead details they have access to" ON lead_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_details.lead_id
      AND (leads.created_by = auth.uid() OR leads.assigned_to = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
    )
  );

-- RLS Policies for lead_documents
CREATE POLICY "Users can view documents of leads they have access to" ON lead_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_documents.lead_id
      AND (leads.created_by = auth.uid() OR leads.assigned_to = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
    )
  );

CREATE POLICY "Agents and sales can upload documents" ON lead_documents
  FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent', 'sales'));

-- RLS Policies for lead_activities
CREATE POLICY "Users can view activities of leads they have access to" ON lead_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_activities.lead_id
      AND (leads.created_by = auth.uid() OR leads.assigned_to = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
    )
  );

CREATE POLICY "Users can create activities on leads they have access to" ON lead_activities
  FOR INSERT WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent', 'sales'));

-- RLS Policies for lead_opportunities
CREATE POLICY "Users can view opportunities of leads they have access to" ON lead_opportunities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_opportunities.lead_id
      AND (leads.created_by = auth.uid() OR leads.assigned_to = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
    )
  );

-- RLS Policies for auto_assignment_rules
CREATE POLICY "Only admins can view rules" ON auto_assignment_rules
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Only admins can manage rules" ON auto_assignment_rules
  FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- RLS Policies for lead_assignment_history
CREATE POLICY "Users can view assignment history of their leads" ON lead_assignment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_assignment_history.lead_id
      AND (leads.created_by = auth.uid() OR leads.assigned_to = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
    )
  );

-- RLS Policies for lead_conversion_analytics
CREATE POLICY "Admin can view analytics" ON lead_conversion_analytics
  FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'agent'));
