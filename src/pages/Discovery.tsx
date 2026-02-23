import { Search, Bell } from "lucide-react";

export default function Discovery() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discovery</h1>
        <p className="text-muted-foreground">Auto-discovered RFPs matching your criteria</p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Scanning for opportunities</h3>
          <p className="mt-2 text-sm text-muted-foreground">We're monitoring procurement portals based on your keywords and locations.</p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" /> You'll be notified when new RFPs are found
          </div>
        </div>
      </div>
    </div>
  );
}
