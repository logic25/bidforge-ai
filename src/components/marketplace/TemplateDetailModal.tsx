import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Star, Download, Package, ArrowDownToLine } from "lucide-react";
import type { MarketplaceTemplate } from "@/hooks/useMarketplace";
import { useMarketplace, useTemplateReviews } from "@/hooks/useMarketplace";
import { useTierGating } from "@/hooks/useTierGating";

interface Props {
  template: MarketplaceTemplate | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function TemplateDetailModal({ template, open, onOpenChange }: Props) {
  const { purchasedIds, purchaseTemplate, importToLibrary, submitReview } = useMarketplace();
  const { canBuyTemplates } = useTierGating();
  const { data: reviews } = useTemplateReviews(template?.id);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  if (!template) return null;

  const owned = purchasedIds.has(template.id);
  const isFree = template.price <= 0;
  const previewItems = Array.isArray(template.preview_content) ? template.preview_content : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{template.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-warning text-warning" />
              {Number(template.avg_rating).toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" /> {template.download_count} downloads
            </div>
            <Badge variant="secondary">{template.category}</Badge>
            <span className="text-lg font-bold text-primary ml-auto">
              {isFree ? "Free" : `$${Number(template.price).toFixed(0)}`}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm">{template.description}</p>

          {/* Tags */}
          {template.industry_tags?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.industry_tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}

          {/* Preview */}
          {previewItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Preview</h4>
              <div className="rounded-lg border p-3 space-y-2 bg-muted/50 max-h-48 overflow-y-auto">
                {previewItems.map((item: any, i: number) => (
                  <div key={i}>
                    <p className="text-xs font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-3">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            {owned ? (
              <Button onClick={() => importToLibrary.mutate(template)} disabled={importToLibrary.isPending}>
                <ArrowDownToLine className="h-4 w-4 mr-2" /> Import to Library
              </Button>
            ) : canBuyTemplates || isFree ? (
              <Button onClick={() => purchaseTemplate.mutate(template)} disabled={purchaseTemplate.isPending}>
                <Package className="h-4 w-4 mr-2" /> {isFree ? "Get Free" : "Purchase"}
              </Button>
            ) : (
              <Button disabled variant="outline">Upgrade to Pro to purchase</Button>
            )}
          </div>

          {/* Reviews */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Reviews ({reviews?.length ?? 0})</h4>
            {reviews?.map((r) => (
              <div key={r.id} className="rounded border p-3 space-y-1">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-warning text-warning" : "text-muted"}`} />
                  ))}
                </div>
                {r.review_text && <p className="text-xs text-muted-foreground">{r.review_text}</p>}
              </div>
            ))}

            {owned && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs font-medium">Leave a review</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)}>
                      <Star className={`h-4 w-4 ${s <= rating ? "fill-warning text-warning" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={2}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    submitReview.mutate({ template_id: template.id, rating, review_text: reviewText });
                    setReviewText("");
                  }}
                  disabled={submitReview.isPending}
                >
                  Submit Review
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
