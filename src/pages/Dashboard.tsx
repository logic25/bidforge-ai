import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KanbanSquare, Clock, TrendingUp, Activity, Bell } from "lucide-react";

const cards = [
  { title: "Pipeline Summary", desc: "3 active RFPs worth $1.2M", icon: KanbanSquare, value: "3 Active" },
  { title: "Upcoming Deadlines", desc: "Next deadline in 5 days", icon: Clock, value: "2 This Week" },
  { title: "Win Rate", desc: "Last 90 days performance", icon: TrendingUp, value: "68%" },
  { title: "Recent Activity", desc: "Team actions this week", icon: Activity, value: "12 Actions" },
  { title: "Discovery Alerts", desc: "New RFPs matching your criteria", icon: Bell, value: "7 New" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to BidForge</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <CardDescription className="mt-1">{card.desc}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
