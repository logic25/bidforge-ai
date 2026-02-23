import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";
import { toast } from "sonner";

export function useDeadlineEvents() {
  const { company } = useCompany();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ["deadline_events", company?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadline_events")
        .select("*")
        .eq("company_id", company!.id)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  const createEvent = useMutation({
    mutationFn: async (event: { rfp_id?: string; event_type?: string; event_date: string; title: string; description?: string }) => {
      const { data, error } = await supabase
        .from("deadline_events")
        .insert({ ...event, company_id: company!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadline_events"] });
      toast.success("Event created");
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deadline_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deadline_events"] });
      toast.success("Event deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    createEvent,
    deleteEvent,
  };
}
