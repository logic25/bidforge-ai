import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";

export function useAgencies() {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const agenciesQuery = useQuery({
    queryKey: ["agencies", company?.states],
    queryFn: async () => {
      const states = company?.states || [];
      let query = supabase
        .from("agencies")
        .select("*")
        .order("state")
        .order("name");

      if (states.length > 0) {
        query = query.in("state", states);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!company,
  });

  // Get RFP counts per agency name
  const agencyRfpCounts = useQuery({
    queryKey: ["agency_rfp_counts", company?.id],
    queryFn: async () => {
      const [rfps, discovered] = await Promise.all([
        supabase.from("rfps").select("agency").eq("company_id", company!.id),
        supabase
          .from("discovered_rfps")
          .select("agency")
          .eq("company_id", company!.id)
          .eq("is_dismissed", false),
      ]);

      const counts: Record<string, number> = {};
      for (const r of [...(rfps.data || []), ...(discovered.data || [])]) {
        const a = r.agency || "Unknown";
        counts[a] = (counts[a] || 0) + 1;
      }
      return counts;
    },
    enabled: !!company?.id,
  });

  // Get monitored source IDs (agency sources)
  const monitoredSourcesQuery = useQuery({
    queryKey: ["agency_sources", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfp_sources")
        .select("id, source_agency_id, is_active, last_checked")
        .eq("company_id", company!.id)
        .not("source_agency_id", "is", null);
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const toggleMonitor = useMutation({
    mutationFn: async ({
      agencyId,
      agencyName,
      procurementUrl,
      isCurrentlyMonitored,
      sourceId,
    }: {
      agencyId: string;
      agencyName: string;
      procurementUrl: string;
      isCurrentlyMonitored: boolean;
      sourceId?: string;
    }) => {
      if (isCurrentlyMonitored && sourceId) {
        const { error } = await supabase
          .from("rfp_sources")
          .delete()
          .eq("id", sourceId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("rfp_sources").insert({
          company_id: company!.id,
          name: agencyName,
          url: procurementUrl,
          source_type: "agency",
          source_agency_id: agencyId,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["agency_sources"] });
      queryClient.invalidateQueries({ queryKey: ["rfp_sources"] });
      toast.success(
        vars.isCurrentlyMonitored
          ? `Stopped monitoring ${vars.agencyName}`
          : `Now monitoring ${vars.agencyName}`
      );
    },
    onError: (e) => toast.error(e.message),
  });

  const scanAgency = useMutation({
    mutationFn: async (sourceId: string) => {
      const { data, error } = await supabase.functions.invoke("monitor-rfps", {
        body: { source_id: sourceId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["discovered_rfps"] });
      queryClient.invalidateQueries({ queryKey: ["agency_sources"] });
      toast.success(
        `Scan complete — found ${data?.discovered || 0} new RFPs`
      );
    },
    onError: (e) => toast.error(`Scan failed: ${e.message}`),
  });

  // Build a map of agencyId -> source info
  const monitoredMap = new Map<
    string,
    { sourceId: string; isActive: boolean; lastChecked: string | null }
  >();
  for (const s of monitoredSourcesQuery.data || []) {
    if (s.source_agency_id) {
      monitoredMap.set(s.source_agency_id, {
        sourceId: s.id,
        isActive: s.is_active,
        lastChecked: s.last_checked,
      });
    }
  }

  return {
    agencies: agenciesQuery.data ?? [],
    rfpCounts: agencyRfpCounts.data ?? {},
    monitoredMap,
    isLoading: agenciesQuery.isLoading,
    toggleMonitor,
    scanAgency,
  };
}
