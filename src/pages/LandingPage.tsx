import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Search, FileText, Target, ShoppingBag, Calendar, BarChart3, ArrowRight, Star, Hammer } from "lucide-react";
import { TIER_CONFIG, type Tier } from "@/hooks/useTierGating";

const FEATURES = [
  { icon: Search, title: "Smart Discovery", desc: "AI finds and scores relevant RFPs from 1000+ sources, matching your expertise and preferences automatically." },
  { icon: FileText, title: "AI Draft Generation", desc: "Upload an RFP PDF, get a structured draft response in minutes — not days." },
  { icon: Target, title: "Bid/No-Bid Scoring", desc: "Data-driven framework to pursue the right opportunities and stop wasting time on low-win bids." },
  { icon: ShoppingBag, title: "Template Marketplace", desc: "Buy and sell proven proposal templates across industries and categories." },
  { icon: Calendar, title: "Deadline Calendar", desc: "Never miss a submission deadline with automated reminders and milestone tracking." },
  { icon: BarChart3, title: "Win/Loss Analytics", desc: "Track what works, identify patterns, and continuously improve your win rate." },
];

const TIER_ORDER: Tier[] = ["free", "pro", "team", "enterprise"];

const TIER_FEATURES_GRID: Record<Tier, string[]> = {
  free: ["5 active RFPs", "1 team member", "10 AI generations/mo", "Basic pipeline & calendar", "—", "—"],
  pro: ["25 active RFPs", "3 team members", "100 AI generations/mo", "Full pipeline & analytics", "Buy marketplace templates", "Priority support"],
  team: ["Unlimited RFPs", "10 team members", "Unlimited AI generations", "Advanced analytics", "Buy & sell templates", "Team collaboration"],
  enterprise: ["Unlimited everything", "Unlimited team", "Unlimited AI", "Custom integrations", "SSO & API access", "Dedicated support"],
};

const TESTIMONIALS = [
  { name: "Sarah Chen", role: "VP of Business Development, Apex Federal", quote: "BidForge cut our proposal prep time by 60%. The AI draft generation alone paid for the subscription in the first month." },
  { name: "Marcus Johnson", role: "CEO, Pinnacle Consulting", quote: "We went from a 22% win rate to 41% in six months. The bid scoring framework helped us focus on the right opportunities." },
  { name: "Elena Rodriguez", role: "Proposal Manager, TechBridge Solutions", quote: "The template marketplace is a game-changer. We bought three templates and won two contracts in our first quarter." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Hammer className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">BidForge</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>Sign In</Button>
            <Button size="sm" onClick={() => navigate("/auth")}>Start Free</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:py-32 text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">Now in Beta — Free for early adopters</Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          Win More Bids with{" "}
          <span className="text-primary">AI-Powered</span>{" "}
          RFP Management
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Discover relevant RFPs, build winning proposals, and track your pipeline — all in one platform.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button size="lg" className="text-base px-8" onClick={() => navigate("/auth")}>
            Start Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" className="text-base px-8" asChild>
            <a href="#features">See How It Works</a>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card required · Free tier forever</p>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to win</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">From discovery to delivery, BidForge streamlines every step of the proposal lifecycle.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border bg-card hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground text-lg">Start free, upgrade when you're ready.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            const isPopular = tier === "pro";
            return (
              <Card key={tier} className={`relative ${isPopular ? "border-primary ring-2 ring-primary/20" : ""}`}>
                {isPopular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3">Most Popular</Badge>
                )}
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                  <div className="mt-3">
                    <span className="text-4xl font-bold">${config.price}</span>
                    {config.price > 0 && <span className="text-muted-foreground">/mo</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2.5">
                    {TIER_FEATURES_GRID[tier].map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        {f === "—" ? (
                          <span className="text-muted-foreground/40 ml-5">{f}</span>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mt-0.5 text-success shrink-0" />
                            <span>{f}</span>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={isPopular ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    {tier === "enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-6xl px-4 py-20 border-t">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">Trusted by proposal teams</h2>
          <p className="mt-4 text-muted-foreground text-lg">See what our users are saying.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 border-t">
        <div className="rounded-2xl bg-primary/5 border border-primary/20 p-12 text-center">
          <h2 className="text-3xl font-bold">Ready to win more bids?</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
            Join teams already using BidForge to discover, bid, and win.
          </p>
          <Button size="lg" className="mt-8 text-base px-8" onClick={() => navigate("/auth")}>
            Start Free Today <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <Hammer className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold">BidForge</span>
              </div>
              <p className="text-sm text-muted-foreground">AI-powered RFP management for modern proposal teams.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} BidForge. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
