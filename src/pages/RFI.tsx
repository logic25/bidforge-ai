import { useState } from "react";
import { useRfi } from "@/hooks/useRfi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileQuestion, Plus, Send, Trash2, Copy, Eye } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  sent: "bg-primary/10 text-primary",
  viewed: "bg-warning/10 text-warning",
  responded: "bg-success/10 text-success",
};

export default function RFI() {
  const { rfis, templates, isLoading, createRfi, sendRfi, deleteRfi, createTemplate, deleteTemplate } = useRfi();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [viewRfi, setViewRfi] = useState<any>(null);

  // New RFI form
  const [projectName, setProjectName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [questions, setQuestions] = useState<string[]>([""]);

  // Template form
  const [tmplName, setTmplName] = useState("");
  const [tmplDesc, setTmplDesc] = useState("");
  const [tmplQuestions, setTmplQuestions] = useState<string[]>([""]);

  const addQuestion = () => setQuestions([...questions, ""]);
  const updateQuestion = (i: number, val: string) => {
    const q = [...questions];
    q[i] = val;
    setQuestions(q);
  };
  const removeQuestion = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));

  const handleCreate = () => {
    const qs = questions.filter((q) => q.trim());
    if (!projectName.trim() || qs.length === 0) return;
    createRfi.mutate({
      project_name: projectName,
      questions: qs.map((q, i) => ({ id: i + 1, question: q })),
      recipient_name: recipientName || undefined,
      recipient_email: recipientEmail || undefined,
    });
    setDialogOpen(false);
    setProjectName("");
    setRecipientName("");
    setRecipientEmail("");
    setQuestions([""]);
  };

  const handleCreateTemplate = () => {
    const qs = tmplQuestions.filter((q) => q.trim());
    if (!tmplName.trim() || qs.length === 0) return;
    createTemplate.mutate({
      name: tmplName,
      description: tmplDesc || undefined,
      questions: qs.map((q, i) => ({ id: i + 1, question: q })),
    });
    setTemplateDialogOpen(false);
    setTmplName("");
    setTmplDesc("");
    setTmplQuestions([""]);
  };

  const loadTemplate = (tmpl: any) => {
    const qs = (tmpl.questions as any[]).map((q: any) => q.question || "");
    setQuestions(qs);
    setProjectName(tmpl.name);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RFI Manager</h1>
          <p className="text-muted-foreground">Track questions and clarifications</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New RFI
        </Button>
      </div>

      <Tabs defaultValue="rfis">
        <TabsList>
          <TabsTrigger value="rfis">RFI Requests</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="rfis" className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : rfis.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No RFIs tracked</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create RFIs to track questions and responses across your proposals.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rfis.map((rfi) => (
                <Card key={rfi.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{rfi.project_name}</p>
                        <Badge className={statusColors[rfi.status]}>{rfi.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rfi.recipient_name && `To: ${rfi.recipient_name}`}
                        {rfi.recipient_email && ` (${rfi.recipient_email})`}
                        {" · "}{(rfi.questions as any[])?.length || 0} questions
                        {rfi.created_at && ` · ${format(new Date(rfi.created_at), "MMM d, yyyy")}`}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewRfi(rfi)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {rfi.status === "draft" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => sendRfi.mutate(rfi.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteRfi.mutate(rfi.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button size="sm" onClick={() => setTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          </div>
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
              <Copy className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No templates</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create reusable RFI question templates.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((tmpl) => (
                <Card key={tmpl.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{tmpl.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadTemplate(tmpl)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTemplate.mutate(tmpl.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {tmpl.description && <p className="text-xs text-muted-foreground mb-2">{tmpl.description}</p>}
                    <p className="text-xs text-muted-foreground">{(tmpl.questions as any[])?.length || 0} questions</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* New RFI Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New RFI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Recipient Name</Label>
                <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Recipient Email</Label>
                <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Questions</Label>
              {questions.map((q, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={q} onChange={(e) => updateQuestion(i, e.target.value)} placeholder={`Question ${i + 1}`} />
                  {questions.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeQuestion(i)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="h-3 w-3 mr-1" /> Add Question
              </Button>
            </div>
            <Button onClick={handleCreate} disabled={!projectName.trim()} className="w-full">
              Create RFI
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Template Name</Label>
              <Input value={tmplName} onChange={(e) => setTmplName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={tmplDesc} onChange={(e) => setTmplDesc(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Questions</Label>
              {tmplQuestions.map((q, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={q} onChange={(e) => {
                    const qs = [...tmplQuestions];
                    qs[i] = e.target.value;
                    setTmplQuestions(qs);
                  }} placeholder={`Question ${i + 1}`} />
                  {tmplQuestions.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setTmplQuestions(tmplQuestions.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setTmplQuestions([...tmplQuestions, ""])}>
                <Plus className="h-3 w-3 mr-1" /> Add Question
              </Button>
            </div>
            <Button onClick={handleCreateTemplate} disabled={!tmplName.trim()} className="w-full">Save Template</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View RFI Dialog */}
      <Dialog open={!!viewRfi} onOpenChange={(o) => !o && setViewRfi(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewRfi?.project_name}</DialogTitle>
          </DialogHeader>
          {viewRfi && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Badge className={statusColors[viewRfi.status]}>{viewRfi.status}</Badge>
                {viewRfi.recipient_name && <span className="text-sm">To: {viewRfi.recipient_name}</span>}
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Questions</h4>
                {(viewRfi.questions as any[])?.map((q: any, i: number) => (
                  <div key={i} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">Q{q.id}: {q.question}</p>
                  </div>
                ))}
              </div>
              {viewRfi.response_data && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Responses</h4>
                  <div className="rounded-lg border p-3 bg-muted/30">
                    <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(viewRfi.response_data, null, 2)}</pre>
                  </div>
                </div>
              )}
              {viewRfi.response_token && (
                <div className="text-xs text-muted-foreground">
                  Response link: /rfi/{viewRfi.response_token}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
