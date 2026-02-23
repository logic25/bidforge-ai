import { KanbanSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pipeline() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">Track and manage your RFP pipeline</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New RFP</Button>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <KanbanSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No RFPs yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Add your first RFP to start tracking your pipeline.</p>
          <Button className="mt-4"><Plus className="h-4 w-4 mr-2" /> Add RFP</Button>
        </div>
      </div>
    </div>
  );
}
