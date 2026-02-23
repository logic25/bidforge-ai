import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";

const DEFAULT_CRITERIA = [
  { criterion_name: "Client Relationship", weight: 4, description: "Existing relationship with the agency", sort_order: 0 },
  { criterion_name: "Relevant Experience", weight: 5, description: "Past performance on similar projects", sort_order: 1 },
  { criterion_name: "Profit Potential", weight: 3, description: "Expected profitability of the project", sort_order: 2 },
  { criterion_name: "Competition Level", weight: 3, description: "Number and strength of competitors", sort_order: 3 },
  { criterion_name: "Resource Availability", weight: 4, description: "Team capacity to handle the project", sort_order: 4 },
  { criterion_name: "Strategic Fit", weight: 4, description: "Alignment with company strategy", sort_order: 5 },
];

export function useBidScoring() {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const criteriaQuery = useQuery({
    queryKey: ["bid_score_criteria", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bid_score_criteria")
        .select("*")
        .eq("company_id", company!.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const initDefaults = useMutation({
    mutationFn: async () => {
      const inserts = DEFAULT_CRITERIA.map((c) => ({ ...c, company_id: company!.id }));
      const { error } = await supabase.from("bid_score_criteria").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bid_score_criteria"] });
      toast.success("Default criteria created");
    },
    onError: (e) => toast.error(e.message),
  });

  const createCriterion = useMutation({
    mutationFn: async (c: { criterion_name: string; weight: number; description?: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from("bid_score_criteria")
        .insert({ ...c, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bid_score_criteria"] });
      toast.success("Criterion added");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateCriterion = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("bid_score_criteria").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bid_score_criteria"] }),
    onError: (e) => toast.error(e.message),
  });

  const deleteCriterion = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bid_score_criteria").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bid_score_criteria"] });
      toast.success("Criterion removed");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    criteria: criteriaQuery.data ?? [],
    isLoading: criteriaQuery.isLoading,
    initDefaults,
    createCriterion,
    updateCriterion,
    deleteCriterion,
  };
}

export function calculateBidScore(criteria: any[], scores: Record<string, number>): { total: number; max: number; percent: number } {
  let total = 0;
  let max = 0;
  for (const c of criteria) {
    const score = scores[c.id] ?? 5;
    total += score * c.weight;
    max += 10 * c.weight;
  }
  const percent = max > 0 ? Math.round((total / max) * 100) : 0;
  return { total, max, percent };
}

export function getScoreRecommendation(percent: number): { label: string; className: string } {
  if (percent >= 70) return { label: "Strong Bid", className: "bg-success/10 text-success" };
  if (percent >= 40) return { label: "Consider", className: "bg-warning/10 text-warning" };
  return { label: "No Bid", className: "bg-destructive/10 text-destructive" };
}
