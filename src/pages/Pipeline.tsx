import { useState } from "react";
import { useRfps } from "@/hooks/useRfps";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, KanbanSquare, Table2 } from "lucide-react";
import { KanbanView } from "@/components/rfp/KanbanView";
import { TableView } from "@/components/rfp/TableView";
import { NewRfpDialog } from "@/components/rfp/NewRfpDialog";
import { RfpDetailModal } from "@/components/rfp/RfpDetailModal";
import type { Database } from "@/integrations/supabase/types";

type RfpRow = Database["public"]["Tables"]["rfps"]["Row"];

export default function Pipeline() {
  const { rfps, isLoading, updateStage } = useRfps();
  const [newOpen, setNewOpen] = useState(false);
  const [selectedRfp, setSelectedRfp] = useState<RfpRow | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">Track and manage your RFP pipeline</p>
        </div>
        <Button onClick={() => setNewOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New RFP
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <KanbanSquare className="h-4 w-4" /> Kanban
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table2 className="h-4 w-4" /> Table
            </TabsTrigger>
          </TabsList>
          <TabsContent value="kanban" className="mt-4">
            <KanbanView
              rfps={rfps}
              onStageChange={(id, stage) => updateStage.mutate({ id, stage })}
              onClickRfp={setSelectedRfp}
            />
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <TableView rfps={rfps} onClickRfp={setSelectedRfp} />
          </TabsContent>
        </Tabs>
      )}

      <NewRfpDialog open={newOpen} onOpenChange={setNewOpen} />
      <RfpDetailModal rfp={selectedRfp} open={!!selectedRfp} onOpenChange={(o) => !o && setSelectedRfp(null)} />
    </div>
  );
}
