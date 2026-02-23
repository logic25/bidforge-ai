import { LayoutTemplate } from "lucide-react";

export default function Templates() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-muted-foreground">Browse and use proposal templates</p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <LayoutTemplate className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Template marketplace coming soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">Pre-built proposal templates tailored to your industry.</p>
        </div>
      </div>
    </div>
  );
}
