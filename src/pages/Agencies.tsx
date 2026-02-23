import { useState } from "react";
import { useAgencies } from "@/hooks/useAgencies";
import { useCompany } from "@/hooks/useCompany";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Building2,
  ExternalLink,
  Globe,
  Loader2,
  Radar,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const TYPE_COLORS: Record<string, string> = {
  state: "bg-primary/10 text-primary border-primary/20",
  municipal: "bg-success/10 text-success border-success/20",
  authority: "bg-warning/10 text-warning border-warning/20",
  federal: "bg-destructive/10 text-destructive border-destructive/20",
  government: "bg-muted text-muted-foreground",
};

export default function Agencies() {
  const { company } = useCompany();
  const {
    agencies,
    rfpCounts,
    monitoredMap,
    isLoading,
    toggleMonitor,
    scanAgency,
  } = useAgencies();

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [scanningIds, setScanningIds] = useState<Set<string>>(new Set());

  const companyStates = company?.states || [];
  const allStates = [...new Set(agencies.map((a) => a.state))].sort();
  const allTypes = [...new Set(agencies.map((a) => a.agency_type))].sort();

  const filtered = agencies.filter((a) => {
    if (stateFilter && a.state !== stateFilter) return false;
    if (typeFilter && a.agency_type !== typeFilter) return false;
    if (
      search &&
      !a.name.toLowerCase().includes(search.toLowerCase()) &&
      !(a.industry_tags || []).some((t) =>
        t.toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;
    return true;
  });

  const monitoredCount = agencies.filter((a) => monitoredMap.has(a.id)).length;

  const handleScan = async (agencyId: string, sourceId: string) => {
    setScanningIds((prev) => new Set(prev).add(agencyId));
    try {
      await scanAgency.mutateAsync(sourceId);
    } finally {
      setScanningIds((prev) => {
        const next = new Set(prev);
        next.delete(agencyId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Agencies</h1>
        <p className="text-muted-foreground">
          {agencies.length} agencies across {allStates.length} state
          {allStates.length !== 1 ? "s" : ""} · {monitoredCount} monitored
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search agencies or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          <Badge
            variant={stateFilter === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStateFilter(null)}
          >
            All States
          </Badge>
          {allStates.map((s) => (
            <Badge
              key={s}
              variant={stateFilter === s ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStateFilter(stateFilter === s ? null : s)}
            >
              {s}
            </Badge>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {allTypes.map((t) => (
            <Badge
              key={t}
              variant={typeFilter === t ? "default" : "outline"}
              className="cursor-pointer capitalize"
              onClick={() => setTypeFilter(typeFilter === t ? null : t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      {/* Agency List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
          <Building2 className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No agencies found</h3>
          <p className="mt-2 text-sm text-muted-foreground text-center max-w-md">
            {agencies.length === 0
              ? `No agencies loaded for ${companyStates.join(", ") || "your states"}. Agency discovery coming soon — we'll automatically find procurement portals in your selected states.`
              : "Try adjusting your search or filters."}
          </p>
          {agencies.length === 0 && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                toast.info(
                  "Agency discovery coming soon — we'll automatically find procurement portals in your selected states."
                )
              }
            >
              <Radar className="h-4 w-4 mr-2" /> Discover Agencies
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((agency) => {
            const monitored = monitoredMap.get(agency.id);
            const isMonitored = !!monitored;
            const rfpCount =
              rfpCounts[agency.name] || 0;
            const isScanning = scanningIds.has(agency.id);

            return (
              <Card key={agency.id} className="transition-shadow hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm truncate">
                          {agency.name}
                        </h3>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {agency.state}
                        </Badge>
                        <Badge
                          className={`text-xs capitalize shrink-0 ${
                            TYPE_COLORS[agency.agency_type] || TYPE_COLORS.government
                          }`}
                        >
                          {agency.agency_type}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {agency.procurement_url && (
                          <a
                            href={agency.procurement_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <FileText className="h-3 w-3" /> Procurement
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {agency.website && (
                          <a
                            href={agency.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Globe className="h-3 w-3" /> Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {rfpCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {rfpCount} RFP{rfpCount !== 1 ? "s" : ""}
                          </span>
                        )}
                        {monitored?.lastChecked && (
                          <span className="text-xs text-muted-foreground">
                            Scanned{" "}
                            {formatDistanceToNow(
                              new Date(monitored.lastChecked),
                              { addSuffix: true }
                            )}
                          </span>
                        )}
                      </div>

                      {agency.industry_tags && agency.industry_tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {agency.industry_tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isMonitored && agency.procurement_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isScanning}
                          onClick={() =>
                            handleScan(agency.id, monitored!.sourceId)
                          }
                        >
                          {isScanning ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <Radar className="h-3.5 w-3.5 mr-1" />
                          )}
                          Scan
                        </Button>
                      )}

                      {agency.procurement_url && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">
                            Monitor
                          </span>
                          <Switch
                            checked={isMonitored}
                            onCheckedChange={() =>
                              toggleMonitor.mutate({
                                agencyId: agency.id,
                                agencyName: agency.name,
                                procurementUrl: agency.procurement_url!,
                                isCurrentlyMonitored: isMonitored,
                                sourceId: monitored?.sourceId,
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Discover button at bottom */}
      {agencies.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() =>
              toast.info(
                "Agency discovery coming soon — we'll automatically find procurement portals in your selected states."
              )
            }
          >
            <Radar className="h-4 w-4 mr-2" /> Discover More Agencies
          </Button>
        </div>
      )}
    </div>
  );
}
