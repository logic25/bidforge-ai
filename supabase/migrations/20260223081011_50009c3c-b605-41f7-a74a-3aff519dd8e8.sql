
-- Add source_agency_id to rfp_sources to link sources to agencies
ALTER TABLE public.rfp_sources ADD COLUMN source_agency_id uuid REFERENCES public.agencies(id) ON DELETE SET NULL;

-- Seed Connecticut state agencies
INSERT INTO public.agencies (name, state, agency_type, website, procurement_url, industry_tags) VALUES
('Connecticut Department of Administrative Services (DAS)', 'CT', 'state', 'https://portal.ct.gov/das', 'https://portal.ct.gov/das/procurement', ARRAY['construction', 'professional-services', 'it']),
('Connecticut Department of Transportation (CTDOT)', 'CT', 'state', 'https://portal.ct.gov/dot', 'https://portal.ct.gov/dot/business/consultants/consultant-engineering', ARRAY['construction', 'engineering', 'transportation']),
('Connecticut Department of Housing', 'CT', 'state', 'https://portal.ct.gov/doh', 'https://portal.ct.gov/doh/Doing-Business/Procurement', ARRAY['construction', 'housing']),
('Connecticut Office of Policy and Management (OPM)', 'CT', 'state', 'https://portal.ct.gov/opm', 'https://portal.ct.gov/opm/procurement', ARRAY['government', 'professional-services']),
('Connecticut Construction Industries (DCP)', 'CT', 'state', 'https://portal.ct.gov/dcp', 'https://portal.ct.gov/dcp', ARRAY['construction', 'licensing']),
('Connecticut Department of Energy and Environmental Protection (DEEP)', 'CT', 'state', 'https://portal.ct.gov/deep', 'https://portal.ct.gov/deep/procurement', ARRAY['environmental', 'energy', 'construction']),
('Connecticut Department of Public Health', 'CT', 'state', 'https://portal.ct.gov/dph', 'https://portal.ct.gov/dph/procurement', ARRAY['healthcare', 'professional-services']),
('State of Connecticut - BizNet', 'CT', 'state', 'https://biznet.ct.gov', 'https://biznet.ct.gov/SCP_Search/Default.aspx', ARRAY['construction', 'professional-services', 'it', 'government']),
('City of Hartford', 'CT', 'municipal', 'https://www.hartfordct.gov', 'https://www.hartfordct.gov/Government/Departments/Finance/Purchasing-Division/Bids-RFPs', ARRAY['construction', 'professional-services']),
('City of New Haven', 'CT', 'municipal', 'https://www.newhavenct.gov', 'https://www.newhavenct.gov/government/departments-divisions/purchasing/bids-rfps', ARRAY['construction', 'professional-services']),
('City of Bridgeport', 'CT', 'municipal', 'https://www.bridgeportct.gov', 'https://www.bridgeportct.gov/bids', ARRAY['construction', 'professional-services']),
('City of Stamford', 'CT', 'municipal', 'https://www.stamfordct.gov', 'https://www.stamfordct.gov/government/operations/purchasing/bid-information', ARRAY['construction', 'professional-services']),
('Connecticut Airport Authority', 'CT', 'authority', 'https://www.ctairports.org', 'https://www.ctairports.org/about/procurement', ARRAY['construction', 'transportation']),
('Metropolitan District Commission (MDC)', 'CT', 'authority', 'https://themdc.com', 'https://themdc.com/doing-business/procurement', ARRAY['construction', 'water', 'infrastructure']),
('Connecticut Housing Finance Authority (CHFA)', 'CT', 'authority', 'https://www.chfa.org', 'https://www.chfa.org/about-us/procurement/', ARRAY['housing', 'construction', 'finance']),
('CT State Colleges & Universities (CSCU)', 'CT', 'state', 'https://www.ct.edu', 'https://www.ct.edu/procurement', ARRAY['construction', 'education', 'professional-services']);

-- Seed New York agencies
INSERT INTO public.agencies (name, state, agency_type, website, procurement_url, industry_tags) VALUES
('NYC Department of Buildings (DOB)', 'NY', 'municipal', 'https://www.nyc.gov/buildings', 'https://www.nyc.gov/site/buildings/business/rfps.page', ARRAY['construction', 'inspection']),
('NYC Department of Design and Construction (DDC)', 'NY', 'municipal', 'https://www.nyc.gov/ddc', 'https://www.nyc.gov/site/ddc/contracts/contracts.page', ARRAY['construction', 'engineering', 'architecture']),
('NYC School Construction Authority (SCA)', 'NY', 'authority', 'https://www.nycsca.org', 'https://www.nycsca.org/Business/Working-with-Us/Contracting-Opportunities', ARRAY['construction', 'education']),
('NYC Housing Authority (NYCHA)', 'NY', 'authority', 'https://www.nyc.gov/nycha', 'https://www.nyc.gov/site/nycha/business/contracting-opportunities.page', ARRAY['construction', 'housing']),
('Port Authority of NY & NJ', 'NY', 'authority', 'https://www.panynj.gov', 'https://www.panynj.gov/port-authority/en/business-opportunities/solicitations-702.html', ARRAY['construction', 'transportation', 'infrastructure']),
('NYC Department of Environmental Protection (DEP)', 'NY', 'municipal', 'https://www.nyc.gov/dep', 'https://www.nyc.gov/site/dep/about/doing-business-with-dep.page', ARRAY['construction', 'environmental', 'water']),
('MTA (Metropolitan Transportation Authority)', 'NY', 'authority', 'https://new.mta.info', 'https://new.mta.info/doing-business-with-us/procurement', ARRAY['construction', 'transportation', 'infrastructure']);
