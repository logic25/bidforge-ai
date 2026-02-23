import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DraftRow = Database["public"]["Tables"]["rfp_response_drafts"]["Row"];
type SectionRow = Database["public"]["Tables"]["rfp_sections"]["Row"];

export function useRfpDraft(rfpId?: string) {
  const queryClient = useQueryClient();

  const draftsQuery = useQuery({
    queryKey: ["rfp_drafts", rfpId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfp_response_drafts")
        .select("*")
        .eq("rfp_id", rfpId!)
        .order("version", { ascending: false });
      if (error) throw error;
      return data as DraftRow[];
    },
    enabled: !!rfpId,
  });

  const sectionsQuery = useQuery({
    queryKey: ["rfp_sections", rfpId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfp_sections")
        .select("*")
        .eq("rfp_id", rfpId!)
        .order("section_order", { ascending: true });
      if (error) throw error;
      return data as SectionRow[];
    },
    enabled: !!rfpId,
  });

  const saveSections = useMutation({
    mutationFn: async (sections: Array<{ title: string; content: string; section_order: number }>) => {
      // Delete existing sections then insert new ones
      await supabase.from("rfp_sections").delete().eq("rfp_id", rfpId!);
      const { error } = await supabase.from("rfp_sections").insert(
        sections.map((s) => ({ ...s, rfp_id: rfpId! }))
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_sections", rfpId] });
      toast.success("Sections saved");
    },
    onError: (e) => toast.error(e.message),
  });

  const generateDraft = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("generate-rfp-cover-letter", {
        body: { rfp_id: rfpId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_drafts", rfpId] });
      toast.success("Draft generated");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    drafts: draftsQuery.data ?? [],
    sections: sectionsQuery.data ?? [],
    isLoadingDrafts: draftsQuery.isLoading,
    isLoadingSections: sectionsQuery.isLoading,
    saveSections,
    generateDraft,
  };
}
