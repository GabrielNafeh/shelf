"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Zap,
  Loader2,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
} from "lucide-react";
import type { Marketplace, ListingScore } from "@/lib/types";

export default function ScorePage() {
  const [listingText, setListingText] = useState("");
  const [marketplace, setMarketplace] = useState<Marketplace>("amazon");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<ListingScore | null>(null);
  const [error, setError] = useState("");

  async function handleScore() {
    if (!listingText.trim()) {
      setError("Paste your listing text to get a score");
      return;
    }

    setLoading(true);
    setError("");
    setScore(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingText, marketplace, email: email || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scoring failed");
        return;
      }

      setScore(data.score);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(s: number) {
    if (s >= 80) return "text-emerald-600";
    if (s >= 60) return "text-amber-600";
    return "text-red-600";
  }

  function getScoreIcon(s: number) {
    if (s >= 80) return CheckCircle2;
    if (s >= 60) return AlertTriangle;
    return XCircle;
  }

  function getScoreBg(s: number) {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 60) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Shelf</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="gradient-bg border-0">Start Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            Free Tool
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            AI Listing Score Checker
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste any product listing and get an instant AI-powered score with
            specific suggestions to improve conversions.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Listing</CardTitle>
                <CardDescription>
                  Paste your product title, bullets, and description below
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Marketplace</Label>
                  <Select
                    value={marketplace}
                    onValueChange={(v) => setMarketplace(v as Marketplace)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="amazon">Amazon</SelectItem>
                      <SelectItem value="shopify">Shopify</SelectItem>
                      <SelectItem value="walmart">Walmart</SelectItem>
                      <SelectItem value="etsy">Etsy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Listing Content</Label>
                  <Textarea
                    placeholder="Paste your full product listing here — title, bullet points, description, everything..."
                    rows={12}
                    value={listingText}
                    onChange={(e) => setListingText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email (optional — get tips in your inbox)</Label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button
                  onClick={handleScore}
                  disabled={loading}
                  className="w-full gradient-bg border-0"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing listing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      Score My Listing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div>
            {loading && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Analyzing your listing...</h3>
                  <p className="text-sm text-muted-foreground">
                    Checking title, description, keywords, readability, and SEO.
                  </p>
                </CardContent>
              </Card>
            )}

            {score && (
              <div className="space-y-4">
                {/* Overall Score */}
                <Card>
                  <CardContent className="py-8 text-center">
                    <div
                      className={`w-24 h-24 rounded-full ${getScoreBg(score.overall)} flex items-center justify-center mx-auto mb-4`}
                    >
                      <span className="text-3xl font-bold text-white">
                        {score.overall}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-1">
                      {score.overall >= 80
                        ? "Excellent Listing!"
                        : score.overall >= 60
                        ? "Good — Room to Improve"
                        : "Needs Significant Work"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Overall listing quality score
                    </p>
                  </CardContent>
                </Card>

                {/* Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Title", score: score.titleScore },
                      { label: "Description", score: score.descriptionScore },
                      { label: "Keywords", score: score.keywordScore },
                      { label: "Readability", score: score.readabilityScore },
                      { label: "SEO", score: score.seoScore },
                    ].map((item) => {
                      const Icon = getScoreIcon(item.score);
                      return (
                        <div key={item.label} className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${getScoreColor(item.score)}`} />
                          <span className="flex-1 text-sm font-medium">
                            {item.label}
                          </span>
                          <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                            {item.score}/100
                          </span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Improvement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {score.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* CTA */}
                <Card className="gradient-bg border-0">
                  <CardContent className="py-6 text-center text-white">
                    <h3 className="text-lg font-semibold mb-2">
                      Want AI to fix all of this automatically?
                    </h3>
                    <p className="text-sm text-white/80 mb-4">
                      Shelf generates optimized listings that score 85+ every time.
                    </p>
                    <Link href="/signup">
                      <Button variant="secondary" className="text-primary font-semibold">
                        Try Shelf Free
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {!loading && !score && (
              <Card>
                <CardContent className="py-16 text-center">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Paste your listing to get started</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll analyze your listing across 5 dimensions and give you
                    actionable suggestions.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
