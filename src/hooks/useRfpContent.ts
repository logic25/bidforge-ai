import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ContentRow = Database["public"]["Tables"]["rfp_content"]["Row"];
type ContentInsert = Database["public"]["Tables"]["rfp_content"]["Insert"];
type ContentCategory = Database["public"]["Enums"]["content_category"];

export function useRfpContent(category?: ContentCategory) {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const contentQuery = useQuery({
    queryKey: ["rfp_content", company?.id, category],
    queryFn: async () => {
      let query = supabase
        .from("rfp_content")
        .select("*")
        .eq("company_id", company!.id)
        .order("updated_at", { ascending: false });
      if (category) query = query.eq("category", category);
      const { data, error } = await query;
      if (error) throw error;
      return data as ContentRow[];
    },
    enabled: !!company?.id,
  });

  const createContent = useMutation({
    mutationFn: async (item: Omit<ContentInsert, "company_id">) => {
      const { data, error } = await supabase
        .from("rfp_content")
        .insert({ ...item, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_content"] });
      toast.success("Content saved");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateContent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentRow> & { id: string }) => {
      const { error } = await supabase
        .from("rfp_content")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_content"] });
      toast.success("Content updated");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfp_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfp_content"] });
      toast.success("Content deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    content: contentQuery.data ?? [],
    isLoading: contentQuery.isLoading,
    createContent,
    updateContent,
    deleteContent,
  };
}
