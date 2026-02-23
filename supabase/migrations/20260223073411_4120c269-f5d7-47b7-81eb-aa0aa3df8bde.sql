
-- 1. Create rfp_stage enum
CREATE TYPE public.rfp_stage AS ENUM ('draft', 'review', 'submitted', 'won', 'lost');

-- 2. Create draft_status enum
CREATE TYPE public.draft_status AS ENUM ('draft', 'final');

-- 3. Create content_category enum
CREATE TYPE public.content_category AS ENUM ('boilerplate', 'case_study', 'team_bio', 'certification', 'past_performance', 'compliance');

-- 4. Create rfps table
CREATE TABLE public.rfps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  agency TEXT,
  deadline TIMESTAMPTZ,
  stage rfp_stage NOT NULL DEFAULT 'draft',
  bid_amount NUMERIC,
  contact_name TEXT,
  contact_email TEXT,
  source_url TEXT,
  notes TEXT,
  bid_no_bid_score INTEGER,
  bid_decision TEXT,
  win_loss_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create rfp_response_drafts table
CREATE TABLE public.rfp_response_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfp_id UUID NOT NULL REFERENCES public.rfps(id) ON DELETE CASCADE,
  content JSONB DEFAULT '{}',
  version INTEGER NOT NULL DEFAULT 1,
  status draft_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create rfp_sections table
CREATE TABLE public.rfp_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfp_id UUID NOT NULL REFERENCES public.rfps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  section_order INTEGER NOT NULL DEFAULT 0,
  ai_suggested_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Create rfp_content table
CREATE TABLE public.rfp_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  category content_category NOT NULL DEFAULT 'boilerplate',
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Enable RLS
ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfp_response_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfp_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rfp_content ENABLE ROW LEVEL SECURITY;

-- 9. RLS for rfps (company-scoped)
CREATE POLICY "Users can view their company rfps" ON public.rfps
  FOR SELECT TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "Users can insert rfps for their company" ON public.rfps
  FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id());
CREATE POLICY "Users can update their company rfps" ON public.rfps
  FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "Users can delete their company rfps" ON public.rfps
  FOR DELETE TO authenticated USING (company_id = public.get_user_company_id());

-- 10. RLS for rfp_response_drafts (via rfp -> company)
CREATE POLICY "Users can view drafts for their rfps" ON public.rfp_response_drafts
  FOR SELECT TO authenticated USING (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));
CREATE POLICY "Users can insert drafts for their rfps" ON public.rfp_response_drafts
  FOR INSERT TO authenticated WITH CHECK (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));
CREATE POLICY "Users can update drafts for their rfps" ON public.rfp_response_drafts
  FOR UPDATE TO authenticated USING (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));
CREATE POLICY "Users can delete drafts for their rfps" ON public.rfp_response_drafts
  FOR DELETE TO authenticated USING (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));

-- 11. RLS for rfp_sections (via rfp -> company)
CREATE POLICY "Users can view sections for their rfps" ON public.rfp_sections
  FOR SELECT TO authenticated USING (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));
CREATE POLICY "Users can insert sections for their rfps" ON public.rfp_sections
  FOR INSERT TO authenticated WITH CHECK (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));
CREATE POLICY "Users can update sections for their rfps" ON public.rfp_sections
  FOR UPDATE TO authenticated USING (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));
CREATE POLICY "Users can delete sections for their rfps" ON public.rfp_sections
  FOR DELETE TO authenticated USING (rfp_id IN (SELECT id FROM public.rfps WHERE company_id = public.get_user_company_id()));

-- 12. RLS for rfp_content (company-scoped)
CREATE POLICY "Users can view their company content" ON public.rfp_content
  FOR SELECT TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "Users can insert content for their company" ON public.rfp_content
  FOR INSERT TO authenticated WITH CHECK (company_id = public.get_user_company_id());
CREATE POLICY "Users can update their company content" ON public.rfp_content
  FOR UPDATE TO authenticated USING (company_id = public.get_user_company_id());
CREATE POLICY "Users can delete their company content" ON public.rfp_content
  FOR DELETE TO authenticated USING (company_id = public.get_user_company_id());

-- 13. Updated_at triggers
CREATE TRIGGER update_rfps_updated_at
  BEFORE UPDATE ON public.rfps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rfp_content_updated_at
  BEFORE UPDATE ON public.rfp_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
