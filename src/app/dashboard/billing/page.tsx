"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Loader2 } from "lucide-react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["10 listings/month", "2 marketplaces", "Basic brand voice"],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/month",
    features: ["100 listings/month", "2 marketplaces", "Advanced brand voice", "SEO keywords", "Email support"],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$149",
    period: "/month",
    popular: true,
    features: [
      "500 listings/month",
      "All 4 marketplaces",
      "Bulk CSV upload",
      "Advanced brand voice",
      "Priority processing",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$299",
    period: "/month",
    features: [
      "2,000 listings/month",
      "All 4 marketplaces",
      "Multiple brand voices",
      "Bulk CSV upload",
      "API access",
      "AI-agent optimization",
      "Dedicated support",
    ],
  },
];

export default function BillingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  async function handleUpgrade(planId: string) {
    if (planId === "free") return;

    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoadingPlan(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and billing details.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col ${
              plan.popular ? "border-primary shadow-lg" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="gradient-bg border-0">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full mt-6 ${plan.popular ? "gradient-bg border-0" : ""}`}
                variant={plan.popular ? "default" : "outline"}
                disabled={plan.id === "free" || loadingPlan === plan.id}
                onClick={() => handleUpgrade(plan.id)}
              >
                {loadingPlan === plan.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : plan.id === "free" ? (
                  "Current Plan"
                ) : (
                  "Upgrade"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
