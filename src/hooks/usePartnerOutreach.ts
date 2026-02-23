import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";

export function usePartnerOutreach(rfpId?: string) {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const outreachQuery = useQuery({
    queryKey: ["rfp_partner_outreach", rfpId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfp_partner_outreach")
        .select("*")
        .eq("rfp_id", rfpId!)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!rfpId,
  });

  const templatesQuery = useQuery({
    queryKey: ["partner_email_templates", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partner_email_templates")
        .select("*")
        .eq("company_id", company!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const invitePartner = useMutation({
    mutationFn: async (partner: { partner_name: string; partner_email: string }) => {
      const { data, error } = await supabase
        .from("rfp_partner_outreach")
        .insert({ ...partner, rfp_id: rfpId!, company_id: company!.id, status: "sent" as any, sent_at: new Date().toISOString() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_partner_outreach"] });
      toast.success("Partner invited");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteOutreach = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfp_partner_outreach").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_partner_outreach"] });
      toast.success("Outreach removed");
    },
    onError: (e) => toast.error(e.message),
  });

  const createTemplate = useMutation({
    mutationFn: async (tmpl: { name: string; subject: string; body: string; template_type?: string }) => {
      const { data, error } = await supabase
        .from("partner_email_templates")
        .insert({ ...tmpl, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partner_email_templates"] });
      toast.success("Template saved");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    outreach: outreachQuery.data ?? [],
    emailTemplates: templatesQuery.data ?? [],
    isLoading: outreachQuery.isLoading,
    invitePartner,
    deleteOutreach,
    createTemplate,
  };
}
