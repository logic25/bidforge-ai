
-- Enums
CREATE TYPE public.rfi_status AS ENUM ('draft', 'sent', 'viewed', 'responded');
CREATE TYPE public.partner_outreach_status AS ENUM ('pending', 'sent', 'viewed', 'responded', 'declined');

-- Discovered RFPs
CREATE TABLE public.discovered_rfps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  agency TEXT,
  description TEXT,
  source_url TEXT,
  relevance_score DECIMAL DEFAULT 0,
  match_reason TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  value_estimate DECIMAL,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  added_to_pipeline BOOLEAN NOT NULL DEFAULT false,
  rfp_id UUID REFERENCES public.rfps(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.discovered_rfps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company discovered rfps" ON public.discovered_rfps FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert discovered rfps for their company" ON public.discovered_rfps FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company discovered rfps" ON public.discovered_rfps FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company discovered rfps" ON public.discovered_rfps FOR DELETE USING (company_id = get_user_company_id());

-- RFP Sources
CREATE TABLE public.rfp_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'website',
  check_frequency TEXT NOT NULL DEFAULT 'daily',
  last_checked TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rfp_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company rfp sources" ON public.rfp_sources FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert rfp sources for their company" ON public.rfp_sources FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company rfp sources" ON public.rfp_sources FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company rfp sources" ON public.rfp_sources FOR DELETE USING (company_id = get_user_company_id());

-- RFP Monitoring Rules
CREATE TABLE public.rfp_monitoring_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  keywords TEXT[] DEFAULT '{}',
  agency_filter TEXT[] DEFAULT '{}',
  min_value DECIMAL,
  max_value DECIMAL,
  notify_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rfp_monitoring_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company monitoring rules" ON public.rfp_monitoring_rules FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert monitoring rules for their company" ON public.rfp_monitoring_rules FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company monitoring rules" ON public.rfp_monitoring_rules FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company monitoring rules" ON public.rfp_monitoring_rules FOR DELETE USING (company_id = get_user_company_id());

-- RFI Requests
CREATE TABLE public.rfi_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]',
  status rfi_status NOT NULL DEFAULT 'draft',
  recipient_email TEXT,
  recipient_name TEXT,
  response_token UUID DEFAULT gen_random_uuid(),
  response_data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rfi_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company rfi requests" ON public.rfi_requests FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert rfi requests for their company" ON public.rfi_requests FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company rfi requests" ON public.rfi_requests FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company rfi requests" ON public.rfi_requests FOR DELETE USING (company_id = get_user_company_id());

-- RFI Templates
CREATE TABLE public.rfi_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rfi_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company rfi templates" ON public.rfi_templates FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert rfi templates for their company" ON public.rfi_templates FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company rfi templates" ON public.rfi_templates FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company rfi templates" ON public.rfi_templates FOR DELETE USING (company_id = get_user_company_id());

-- RFP Partner Outreach
CREATE TABLE public.rfp_partner_outreach (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfp_id UUID NOT NULL REFERENCES public.rfps(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  partner_name TEXT NOT NULL,
  partner_email TEXT NOT NULL,
  status partner_outreach_status NOT NULL DEFAULT 'pending',
  response_token UUID DEFAULT gen_random_uuid(),
  response_data JSONB,
  sent_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.rfp_partner_outreach ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company partner outreach" ON public.rfp_partner_outreach FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert partner outreach for their company" ON public.rfp_partner_outreach FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company partner outreach" ON public.rfp_partner_outreach FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company partner outreach" ON public.rfp_partner_outreach FOR DELETE USING (company_id = get_user_company_id());

-- Partner Email Templates
CREATE TABLE public.partner_email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'partnership',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.partner_email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company email templates" ON public.partner_email_templates FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert email templates for their company" ON public.partner_email_templates FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company email templates" ON public.partner_email_templates FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company email templates" ON public.partner_email_templates FOR DELETE USING (company_id = get_user_company_id());
