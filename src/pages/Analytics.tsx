import { useState, useMemo } from "react";
import { useRfps } from "@/hooks/useRfps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { format, subDays, differenceInDays, startOfMonth } from "date-fns";
import { Trophy, XCircle } from "lucide-react";

type DateRange = "30" | "90" | "365" | "all";

export default function Analytics() {
  const { rfps, updateRfp } = useRfps();
  const [dateRange, setDateRange] = useState<DateRange>("90");
  const [outcomeDialog, setOutcomeDialog] = useState<string | null>(null);
  const [outcomeResult, setOutcomeResult] = useState<"won" | "lost">("won");
  const [outcomeReason, setOutcomeReason] = useState("");
  const [outcomeAmount, setOutcomeAmount] = useState("");

  const cutoff = dateRange === "all" ? new Date(0) : subDays(new Date(), parseInt(dateRange));
  const filtered = rfps.filter((r) => new Date(r.created_at) >= cutoff);
  const submittedRfps = rfps.filter((r) => r.stage === "submitted");

  // Win rate trend (monthly)
  const winTrend = useMemo(() => {
    const months: Record<string, { month: string; won: number; lost: number; rate: number }> = {};
    filtered
      .filter((r) => r.stage === "won" || r.stage === "lost")
      .forEach((r) => {
        const m = format(new Date(r.updated_at), "yyyy-MM");
        if (!months[m]) months[m] = { month: m, won: 0, lost: 0, rate: 0 };
        if (r.stage === "won") months[m].won++;
        else months[m].lost++;
      });
    return Object.values(months)
      .map((m) => ({ ...m, rate: Math.round((m.won / (m.won + m.lost)) * 100) }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  // Pipeline value by stage
  const stageValues = useMemo(() => {
    const stages: Record<string, number> = {};
    filtered.forEach((r) => {
      stages[r.stage] = (stages[r.stage] || 0) + (Number(r.bid_amount) || 0);
    });
    return Object.entries(stages).map(([stage, value]) => ({ stage, value }));
  }, [filtered]);

  const STAGE_COLORS: Record<string, string> = {
    draft: "#9ca3af", review: "#f59e0b", submitted: "#f97316", won: "#22c55e", lost: "#ef4444",
  };

  // Win/Loss by agency
  const agencyBreakdown = useMemo(() => {
    const agencies: Record<string, { agency: string; won: number; lost: number }> = {};
    filtered
      .filter((r) => (r.stage === "won" || r.stage === "lost") && r.agency)
      .forEach((r) => {
        const a = r.agency!;
        if (!agencies[a]) agencies[a] = { agency: a, won: 0, lost: 0 };
        if (r.stage === "won") agencies[a].won++;
        else agencies[a].lost++;
      });
    return Object.values(agencies);
  }, [filtered]);

  // Average bid score: won vs lost
  const avgScores = useMemo(() => {
    const wonScores = filtered.filter((r) => r.stage === "won" && r.bid_no_bid_score).map((r) => r.bid_no_bid_score!);
    const lostScores = filtered.filter((r) => r.stage === "lost" && r.bid_no_bid_score).map((r) => r.bid_no_bid_score!);
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    return [
      { label: "Won", score: avg(wonScores), fill: "#22c55e" },
      { label: "Lost", score: avg(lostScores), fill: "#ef4444" },
    ];
  }, [filtered]);

  // Time to submit
  const avgTimeToSubmit = useMemo(() => {
    const submitted = filtered.filter((r) => r.stage === "submitted" || r.stage === "won" || r.stage === "lost");
    if (submitted.length === 0) return null;
    const days = submitted
      .filter((r) => r.deadline)
      .map((r) => Math.abs(differenceInDays(new Date(r.created_at), new Date(r.deadline!))));
    return days.length ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : null;
  }, [filtered]);

  const handleRecordOutcome = () => {
    if (!outcomeDialog) return;
    updateRfp.mutate({
      id: outcomeDialog,
      stage: outcomeResult as any,
      win_loss_reason: outcomeReason || undefined,
      bid_amount: outcomeAmount ? parseFloat(outcomeAmount) : undefined,
    });
    setOutcomeDialog(null);
    setOutcomeReason("");
    setOutcomeAmount("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Win/loss reporting and insights</p>
        </div>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Record Outcome Section */}
      {submittedRfps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {submittedRfps.map((rfp) => (
                <div key={rfp.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{rfp.title}</p>
                    <p className="text-xs text-muted-foreground">{rfp.agency || "No agency"}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setOutcomeDialog(rfp.id)}>
                    Record Outcome
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Win Rate Trend */}
        <Card>
          <CardHeader><CardTitle className="text-base">Win Rate Trend</CardTitle></CardHeader>
          <CardContent>
            {winTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Not enough data</p>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={winTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="rate" stroke="hsl(24, 95%, 53%)" strokeWidth={2} name="Win Rate %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pipeline Value by Stage */}
        <Card>
          <CardHeader><CardTitle className="text-base">Pipeline Value by Stage</CardTitle></CardHeader>
          <CardContent>
            {stageValues.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No data</p>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageValues}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                    <Bar dataKey="value" name="Value ($)">
                      {stageValues.map((entry) => (
                        <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] || "#9ca3af"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Win/Loss by Agency */}
        <Card>
          <CardHeader><CardTitle className="text-base">Win/Loss by Agency</CardTitle></CardHeader>
          <CardContent>
            {agencyBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No agency data</p>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agencyBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="agency" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="won" fill="#22c55e" name="Won" stackId="a" />
                    <Bar dataKey="lost" fill="#ef4444" name="Lost" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avg Bid Score & Time to Submit */}
        <Card>
          <CardHeader><CardTitle className="text-base">Performance Metrics</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Average Bid Score: Won vs Lost</p>
              <div className="flex gap-6">
                {avgScores.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    {s.label === "Won" ? <Trophy className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                    <div>
                      <p className="text-2xl font-bold">{s.score || "—"}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Average Time to Submit</p>
              <p className="text-2xl font-bold">{avgTimeToSubmit ?? "—"} <span className="text-sm font-normal text-muted-foreground">days</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outcome Dialog */}
      <Dialog open={!!outcomeDialog} onOpenChange={(o) => !o && setOutcomeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Result</Label>
              <Select value={outcomeResult} onValueChange={(v) => setOutcomeResult(v as "won" | "lost")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Textarea value={outcomeReason} onChange={(e) => setOutcomeReason(e.target.value)} placeholder="Why did you win/lose?" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Award Amount (optional)</Label>
              <Input type="number" value={outcomeAmount} onChange={(e) => setOutcomeAmount(e.target.value)} placeholder="$" />
            </div>
            <Button onClick={handleRecordOutcome} className="w-full">
              Record {outcomeResult === "won" ? "Win" : "Loss"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
