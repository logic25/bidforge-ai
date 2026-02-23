import { useRfps } from "@/hooks/useRfps";
import { useDiscovery } from "@/hooks/useDiscovery";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanbanSquare, Clock, TrendingUp, Activity, Bell, Plus, Search, Calendar as CalIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";

const STAGE_COLORS: Record<string, string> = {
  draft: "hsl(var(--muted-foreground))",
  review: "hsl(var(--warning))",
  submitted: "hsl(var(--primary))",
  won: "hsl(var(--success))",
  lost: "hsl(var(--destructive))",
};

export default function Dashboard() {
  const { rfps, isLoading } = useRfps();
  const { discovered } = useDiscovery();
  const navigate = useNavigate();

  const newDiscoveries = discovered.filter((d) => !d.is_dismissed && !d.added_to_pipeline);
  const activeStages = ["draft", "review", "submitted"];
  const activeRfps = rfps.filter((r) => activeStages.includes(r.stage));
  const totalValue = activeRfps.reduce((s, r) => s + (Number(r.bid_amount) || 0), 0);

  // Stage counts
  const stageCounts: Record<string, number> = {};
  const stageValues: Record<string, number> = {};
  rfps.forEach((r) => {
    stageCounts[r.stage] = (stageCounts[r.stage] || 0) + 1;
    stageValues[r.stage] = (stageValues[r.stage] || 0) + (Number(r.bid_amount) || 0);
  });

  // Win rate
  const won = rfps.filter((r) => r.stage === "won").length;
  const lost = rfps.filter((r) => r.stage === "lost").length;
  const pending = rfps.filter((r) => r.stage === "submitted").length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : 0;

  const pieData = [
    { name: "Won", value: won, color: "hsl(var(--success))" },
    { name: "Lost", value: lost, color: "hsl(var(--destructive))" },
    { name: "Pending", value: pending, color: "hsl(var(--primary))" },
  ].filter((d) => d.value > 0);

  // Upcoming deadlines
  const upcoming = rfps
    .filter((r) => r.deadline && new Date(r.deadline) > new Date() && activeStages.includes(r.stage))
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    .slice(0, 5);

  // Recent activity
  const recent = [...rfps]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to BidForge</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Summary</CardTitle>
            <KanbanSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRfps.length} Active</div>
            <CardDescription className="mt-1">${totalValue.toLocaleString()} total value</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate}%</div>
            <CardDescription className="mt-1">{won}W / {lost}L / {pending} pending</CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcoming.length}</div>
            <CardDescription className="mt-1">
              {upcoming[0] ? `Next: ${differenceInDays(new Date(upcoming[0].deadline!), new Date())} days` : "No upcoming"}
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/discovery")}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Discovery Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{newDiscoveries.length}</span>
              {newDiscoveries.length > 0 && <Badge className="bg-primary/10 text-primary">New</Badge>}
            </div>
            <CardDescription className="mt-1">Matching your criteria</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Win Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Win/Loss Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No outcome data yet</p>
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((rfp) => {
                  const days = differenceInDays(new Date(rfp.deadline!), new Date());
                  return (
                    <div key={rfp.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{rfp.title}</p>
                        <p className="text-xs text-muted-foreground">{rfp.agency || "No agency"}</p>
                      </div>
                      <Badge variant={days <= 3 ? "destructive" : days <= 7 ? "default" : "secondary"}>
                        {days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recent.map((rfp) => (
                <div key={rfp.id} className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{rfp.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Stage: {rfp.stage} · Updated {format(new Date(rfp.updated_at), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button onClick={() => navigate("/pipeline")}>
          <Plus className="h-4 w-4 mr-2" /> New RFP
        </Button>
        <Button variant="outline" onClick={() => navigate("/discovery")}>
          <Search className="h-4 w-4 mr-2" /> Check Discoveries
        </Button>
        <Button variant="outline" onClick={() => navigate("/calendar")}>
          <CalIcon className="h-4 w-4 mr-2" /> View Calendar
        </Button>
      </div>
    </div>
  );
}
