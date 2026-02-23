import { Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-muted-foreground">Submission deadlines and key dates</p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No deadlines yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Deadlines from your pipeline will appear here automatically.</p>
        </div>
      </div>
    </div>
  );
}
