import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface MarketplaceTemplate {
  id: string;
  author_id: string;
  company_id: string;
  title: string;
  description: string | null;
  category: string;
  industry_tags: string[];
  price: number;
  content: any;
  preview_content: any;
  thumbnail_url: string | null;
  download_count: number;
  avg_rating: number;
  status: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

export interface MarketplaceReview {
  id: string;
  template_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface MarketplacePurchase {
  id: string;
  buyer_id: string;
  buyer_company_id: string;
  template_id: string;
  price_paid: number;
  stripe_payment_id: string | null;
  created_at: string;
}

const TEMPLATE_CATEGORIES = [
  "general",
  "technology",
  "construction",
  "healthcare",
  "consulting",
  "defense",
  "education",
  "environmental",
];

export { TEMPLATE_CATEGORIES };

export function useMarketplace() {
  const { company, profile } = useCompany();
  const { user } = useAuth();
  const qc = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ["marketplace_templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_templates")
        .select("*")
        .eq("status", "published")
        .order("download_count", { ascending: false });
      if (error) throw error;
      return data as unknown as MarketplaceTemplate[];
    },
  });

  const myTemplatesQuery = useQuery({
    queryKey: ["my_marketplace_templates", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_templates")
        .select("*")
        .eq("company_id", company!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as MarketplaceTemplate[];
    },
    enabled: !!company?.id,
  });

  const purchasesQuery = useQuery({
    queryKey: ["marketplace_purchases", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_purchases")
        .select("*")
        .eq("buyer_company_id", company!.id);
      if (error) throw error;
      return data as unknown as MarketplacePurchase[];
    },
    enabled: !!company?.id,
  });

  const salesQuery = useQuery({
    queryKey: ["marketplace_sales", company?.id],
    queryFn: async () => {
      // Get template IDs owned by this company
      const { data: templates } = await supabase
        .from("marketplace_templates")
        .select("id")
        .eq("company_id", company!.id);
      if (!templates?.length) return [];
      const ids = templates.map((t: any) => t.id);
      const { data, error } = await supabase
        .from("marketplace_purchases")
        .select("*")
        .in("template_id", ids);
      if (error) throw error;
      return data as unknown as MarketplacePurchase[];
    },
    enabled: !!company?.id,
  });

  const createTemplate = useMutation({
    mutationFn: async (tmpl: {
      title: string;
      description: string;
      category: string;
      industry_tags: string[];
      price: number;
      content: any;
      preview_content: any;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("marketplace_templates")
        .insert({
          ...tmpl,
          author_id: user!.id,
          company_id: company!.id,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace_templates"] });
      qc.invalidateQueries({ queryKey: ["my_marketplace_templates"] });
      toast.success("Template created");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("marketplace_templates")
        .update(updates as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace_templates"] });
      qc.invalidateQueries({ queryKey: ["my_marketplace_templates"] });
      toast.success("Template updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const purchaseTemplate = useMutation({
    mutationFn: async (template: MarketplaceTemplate) => {
      // For free templates, just create a purchase record
      if (template.price <= 0) {
        const { error } = await supabase.from("marketplace_purchases").insert({
          buyer_id: user!.id,
          buyer_company_id: company!.id,
          template_id: template.id,
          price_paid: 0,
        } as any);
        if (error) throw error;
        // Increment download count
        await supabase
          .from("marketplace_templates")
          .update({ download_count: template.download_count + 1 } as any)
          .eq("id", template.id);
        return { free: true };
      }
      // For paid templates, we'd call Stripe checkout — placeholder for now
      toast.info("Stripe checkout will be available soon. Template added for free during beta.");
      const { error } = await supabase.from("marketplace_purchases").insert({
        buyer_id: user!.id,
        buyer_company_id: company!.id,
        template_id: template.id,
        price_paid: 0,
        stripe_payment_id: "beta_free",
      } as any);
      if (error) throw error;
      await supabase
        .from("marketplace_templates")
        .update({ download_count: template.download_count + 1 } as any)
        .eq("id", template.id);
      return { free: false };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace_purchases"] });
      qc.invalidateQueries({ queryKey: ["marketplace_templates"] });
      toast.success("Template acquired! Import it to your library.");
    },
    onError: (e) => toast.error(e.message),
  });

  const importToLibrary = useMutation({
    mutationFn: async (template: MarketplaceTemplate) => {
      const contentItems = Array.isArray(template.content) ? template.content : [];
      for (const item of contentItems) {
        await supabase.from("rfp_content").insert({
          company_id: company!.id,
          title: item.title || template.title,
          content: item.content || "",
          category: item.category || "boilerplate",
          tags: item.tags || template.industry_tags || [],
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rfp_content"] });
      toast.success("Template content imported to your library!");
    },
    onError: (e) => toast.error(e.message),
  });

  const submitReview = useMutation({
    mutationFn: async ({ template_id, rating, review_text }: { template_id: string; rating: number; review_text: string }) => {
      const { error } = await supabase.from("marketplace_reviews").insert({
        template_id,
        reviewer_id: user!.id,
        rating,
        review_text,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace_reviews"] });
      toast.success("Review submitted");
    },
    onError: (e) => toast.error(e.message),
  });

  const purchasedIds = new Set((purchasesQuery.data ?? []).map((p) => p.template_id));

  return {
    templates: templatesQuery.data ?? [],
    myTemplates: myTemplatesQuery.data ?? [],
    purchases: purchasesQuery.data ?? [],
    sales: salesQuery.data ?? [],
    purchasedIds,
    isLoading: templatesQuery.isLoading,
    createTemplate,
    updateTemplate,
    purchaseTemplate,
    importToLibrary,
    submitReview,
    company,
    profile,
  };
}

export function useTemplateReviews(templateId?: string) {
  return useQuery({
    queryKey: ["marketplace_reviews", templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_reviews")
        .select("*")
        .eq("template_id", templateId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as MarketplaceReview[];
    },
    enabled: !!templateId,
  });
}
