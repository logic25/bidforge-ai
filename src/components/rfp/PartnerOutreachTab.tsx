import { useState } from "react";
import { usePartnerOutreach } from "@/hooks/usePartnerOutreach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Send, Trash2, Users, Eye } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  viewed: "bg-warning/10 text-warning",
  responded: "bg-success/10 text-success",
  declined: "bg-destructive/10 text-destructive",
};

interface PartnerOutreachTabProps {
  rfpId: string;
}

export function PartnerOutreachTab({ rfpId }: PartnerOutreachTabProps) {
  const { outreach, isLoading, invitePartner, deleteOutreach } = usePartnerOutreach(rfpId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [viewResponse, setViewResponse] = useState<any>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  const handleInvite = () => {
    if (!partnerName.trim() || !partnerEmail.trim()) return;
    invitePartner.mutate({ partner_name: partnerName, partner_email: partnerEmail });
    setInviteOpen(false);
    setPartnerName("");
    setPartnerEmail("");
  };

  if (isLoading) {
    return <div className="flex justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Partners</h4>
        <Button size="sm" onClick={() => setInviteOpen(true)}>
          <Plus className="h-3 w-3 mr-1" /> Invite Partner
        </Button>
      </div>

      {outreach.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <Users className="h-8 w-8 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">No partners invited yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {outreach.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between py-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{p.partner_name}</p>
                    <Badge className={statusColors[p.status]}>{p.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.partner_email}</p>
                  {p.sent_at && <p className="text-xs text-muted-foreground">Sent {format(new Date(p.sent_at), "MMM d, yyyy")}</p>}
                </div>
                <div className="flex gap-1">
                  {p.response_data && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewResponse(p)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteOutreach.mutate(p.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Partner</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Partner Name</Label>
              <Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Partner Email</Label>
              <Input type="email" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} />
            </div>
            <Button onClick={handleInvite} disabled={!partnerName.trim() || !partnerEmail.trim()} className="w-full">
              <Send className="h-4 w-4 mr-2" /> Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewResponse} onOpenChange={(o) => !o && setViewResponse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Response from {viewResponse?.partner_name}</DialogTitle>
          </DialogHeader>
          {viewResponse?.response_data && (
            <div className="mt-4 rounded-lg border p-3 bg-muted/30">
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(viewResponse.response_data, null, 2)}</pre>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
