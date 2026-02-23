import { useState } from "react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Search, Settings2, Plus, Trash2, ArrowRight, X, Bell, Globe, Calendar, DollarSign, Star } from "lucide-react";
import { format } from "date-fns";

function scoreColor(score: number) {
  if (score >= 80) return "bg-success/10 text-success border-success/20";
  if (score >= 50) return "bg-warning/10 text-warning border-warning/20";
  return "bg-muted text-muted-foreground";
}

export default function Discovery() {
  const { discovered, sources, rules, isLoading, dismissRfp, addToPipeline, createSource, deleteSource, createRule, deleteRule } = useDiscovery();
  const [search, setSearch] = useState("");
  const [showDismissed, setShowDismissed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<any>(null);

  // Settings form state
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newKeywords, setNewKeywords] = useState("");
  const [newAgencyFilter, setNewAgencyFilter] = useState("");

  const filtered = discovered.filter((d) => {
    if (!showDismissed && d.is_dismissed) return false;
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.agency?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAddSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;
    createSource.mutate({ name: newSourceName, url: newSourceUrl });
    setNewSourceName("");
    setNewSourceUrl("");
  };

  const handleAddRule = () => {
    const keywords = newKeywords.split(",").map((k) => k.trim()).filter(Boolean);
    const agencies = newAgencyFilter.split(",").map((a) => a.trim()).filter(Boolean);
    if (keywords.length === 0 && agencies.length === 0) return;
    createRule.mutate({ keywords, agency_filter: agencies });
    setNewKeywords("");
    setNewAgencyFilter("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discovery</h1>
          <p className="text-muted-foreground">Auto-discovered RFPs matching your criteria</p>
        </div>
        <Button variant="outline" onClick={() => setSettingsOpen(true)}>
          <Settings2 className="h-4 w-4 mr-2" /> Settings
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search discoveries..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={showDismissed} onCheckedChange={setShowDismissed} />
          <Label className="text-sm">Show dismissed</Label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <Search className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No discoveries yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">Add sources and monitoring rules in Settings to start discovering RFPs.</p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" /> You'll be notified when new RFPs are found
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id} className={`cursor-pointer transition-shadow hover:shadow-md ${item.is_dismissed ? "opacity-50" : ""} ${item.added_to_pipeline ? "border-primary/30" : ""}`} onClick={() => setDetailItem(item)}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-medium line-clamp-2">{item.title}</CardTitle>
                  <Badge className={scoreColor(Number(item.relevance_score))}>
                    <Star className="h-3 w-3 mr-1" />
                    {Math.round(Number(item.relevance_score))}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.agency && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Globe className="h-3 w-3" /> {item.agency}
                  </div>
                )}
                {item.deadline && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {format(new Date(item.deadline), "MMM d, yyyy")}
                  </div>
                )}
                {item.value_estimate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" /> ${Number(item.value_estimate).toLocaleString()}
                  </div>
                )}
                {item.added_to_pipeline && <Badge variant="outline" className="text-xs">In Pipeline</Badge>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={!!detailItem} onOpenChange={(o) => !o && setDetailItem(null)}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          {detailItem && (
            <>
              <SheetHeader>
                <SheetTitle>{detailItem.title}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={scoreColor(Number(detailItem.relevance_score))}>
                    {Math.round(Number(detailItem.relevance_score))}% match
                  </Badge>
                  {detailItem.added_to_pipeline && <Badge variant="outline">In Pipeline</Badge>}
                </div>
                {detailItem.agency && <p className="text-sm"><span className="text-muted-foreground">Agency:</span> {detailItem.agency}</p>}
                {detailItem.deadline && <p className="text-sm"><span className="text-muted-foreground">Deadline:</span> {format(new Date(detailItem.deadline), "MMM d, yyyy")}</p>}
                {detailItem.value_estimate && <p className="text-sm"><span className="text-muted-foreground">Est. Value:</span> ${Number(detailItem.value_estimate).toLocaleString()}</p>}
                {detailItem.match_reason && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-1">Match Reasons</h4>
                      <p className="text-sm text-muted-foreground">{detailItem.match_reason}</p>
                    </div>
                  </>
                )}
                {detailItem.description && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{detailItem.description}</p>
                    </div>
                  </>
                )}
                {detailItem.source_url && (
                  <a href={detailItem.source_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                    View source →
                  </a>
                )}
                <Separator />
                <div className="flex gap-2">
                  {!detailItem.added_to_pipeline && (
                    <Button onClick={() => { addToPipeline.mutate(detailItem); setDetailItem(null); }} disabled={addToPipeline.isPending}>
                      <ArrowRight className="h-4 w-4 mr-2" /> Add to Pipeline
                    </Button>
                  )}
                  {!detailItem.is_dismissed && (
                    <Button variant="outline" onClick={() => { dismissRfp.mutate(detailItem.id); setDetailItem(null); }}>
                      <X className="h-4 w-4 mr-2" /> Dismiss
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Discovery Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Sources */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Monitoring Sources</h3>
              <div className="space-y-2 mb-3">
                {sources.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">{s.url}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSource.mutate(s.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Source name" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} />
                <Input placeholder="URL" value={newSourceUrl} onChange={(e) => setNewSourceUrl(e.target.value)} />
                <Button size="sm" onClick={handleAddSource} disabled={!newSourceName.trim() || !newSourceUrl.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Rules */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Monitoring Rules</h3>
              <div className="space-y-2 mb-3">
                {rules.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      {r.keywords && r.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {r.keywords.map((k) => <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>)}
                        </div>
                      )}
                      {r.agency_filter && r.agency_filter.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">Agencies: {r.agency_filter.join(", ")}</p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteRule.mutate(r.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Input placeholder="Keywords (comma-separated)" value={newKeywords} onChange={(e) => setNewKeywords(e.target.value)} />
                <Input placeholder="Agency filter (comma-separated)" value={newAgencyFilter} onChange={(e) => setNewAgencyFilter(e.target.value)} />
                <Button size="sm" onClick={handleAddRule}>
                  <Plus className="h-4 w-4 mr-2" /> Add Rule
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
