import { useState } from "react";
import { useMarketplace, TEMPLATE_CATEGORIES } from "@/hooks/useMarketplace";
import { useTierGating } from "@/hooks/useTierGating";
import { TemplateCard } from "@/components/marketplace/TemplateCard";
import { TemplateDetailModal } from "@/components/marketplace/TemplateDetailModal";
import { SellerDashboard } from "@/components/marketplace/SellerDashboard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp, Star, Store, ShoppingBag } from "lucide-react";
import type { MarketplaceTemplate } from "@/hooks/useMarketplace";

export default function Templates() {
  const { templates, purchasedIds, isLoading } = useMarketplace();
  const { canSellTemplates } = useTierGating();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [selected, setSelected] = useState<MarketplaceTemplate | null>(null);

  const filtered = templates.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all" && t.category !== category) return false;
    if (priceFilter === "free" && t.price > 0) return false;
    if (priceFilter === "paid" && t.price <= 0) return false;
    return true;
  });

  const trending = [...templates]
    .sort((a, b) => b.download_count - a.download_count)
    .slice(0, 4);

  const featured = [...templates]
    .sort((a, b) => Number(b.avg_rating) - Number(a.avg_rating))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Template Marketplace</h1>
          <p className="text-muted-foreground">Browse, buy, and sell proposal templates</p>
        </div>
      </div>

      <Tabs defaultValue="browse">
        <TabsList>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Browse
          </TabsTrigger>
          {canSellTemplates && (
            <TabsTrigger value="sell" className="flex items-center gap-2">
              <Store className="h-4 w-4" /> Sell
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="space-y-6 mt-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Featured section */}
          {!search && category === "all" && featured.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                <h2 className="text-lg font-semibold">Featured</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((t) => (
                  <TemplateCard key={t.id} template={t} onClick={setSelected} purchased={purchasedIds.has(t.id)} />
                ))}
              </div>
            </div>
          )}

          {/* Trending section */}
          {!search && category === "all" && trending.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-semibold">Trending</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trending.map((t) => (
                  <TemplateCard key={t.id} template={t} onClick={setSelected} purchased={purchasedIds.has(t.id)} />
                ))}
              </div>
            </div>
          )}

          {/* All templates */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              {search || category !== "all" ? "Results" : "All Templates"}
              <Badge variant="secondary" className="ml-2">{filtered.length}</Badge>
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No templates found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {templates.length === 0
                    ? "Be the first to publish a template!"
                    : "Try adjusting your filters."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((t) => (
                  <TemplateCard key={t.id} template={t} onClick={setSelected} purchased={purchasedIds.has(t.id)} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {canSellTemplates && (
          <TabsContent value="sell" className="mt-4">
            <SellerDashboard />
          </TabsContent>
        )}
      </Tabs>

      <TemplateDetailModal template={selected} open={!!selected} onOpenChange={(o) => !o && setSelected(null)} />
    </div>
  );
}
