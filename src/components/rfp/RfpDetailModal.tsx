import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, Calendar, DollarSign, User, Globe } from "lucide-react";
import { useRfpDraft } from "@/hooks/useRfpDraft";
import type { Database } from "@/integrations/supabase/types";
import { format } from "date-fns";

type RfpRow = Database["public"]["Tables"]["rfps"]["Row"];

interface RfpDetailModalProps {
  rfp: RfpRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stageColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning/10 text-warning",
  submitted: "bg-primary/10 text-primary",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

export function RfpDetailModal({ rfp, open, onOpenChange }: RfpDetailModalProps) {
  if (!rfp) return null;

  const { sections, drafts, isLoadingSections, generateDraft } = useRfpDraft(rfp.id);
  const latestDraft = drafts[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl">{rfp.title}</DialogTitle>
            <Badge className={stageColors[rfp.stage]}>{rfp.stage}</Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Agency:</span>
                <span>{rfp.agency || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Deadline:</span>
                <span>{rfp.deadline ? format(new Date(rfp.deadline), "MMM d, yyyy") : "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Bid Amount:</span>
                <span>{rfp.bid_amount ? `$${Number(rfp.bid_amount).toLocaleString()}` : "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Score:</span>
                <span>{rfp.bid_no_bid_score ?? "—"}/100</span>
              </div>
            </div>
            {rfp.description && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{rfp.description}</p>
                </div>
              </>
            )}
            {rfp.contact_name && (
              <div>
                <h4 className="text-sm font-medium mb-1">Contact</h4>
                <p className="text-sm">{rfp.contact_name} {rfp.contact_email && `— ${rfp.contact_email}`}</p>
              </div>
            )}
            {rfp.notes && (
              <div>
                <h4 className="text-sm font-medium mb-1">Notes</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rfp.notes}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sections" className="space-y-3 mt-4">
            {isLoadingSections ? (
              <p className="text-sm text-muted-foreground">Loading sections...</p>
            ) : sections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sections extracted yet.</p>
            ) : (
              sections.map((s) => (
                <div key={s.id} className="rounded-lg border p-3">
                  <h4 className="font-medium text-sm">{s.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{s.content}</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="draft" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">AI-Generated Draft</h4>
              <Button
                size="sm"
                onClick={() => generateDraft.mutate()}
                disabled={generateDraft.isPending}
              >
                {generateDraft.isPending ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-3 w-3 mr-1" /> Generate Draft</>
                )}
              </Button>
            </div>
            {latestDraft ? (
              <div className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Version {latestDraft.version}</Badge>
                  <Badge variant={latestDraft.status === "final" ? "default" : "secondary"}>
                    {latestDraft.status}
                  </Badge>
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {typeof latestDraft.content === "object" && latestDraft.content
                    ? (latestDraft.content as any).executive_summary || JSON.stringify(latestDraft.content, null, 2)
                    : String(latestDraft.content)}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No draft yet. Click "Generate Draft" to create one with AI.</p>
            )}
          </TabsContent>

          <TabsContent value="team" className="mt-4">
            <p className="text-sm text-muted-foreground italic">Team assignment coming soon.</p>
          </TabsContent>

          <TabsContent value="budget" className="mt-4">
            <p className="text-sm text-muted-foreground italic">Budget breakdown coming soon.</p>
          </TabsContent>

          <TabsContent value="compliance" className="mt-4">
            <p className="text-sm text-muted-foreground italic">Compliance matrix coming soon.</p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
