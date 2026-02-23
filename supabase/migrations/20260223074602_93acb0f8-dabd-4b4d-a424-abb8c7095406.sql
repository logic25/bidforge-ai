
-- Event type enum
CREATE TYPE public.deadline_event_type AS ENUM ('deadline', 'milestone', 'review', 'custom');

-- Deadline Events
CREATE TABLE public.deadline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  rfp_id UUID REFERENCES public.rfps(id) ON DELETE CASCADE,
  event_type deadline_event_type NOT NULL DEFAULT 'deadline',
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reminder_days_before INT[] DEFAULT '{}',
  reminders_sent JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.deadline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company deadline events" ON public.deadline_events FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert deadline events for their company" ON public.deadline_events FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company deadline events" ON public.deadline_events FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company deadline events" ON public.deadline_events FOR DELETE USING (company_id = get_user_company_id());

-- Bid Score Criteria
CREATE TABLE public.bid_score_criteria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  criterion_name TEXT NOT NULL,
  weight INT NOT NULL DEFAULT 3 CHECK (weight >= 1 AND weight <= 5),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.bid_score_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company bid criteria" ON public.bid_score_criteria FOR SELECT USING (company_id = get_user_company_id());
CREATE POLICY "Users can insert bid criteria for their company" ON public.bid_score_criteria FOR INSERT WITH CHECK (company_id = get_user_company_id());
CREATE POLICY "Users can update their company bid criteria" ON public.bid_score_criteria FOR UPDATE USING (company_id = get_user_company_id());
CREATE POLICY "Users can delete their company bid criteria" ON public.bid_score_criteria FOR DELETE USING (company_id = get_user_company_id());
