import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hammer, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const INDUSTRIES = ["Construction", "Government", "IT", "Professional Services", "Other"];
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

export default function Onboarding() {
  const { user, loading } = useAuth();
  const { company, isLoading } = useCompany();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [teamEmails, setTeamEmails] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading || isLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (company?.onboarding_completed) return <Navigate to="/dashboard" replace />;

  const toggleIndustry = (ind: string) =>
    setSelectedIndustries((prev) => prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]);

  const toggleState = (st: string) =>
    setSelectedStates((prev) => prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]);

  const filteredStates = US_STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const handleFinish = async () => {
    if (!company) return;
    setSubmitting(true);
    const { error } = await supabase
      .from("companies")
      .update({
        industries: selectedIndustries,
        states: selectedStates,
        keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
        onboarding_completed: true,
      })
      .eq("id", company.id);
    if (error) {
      toast.error("Failed to save settings");
    } else {
      await queryClient.invalidateQueries({ queryKey: ["company"] });
      navigate("/dashboard", { replace: true });
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Hammer className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle>Set up BidForge</CardTitle>
          <CardDescription>Step {step} of 4</CardDescription>
          <div className="flex gap-1 justify-center mt-3">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1.5 w-12 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select your industry (one or more):</p>
              <div className="flex flex-wrap gap-2">
                {INDUSTRIES.map((ind) => (
                  <Badge
                    key={ind}
                    variant={selectedIndustries.includes(ind) ? "default" : "outline"}
                    className="cursor-pointer text-sm px-4 py-2"
                    onClick={() => toggleIndustry(ind)}
                  >
                    {selectedIndustries.includes(ind) && <Check className="h-3 w-3 mr-1" />}
                    {ind}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Select states where you operate:</p>
              <Input placeholder="Search states..." value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} />
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {filteredStates.map((st) => (
                  <Badge
                    key={st}
                    variant={selectedStates.includes(st) ? "default" : "outline"}
                    className="cursor-pointer px-3 py-1.5"
                    onClick={() => toggleState(st)}
                  >
                    {st}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Enter keywords to monitor (comma-separated):</p>
              <Input
                placeholder="e.g. construction, IT services, consulting"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Invite team members (one email per line):</p>
              <textarea
                className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={"colleague@company.com\npartner@company.com"}
                value={teamEmails}
                onChange={(e) => setTeamEmails(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">You can skip this and invite people later.</p>
            </div>
          )}

          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            ) : <div />}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && selectedIndustries.length === 0}>
                Next <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={submitting}>
                {submitting ? "Saving..." : "Finish Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
