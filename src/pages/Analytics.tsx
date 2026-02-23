import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Win/loss reporting and insights</p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Not enough data yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Analytics will populate as you track RFPs through your pipeline.</p>
        </div>
      </div>
    </div>
  );
}
