import { FileQuestion, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RFI() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RFI Manager</h1>
          <p className="text-muted-foreground">Track questions and clarifications</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> New RFI</Button>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No RFIs tracked</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create RFIs to track questions and responses across your proposals.</p>
        </div>
      </div>
    </div>
  );
}
