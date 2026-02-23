import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { useBidScoring } from "@/hooks/useBidScoring";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { profile, company } = useCompany();
  const { criteria, initDefaults, createCriterion, updateCriterion, deleteCriterion } = useBidScoring();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [companyName, setCompanyName] = useState(company?.name ?? "");
  const [inviteEmail, setInviteEmail] = useState("");
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionWeight, setNewCriterionWeight] = useState(3);

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user!.id);
    if (error) toast.error("Failed to update profile");
    else {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  const handleSaveCompany = async () => {
    if (!company) return;
    const { error } = await supabase
      .from("companies")
      .update({ name: companyName })
      .eq("id", company.id);
    if (error) toast.error("Failed to update company");
    else {
      toast.success("Company updated");
      queryClient.invalidateQueries({ queryKey: ["company"] });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and team</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <Button onClick={handleSaveProfile}>Save Profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
          <CardDescription>Update company details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <Button onClick={handleSaveCompany}>Save Company</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>Invite people to your team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            <Button variant="outline" onClick={() => toast.info("Invitations coming soon!")}>Invite</Button>
          </div>
          <Separator />
          <div className="text-sm text-muted-foreground">
            <p>{user?.email} — Admin</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bid Scoring Criteria</CardTitle>
          <CardDescription>Configure how RFPs are scored for bid/no-bid decisions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {criteria.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">No criteria configured yet.</p>
              <Button variant="outline" onClick={() => initDefaults.mutate()} disabled={initDefaults.isPending}>
                Initialize Default Criteria
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {criteria.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{c.criterion_name}</p>
                    {c.description && <p className="text-xs text-muted-foreground">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 w-32">
                    <span className="text-xs text-muted-foreground">Weight:</span>
                    <Slider
                      value={[c.weight]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={([v]) => updateCriterion.mutate({ id: c.id, weight: v })}
                      className="flex-1"
                    />
                    <span className="text-xs font-mono w-4">{c.weight}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCriterion.mutate(c.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <Separator />
          <div className="flex gap-2">
            <Input placeholder="Criterion name" value={newCriterionName} onChange={(e) => setNewCriterionName(e.target.value)} />
            <Button
              variant="outline"
              onClick={() => {
                if (!newCriterionName.trim()) return;
                createCriterion.mutate({ criterion_name: newCriterionName, weight: newCriterionWeight, sort_order: criteria.length });
                setNewCriterionName("");
              }}
              disabled={!newCriterionName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Coming Soon — Billing management will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
