import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";

export function useRfi() {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const rfiQuery = useQuery({
    queryKey: ["rfi_requests", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfi_requests")
        .select("*")
        .eq("company_id", company!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const templatesQuery = useQuery({
    queryKey: ["rfi_templates", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rfi_templates")
        .select("*")
        .eq("company_id", company!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const createRfi = useMutation({
    mutationFn: async (rfi: { project_name: string; questions: any[]; recipient_email?: string; recipient_name?: string }) => {
      const { data, error } = await supabase
        .from("rfi_requests")
        .insert({ ...rfi, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfi_requests"] });
      toast.success("RFI created");
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRfi = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("rfi_requests")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfi_requests"] });
    },
    onError: (e) => toast.error(e.message),
  });

  const sendRfi = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("rfi_requests")
        .update({ status: "sent" as any, sent_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfi_requests"] });
      toast.success("RFI sent");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteRfi = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfi_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfi_requests"] });
      toast.success("RFI deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  const createTemplate = useMutation({
    mutationFn: async (template: { name: string; description?: string; questions: any[] }) => {
      const { data, error } = await supabase
        .from("rfi_templates")
        .insert({ ...template, company_id: company!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfi_templates"] });
      toast.success("Template saved");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rfi_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfi_templates"] });
      toast.success("Template deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    rfis: rfiQuery.data ?? [],
    templates: templatesQuery.data ?? [],
    isLoading: rfiQuery.isLoading,
    createRfi,
    updateRfi,
    sendRfi,
    deleteRfi,
    createTemplate,
    deleteTemplate,
  };
}
