import { useState } from "react";
import { useTierGating, TIER_CONFIG, type Tier } from "@/hooks/useTierGating";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Check, Crown, Zap, Building2, Shield } from "lucide-react";
import { toast } from "sonner";

const TIER_ICONS: Record<Tier, any> = {
  free: Zap,
  pro: Crown,
  team: Building2,
  enterprise: Shield,
};

const TIER_FEATURES: Record<Tier, string[]> = {
  free: ["5 active RFPs", "1 team member", "10 AI generations/mo", "Basic pipeline"],
  pro: ["25 active RFPs", "3 team members", "100 AI generations/mo", "Buy marketplace templates", "Priority support"],
  team: ["Unlimited RFPs", "10 team members", "Unlimited AI generations", "Buy & sell templates", "Advanced analytics"],
  enterprise: ["Unlimited everything", "Unlimited team", "SSO & API access", "Custom integrations", "Dedicated support"],
};

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function UpgradeModal({ open, onOpenChange }: UpgradeModalProps) {
  const { tier: currentTier } = useTierGating();

  const handleUpgrade = (tier: Tier) => {
    toast.info(`Stripe billing will be connected soon. You'd upgrade to ${TIER_CONFIG[tier].label} ($${TIER_CONFIG[tier].price}/mo).`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Upgrade Your Plan</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 md:grid-cols-4 mt-4">
          {(["free", "pro", "team", "enterprise"] as Tier[]).map((tier) => {
            const Icon = TIER_ICONS[tier];
            const config = TIER_CONFIG[tier];
            const isCurrent = tier === currentTier;
            return (
              <Card key={tier} className={isCurrent ? "border-primary ring-2 ring-primary/20" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-base">{config.label}</CardTitle>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">${config.price}</span>
                    {config.price > 0 && <span className="text-xs text-muted-foreground">/mo</span>}
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <ul className="space-y-1.5">
                    {TIER_FEATURES[tier].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <Check className="h-3 w-3 mt-0.5 text-success shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {isCurrent ? (
                    <Badge className="w-full justify-center">Current Plan</Badge>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      variant={tier === "pro" ? "default" : "outline"}
                      onClick={() => handleUpgrade(tier)}
                    >
                      {tier === "free" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function BillingCard() {
  const { tier, tierLabel, limits, activeRfps } = useTierGating();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const Icon = TIER_ICONS[tier];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">{tierLabel} Plan</p>
              <p className="text-sm text-muted-foreground">
                {TIER_CONFIG[tier].price === 0 ? "Free forever" : `$${TIER_CONFIG[tier].price}/month`}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active RFPs</span>
              <span>{activeRfps} / {limits.maxRfps === Infinity ? "∞" : limits.maxRfps}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Team Members</span>
              <span>1 / {limits.maxUsers === Infinity ? "∞" : limits.maxUsers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">AI Generations</span>
              <span>— / {limits.maxAiGens === Infinity ? "∞" : limits.maxAiGens}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => setUpgradeOpen(true)} variant="outline" className="flex-1">
              {tier === "enterprise" ? "Manage Plan" : "Upgrade"}
            </Button>
            {tier !== "free" && (
              <Button variant="ghost" onClick={() => toast.info("Customer portal will be available when Stripe is connected.")}>
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <UpgradeModal open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
