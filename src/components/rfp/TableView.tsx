import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type RfpRow = Database["public"]["Tables"]["rfps"]["Row"];

const stageColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  review: "bg-warning/10 text-warning",
  submitted: "bg-primary/10 text-primary",
  won: "bg-success/10 text-success",
  lost: "bg-destructive/10 text-destructive",
};

type SortKey = "title" | "agency" | "deadline" | "stage" | "bid_amount" | "bid_no_bid_score";

interface TableViewProps {
  rfps: RfpRow[];
  onClickRfp: (rfp: RfpRow) => void;
}

export function TableView({ rfps, onClickRfp }: TableViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>("deadline");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sorted = [...rfps].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortAsc ? cmp : -cmp;
  });

  const SortHeader = ({ label, keyName }: { label: string; keyName: SortKey }) => (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort(keyName)}>
      {label}
      <ArrowUpDown className="h-3 w-3 ml-1" />
    </Button>
  );

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead><SortHeader label="Title" keyName="title" /></TableHead>
            <TableHead><SortHeader label="Agency" keyName="agency" /></TableHead>
            <TableHead><SortHeader label="Deadline" keyName="deadline" /></TableHead>
            <TableHead><SortHeader label="Stage" keyName="stage" /></TableHead>
            <TableHead><SortHeader label="Bid Amount" keyName="bid_amount" /></TableHead>
            <TableHead><SortHeader label="Score" keyName="bid_no_bid_score" /></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No RFPs yet. Click "New RFP" to get started.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((rfp) => (
              <TableRow key={rfp.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onClickRfp(rfp)}>
                <TableCell className="font-medium">{rfp.title}</TableCell>
                <TableCell>{rfp.agency || "—"}</TableCell>
                <TableCell>{rfp.deadline ? format(new Date(rfp.deadline), "MMM d, yyyy") : "—"}</TableCell>
                <TableCell><Badge className={stageColors[rfp.stage]}>{rfp.stage}</Badge></TableCell>
                <TableCell>{rfp.bid_amount ? `$${Number(rfp.bid_amount).toLocaleString()}` : "—"}</TableCell>
                <TableCell>
                  {rfp.bid_no_bid_score != null ? (
                    <Badge className={rfp.bid_no_bid_score >= 70 ? "bg-success/10 text-success" : rfp.bid_no_bid_score >= 40 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}>
                      {rfp.bid_no_bid_score}%
                    </Badge>
                  ) : "—"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
