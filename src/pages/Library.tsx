import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Library() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">Reusable proposal content and boilerplate</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Content</Button>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">Build your content library</h3>
          <p className="mt-2 text-sm text-muted-foreground">Save reusable sections, past performance, and team bios for faster proposals.</p>
          <Button className="mt-4"><Plus className="h-4 w-4 mr-2" /> Add First Entry</Button>
        </div>
      </div>
    </div>
  );
}
