import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type RfpRow = Database["public"]["Tables"]["rfps"]["Row"];
type RfpInsert = Database["public"]["Tables"]["rfps"]["Insert"];
type RfpStage = Database["public"]["Enums"]["rfp_stage"];

export function useRfps() {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const rfpsQuery = useQuery({
    queryKey: ["rfps", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfps")
        .select("*")
        .eq("company_id", company!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RfpRow[];
    },
    enabled: !!company?.id,
  });

  const createRfp = useMutation({
    mutationFn: async (rfp: Omit<RfpInsert, "company_id">) => {
      const { data, error } = await supabase
        .from("rfps")
        .insert({ ...rfp, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfps"] });
      toast.success("RFP created");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRfp = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RfpRow> & { id: string }) => {
      const { data, error } = await supabase
        .from("rfps")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfps"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: RfpStage }) => {
      const { error } = await supabase
        .from("rfps")
        .update({ stage })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfps"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteRfp = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfps"] });
      toast.success("RFP deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    rfps: rfpsQuery.data ?? [],
    isLoading: rfpsQuery.isLoading,
    createRfp,
    updateRfp,
    updateStage,
    deleteRfp,
  };
}
