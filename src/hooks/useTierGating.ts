import { useCompany } from "./useCompany";
import { useRfps } from "./useRfps";

export type Tier = "free" | "pro" | "team" | "enterprise";

interface TierLimits {
  maxRfps: number;
  maxUsers: number;
  maxAiGens: number;
  canBuyTemplates: boolean;
  canSellTemplates: boolean;
  label: string;
  price: number;
}

const TIER_CONFIG: Record<Tier, TierLimits> = {
  free: { maxRfps: 5, maxUsers: 1, maxAiGens: 10, canBuyTemplates: false, canSellTemplates: false, label: "Free", price: 0 },
  pro: { maxRfps: 25, maxUsers: 3, maxAiGens: 100, canBuyTemplates: true, canSellTemplates: false, label: "Pro", price: 79 },
  team: { maxRfps: Infinity, maxUsers: 10, maxAiGens: Infinity, canBuyTemplates: true, canSellTemplates: true, label: "Team", price: 199 },
  enterprise: { maxRfps: Infinity, maxUsers: Infinity, maxAiGens: Infinity, canBuyTemplates: true, canSellTemplates: true, label: "Enterprise", price: 499 },
};

export { TIER_CONFIG };

export function useTierGating() {
  const { company } = useCompany();
  const { rfps } = useRfps();

  const tier = (company?.subscription_tier as Tier) || "free";
  const limits = TIER_CONFIG[tier];
  const activeRfps = rfps.filter((r) => r.stage !== "won" && r.stage !== "lost").length;

  return {
    tier,
    limits,
    activeRfps,
    isAtRfpLimit: activeRfps >= limits.maxRfps,
    canBuyTemplates: limits.canBuyTemplates,
    canSellTemplates: limits.canSellTemplates,
    tierLabel: limits.label,
  };
}
