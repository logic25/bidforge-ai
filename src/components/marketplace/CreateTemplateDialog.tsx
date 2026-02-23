import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useMarketplace, TEMPLATE_CATEGORIES } from "@/hooks/useMarketplace";
import { useRfpContent } from "@/hooks/useRfpContent";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function CreateTemplateDialog({ open, onOpenChange }: Props) {
  const { createTemplate } = useMarketplace();
  const { content: libraryContent } = useRfpContent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [tags, setTags] = useState("");
  const [price, setPrice] = useState("0");
  const [selectedContentIds, setSelectedContentIds] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(1);

  const toggleContent = (id: string) => {
    setSelectedContentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = () => {
    const selectedItems = libraryContent.filter((c) => selectedContentIds.has(c.id));
    const contentPayload = selectedItems.map((c) => ({
      title: c.title,
      content: c.content,
      category: c.category,
      tags: c.tags,
    }));
    const previewPayload = selectedItems.slice(0, 3).map((c) => ({
      title: c.title,
      content: (c.content || "").slice(0, 200) + "...",
    }));

    createTemplate.mutate({
      title,
      description,
      category,
      industry_tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      price: parseFloat(price) || 0,
      content: contentPayload,
      preview_content: previewPayload,
      status: "published",
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("general");
    setTags("");
    setPrice("0");
    setSelectedContentIds(new Set());
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) resetForm(); onOpenChange(o); }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Template — Step {step} of 2</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Federal IT Proposal Pack" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEMPLATE_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" min="0" max="999" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Industry Tags (comma-separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="federal, IT, cybersecurity" />
            </div>
            <Button onClick={() => setStep(2)} disabled={!title.trim()} className="w-full">
              Next: Select Content
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Select items from your Content Library to include in this template:</p>
            {libraryContent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No content in your library yet. Add content first.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {libraryContent.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded border p-3">
                    <Checkbox
                      checked={selectedContentIds.has(item.id)}
                      onCheckedChange={() => toggleContent(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">{item.category}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button
                onClick={handleCreate}
                disabled={selectedContentIds.size === 0 || createTemplate.isPending}
                className="flex-1"
              >
                Publish Template
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
