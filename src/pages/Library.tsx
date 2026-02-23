import { useState } from "react";
import { useRfpContent } from "@/hooks/useRfpContent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, BookOpen } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type ContentCategory = Database["public"]["Enums"]["content_category"];
type ContentRow = Database["public"]["Tables"]["rfp_content"]["Row"];

const CATEGORIES: { value: ContentCategory; label: string }[] = [
  { value: "boilerplate", label: "Boilerplate" },
  { value: "case_study", label: "Case Studies" },
  { value: "team_bio", label: "Team Bios" },
  { value: "certification", label: "Certifications" },
  { value: "past_performance", label: "Past Performance" },
  { value: "compliance", label: "Compliance" },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState<ContentCategory>("boilerplate");
  const { content, isLoading, createContent, updateContent, deleteContent } = useRfpContent(activeTab);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ContentRow | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  const filtered = content.filter(
    (c) => c.title.toLowerCase().includes(search.toLowerCase()) ||
           c.content?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditing(null);
    setTitle("");
    setBody("");
    setTags("");
    setDialogOpen(true);
  };

  const openEdit = (item: ContentRow) => {
    setEditing(item);
    setTitle(item.title);
    setBody(item.content || "");
    setTags((item.tags || []).join(", "));
    setDialogOpen(true);
  };

  const handleSave = () => {
    const tagArr = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (editing) {
      updateContent.mutate({ id: editing.id, title, content: body, tags: tagArr });
    } else {
      createContent.mutate({ title, content: body, tags: tagArr, category: activeTab });
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">Reusable proposal content and boilerplate</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" /> Add Content
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentCategory)}>
        <TabsList className="flex-wrap">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>{cat.label}</TabsTrigger>
          ))}
        </TabsList>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="mt-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
                <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No {cat.label} yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Add your first entry to build your library.</p>
                <Button className="mt-4" onClick={openNew}>
                  <Plus className="h-4 w-4 mr-2" /> Add {cat.label}
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filtered.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteContent.mutate(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">Used {item.usage_count} times</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Content" : "Add Content"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={8} />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. safety, OSHA, federal" />
            </div>
            <Button onClick={handleSave} disabled={!title.trim()} className="w-full">
              {editing ? "Update" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
