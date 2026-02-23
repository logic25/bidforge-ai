
-- Marketplace templates table
CREATE TABLE public.marketplace_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  company_id UUID NOT NULL REFERENCES public.companies(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  industry_tags TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  content JSONB DEFAULT '{}',
  preview_content JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  download_count INTEGER NOT NULL DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_templates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse published templates
CREATE POLICY "Anyone can view published templates"
  ON public.marketplace_templates FOR SELECT
  USING (status = 'published' OR company_id = get_user_company_id());

-- Authors can manage their own templates
CREATE POLICY "Authors can insert templates"
  ON public.marketplace_templates FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Authors can update their templates"
  ON public.marketplace_templates FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Authors can delete their templates"
  ON public.marketplace_templates FOR DELETE
  USING (company_id = get_user_company_id());

-- Marketplace purchases table
CREATE TABLE public.marketplace_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(id),
  buyer_company_id UUID NOT NULL REFERENCES public.companies(id),
  template_id UUID NOT NULL REFERENCES public.marketplace_templates(id),
  price_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their purchases"
  ON public.marketplace_purchases FOR SELECT
  USING (buyer_company_id = get_user_company_id());

CREATE POLICY "Buyers can insert purchases"
  ON public.marketplace_purchases FOR INSERT
  WITH CHECK (buyer_company_id = get_user_company_id());

-- Template sellers can see purchases of their templates
CREATE POLICY "Sellers can view purchases of their templates"
  ON public.marketplace_purchases FOR SELECT
  USING (template_id IN (
    SELECT id FROM public.marketplace_templates WHERE company_id = get_user_company_id()
  ));

-- Marketplace reviews table
CREATE TABLE public.marketplace_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.marketplace_templates(id),
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews"
  ON public.marketplace_reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers can write reviews"
  ON public.marketplace_reviews FOR INSERT
  WITH CHECK (reviewer_id IN (
    SELECT id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "Reviewers can update their reviews"
  ON public.marketplace_reviews FOR UPDATE
  USING (reviewer_id = auth.uid());

CREATE POLICY "Reviewers can delete their reviews"
  ON public.marketplace_reviews FOR DELETE
  USING (reviewer_id = auth.uid());

-- Update trigger for marketplace_templates
CREATE TRIGGER update_marketplace_templates_updated_at
  BEFORE UPDATE ON public.marketplace_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
