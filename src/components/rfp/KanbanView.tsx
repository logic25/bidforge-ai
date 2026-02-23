import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, Target } from "lucide-react";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type RfpRow = Database["public"]["Tables"]["rfps"]["Row"];
type RfpStage = Database["public"]["Enums"]["rfp_stage"];

const STAGES: RfpStage[] = ["draft", "review", "submitted", "won", "lost"];

const stageLabels: Record<RfpStage, string> = {
  draft: "Draft",
  review: "In Review",
  submitted: "Submitted",
  won: "Won",
  lost: "Lost",
};

const stageColors: Record<RfpStage, string> = {
  draft: "bg-muted",
  review: "bg-warning/10",
  submitted: "bg-primary/10",
  won: "bg-success/10",
  lost: "bg-destructive/10",
};

interface KanbanViewProps {
  rfps: RfpRow[];
  onStageChange: (id: string, stage: RfpStage) => void;
  onClickRfp: (rfp: RfpRow) => void;
}

export function KanbanView({ rfps, onStageChange, onClickRfp }: KanbanViewProps) {
  const handleDragStart = (e: React.DragEvent, rfpId: string) => {
    e.dataTransfer.setData("rfpId", rfpId);
  };

  const handleDrop = (e: React.DragEvent, stage: RfpStage) => {
    e.preventDefault();
    const rfpId = e.dataTransfer.getData("rfpId");
    if (rfpId) onStageChange(rfpId, stage);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageRfps = rfps.filter((r) => r.stage === stage);
        return (
          <div
            key={stage}
            className="min-w-[260px] flex-1"
            onDrop={(e) => handleDrop(e, stage)}
            onDragOver={handleDragOver}
          >
            <div className={`rounded-lg p-2 ${stageColors[stage]}`}>
              <div className="flex items-center justify-between px-2 py-1 mb-2">
                <span className="text-sm font-medium">{stageLabels[stage]}</span>
                <Badge variant="secondary" className="text-xs">{stageRfps.length}</Badge>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {stageRfps.map((rfp) => (
                  <Card
                    key={rfp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, rfp.id)}
                    onClick={() => onClickRfp(rfp)}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3 space-y-2">
                      <p className="text-sm font-medium line-clamp-2">{rfp.title}</p>
                      {rfp.agency && (
                        <p className="text-xs text-muted-foreground">{rfp.agency}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {rfp.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(rfp.deadline), "MMM d")}
                          </span>
                        )}
                        {rfp.bid_amount && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {Number(rfp.bid_amount).toLocaleString()}
                          </span>
                        )}
                        {rfp.bid_no_bid_score != null && (
                          <span className={`flex items-center gap-1 ${rfp.bid_no_bid_score >= 70 ? "text-success" : rfp.bid_no_bid_score >= 40 ? "text-warning" : "text-destructive"}`}>
                            <Target className="h-3 w-3" />
                            {rfp.bid_no_bid_score}%
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
