import { Star, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MarketplaceTemplate } from "@/hooks/useMarketplace";

interface TemplateCardProps {
  template: MarketplaceTemplate;
  onClick: (t: MarketplaceTemplate) => void;
  purchased?: boolean;
}

export function TemplateCard({ template, onClick, purchased }: TemplateCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow group overflow-hidden"
      onClick={() => onClick(template)}
    >
      <div className="h-32 bg-muted flex items-center justify-center relative overflow-hidden">
        {template.thumbnail_url ? (
          <img src={template.thumbnail_url} alt={template.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-4xl font-bold text-muted-foreground/20">{template.category.charAt(0).toUpperCase()}</div>
        )}
        {purchased && (
          <Badge className="absolute top-2 right-2 bg-success text-success-foreground">Owned</Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-sm line-clamp-1">{template.title}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-warning text-warning" />
            <span className="text-xs font-medium">{Number(template.avg_rating).toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="h-3 w-3" />
            {template.download_count}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">{template.category}</Badge>
          <span className="text-sm font-bold text-primary">
            {template.price <= 0 ? "Free" : `$${Number(template.price).toFixed(0)}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
