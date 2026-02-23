import { useState } from "react";
import { useBidScoring, calculateBidScore, getScoreRecommendation } from "@/hooks/useBidScoring";
import { useRfps } from "@/hooks/useRfps";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface BidScoreTabProps {
  rfpId: string;
  currentScore: number | null;
}

export function BidScoreTab({ rfpId, currentScore }: BidScoreTabProps) {
  const { criteria, isLoading, initDefaults } = useBidScoring();
  const { updateRfp } = useRfps();
  const [scores, setScores] = useState<Record<string, number>>({});

  const result = calculateBidScore(criteria, scores);
  const recommendation = getScoreRecommendation(result.percent);

  const handleScoreChange = (criterionId: string, value: number) => {
    const newScores = { ...scores, [criterionId]: value };
    setScores(newScores);

    // Update the RFP bid_no_bid_score
    const newResult = calculateBidScore(criteria, newScores);
    updateRfp.mutate({ id: rfpId, bid_no_bid_score: newResult.percent });
  };

  if (isLoading) {
    return <div className="flex justify-center py-4"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (criteria.length === 0) {
    return (
      <div className="text-center py-6 space-y-3">
        <p className="text-sm text-muted-foreground">No scoring criteria configured yet.</p>
        <button
          className="text-sm text-primary underline"
          onClick={() => initDefaults.mutate()}
          disabled={initDefaults.isPending}
        >
          Initialize default criteria
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Weighted Score</p>
          <p className="text-2xl font-bold">{result.percent}%</p>
        </div>
        <Badge className={recommendation.className + " text-sm px-3 py-1"}>
          {recommendation.label}
        </Badge>
      </div>

      <div className="space-y-4">
        {criteria.map((c) => (
          <div key={c.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.criterion_name}</p>
                <p className="text-xs text-muted-foreground">Weight: {c.weight}/5</p>
              </div>
              <span className="text-sm font-mono w-8 text-right">{scores[c.id] ?? 5}</span>
            </div>
            <Slider
              value={[scores[c.id] ?? 5]}
              min={1}
              max={10}
              step={1}
              onValueChange={([v]) => handleScoreChange(c.id, v)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
