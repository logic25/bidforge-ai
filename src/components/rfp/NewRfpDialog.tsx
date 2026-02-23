import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Upload, Sparkles, Loader2 } from "lucide-react";
import { useRfps } from "@/hooks/useRfps";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewRfpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ExtractedSection {
  title: string;
  content: string;
  section_order: number;
}

export function NewRfpDialog({ open, onOpenChange }: NewRfpDialogProps) {
  const { createRfp } = useRfps();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [agency, setAgency] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [pdfText, setPdfText] = useState("");
  const [sections, setSections] = useState<ExtractedSection[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  const reset = () => {
    setStep(1);
    setTitle("");
    setAgency("");
    setDeadline("");
    setDescription("");
    setPdfText("");
    setSections([]);
    setDraftContent("");
  };

  const handleExtract = async () => {
    if (!pdfText.trim()) {
      toast.info("Paste your RFP text to extract sections, or skip this step.");
      return;
    }
    setExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke("extract-rfp", {
        body: { text: pdfText },
      });
      if (error) throw error;
      setSections(data.sections || []);
      setStep(3);
    } catch (e: any) {
      toast.error(e.message || "Failed to extract sections");
    }
    setExtracting(false);
  };

  const handleCreate = async () => {
    setGenerating(true);
    try {
      const rfp = await createRfp.mutateAsync({
        title,
        agency: agency || null,
        deadline: deadline ? new Date(deadline).toISOString() : null,
        description: description || null,
      });

      // Save sections if any
      if (sections.length > 0 && rfp) {
        await supabase.from("rfp_sections").insert(
          sections.map((s) => ({ ...s, rfp_id: rfp.id }))
        );
      }

      // Generate draft if sections exist
      if (sections.length > 0 && rfp) {
        const { data } = await supabase.functions.invoke("generate-rfp-cover-letter", {
          body: { rfp_id: rfp.id },
        });
        if (data?.content) setDraftContent(data.content);
      }

      toast.success("RFP created successfully!");
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to create RFP");
    }
    setGenerating(false);
  };

  const updateSection = (index: number, field: keyof ExtractedSection, value: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New RFP — Step {step} of 4</DialogTitle>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`} />
            ))}
          </div>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. City Hall Renovation Project" />
            </div>
            <div className="space-y-2">
              <Label>Agency</Label>
              <Input value={agency} onChange={(e) => setAgency(e.target.value)} placeholder="e.g. NYC DDC" />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the RFP..." rows={3} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>Paste your RFP document text below for AI section extraction</span>
            </div>
            <Textarea
              value={pdfText}
              onChange={(e) => setPdfText(e.target.value)}
              placeholder="Paste the full RFP document text here..."
              rows={12}
              className="font-mono text-sm"
            />
            <Button onClick={handleExtract} disabled={extracting} className="w-full">
              {extracting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Extracting sections...</>
              ) : (
                <><Sparkles className="h-4 w-4 mr-2" /> Extract Sections with AI</>
              )}
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {sections.length} sections extracted. Edit as needed:
            </p>
            {sections.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No sections extracted. You can skip this step.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {sections.map((section, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2">
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(i, "title", e.target.value)}
                      className="font-medium"
                    />
                    <Textarea
                      value={section.content}
                      onChange={(e) => updateSection(i, "content", e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Ready to create your RFP. AI will generate a draft response based on the extracted sections.
            </p>
            <div className="rounded-lg border p-4 space-y-2 bg-muted/30">
              <p className="text-sm"><strong>Title:</strong> {title}</p>
              <p className="text-sm"><strong>Agency:</strong> {agency || "—"}</p>
              <p className="text-sm"><strong>Deadline:</strong> {deadline || "—"}</p>
              <p className="text-sm"><strong>Sections:</strong> {sections.length} extracted</p>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          ) : <div />}
          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!title.trim()}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 2 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setSections([]); setStep(3); }}>
                Skip
              </Button>
            </div>
          )}
          {step === 3 && (
            <Button onClick={() => setStep(4)}>
              Next <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
          {step === 4 && (
            <Button onClick={handleCreate} disabled={generating}>
              {generating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
              ) : (
                "Create RFP & Generate Draft"
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
