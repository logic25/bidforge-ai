import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";

export function useDiscovery() {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const discoveredQuery = useQuery({
    queryKey: ["discovered_rfps", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discovered_rfps")
        .select("*")
        .eq("company_id", company!.id)
        .order("relevance_score", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const sourcesQuery = useQuery({
    queryKey: ["rfp_sources", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfp_sources")
        .select("*")
        .eq("company_id", company!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const rulesQuery = useQuery({
    queryKey: ["rfp_monitoring_rules", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfp_monitoring_rules")
        .select("*")
        .eq("company_id", company!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const dismissRfp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("discovered_rfps")
        .update({ is_dismissed: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discovered_rfps"] }),
    onError: (e) => toast.error(e.message),
  });

  const addToPipeline = useMutation({
    mutationFn: async (discovered: any) => {
      const { data: rfp, error: rfpError } = await supabase
        .from("rfps")
        .insert({
          company_id: company!.id,
          title: discovered.title,
          agency: discovered.agency,
          description: discovered.description,
          deadline: discovered.deadline,
          source_url: discovered.source_url,
          bid_amount: discovered.value_estimate,
        })
        .select()
        .single();
      if (rfpError) throw rfpError;

      const { error } = await supabase
        .from("discovered_rfps")
        .update({ added_to_pipeline: true, rfp_id: rfp.id })
        .eq("id", discovered.id);
      if (error) throw error;
      return rfp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discovered_rfps"] });
      queryClient.invalidateQueries({ queryKey: ["rfps"] });
      toast.success("Added to pipeline");
    },
    onError: (e) => toast.error(e.message),
  });

  const createSource = useMutation({
    mutationFn: async (source: { name: string; url: string; source_type?: string; check_frequency?: string }) => {
      const { data, error } = await supabase
        .from("rfp_sources")
        .insert({ ...source, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_sources"] });
      toast.success("Source added");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteSource = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfp_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_sources"] });
      toast.success("Source removed");
    },
    onError: (e) => toast.error(e.message),
  });

  const createRule = useMutation({
    mutationFn: async (rule: { keywords?: string[]; agency_filter?: string[]; min_value?: number; max_value?: number; notify_email?: string }) => {
      const { data, error } = await supabase
        .from("rfp_monitoring_rules")
        .insert({ ...rule, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_monitoring_rules"] });
      toast.success("Rule created");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfp_monitoring_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_monitoring_rules"] });
      toast.success("Rule removed");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    discovered: discoveredQuery.data ?? [],
    sources: sourcesQuery.data ?? [],
    rules: rulesQuery.data ?? [],
    isLoading: discoveredQuery.isLoading,
    dismissRfp,
    addToPipeline,
    createSource,
    deleteSource,
    createRule,
    deleteRule,
  };
}
