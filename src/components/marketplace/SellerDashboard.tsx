import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMarketplace } from "@/hooks/useMarketplace";
import { CreateTemplateDialog } from "./CreateTemplateDialog";
import { Plus, DollarSign, Download, Star } from "lucide-react";

export function SellerDashboard() {
  const { myTemplates, sales } = useMarketplace();
  const [createOpen, setCreateOpen] = useState(false);

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.price_paid) * 0.7, 0);
  const totalDownloads = myTemplates.reduce((sum, t) => sum + t.download_count, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue (70%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">${totalRevenue.toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{totalDownloads}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{myTemplates.length}</span>
          </CardContent>
        </Card>
      </div>

      {/* Template list */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Templates</h3>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Template
        </Button>
      </div>

      {myTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12">
            <p className="text-muted-foreground text-sm">No templates yet. Create your first one!</p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Create Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {myTemplates.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{t.description}</p>
                </div>
                <Badge variant={t.status === "published" ? "default" : "secondary"}>
                  {t.status}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3" /> {Number(t.avg_rating).toFixed(1)}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Download className="h-3 w-3" /> {t.download_count}
                </div>
                <span className="text-sm font-bold text-primary">
                  {t.price <= 0 ? "Free" : `$${Number(t.price).toFixed(0)}`}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateTemplateDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
