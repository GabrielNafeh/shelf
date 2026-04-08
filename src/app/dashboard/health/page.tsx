"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Loader2,
  FileText,
  Search,
} from "lucide-react";
import type { SEOHealthScore } from "@/lib/types";

interface ScoredListing {
  id: string;
  marketplace: string;
  externalId: string;
  asin: string | null;
  sku: string | null;
  title: string;
  price: number | null;
  status: string;
  category: string | null;
  lastSyncedAt: string;
  seoScore: SEOHealthScore;
}

interface HealthSummary {
  totalListings: number;
  avgScore: number;
  needsAttention: number;
  topPerformers: number;
}

function ScoreIndicator({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-red-500";
  const bg = score >= 80 ? "bg-green-100 dark:bg-green-900/30" : score >= 50 ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-red-100 dark:bg-red-900/30";
  return (
    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${color} ${bg}`}>
      {score}
    </span>
  );
}

function ScoreBreakdownRow({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
        </div>
      </div>
      <span className="text-sm font-medium w-8 text-right">{score}</span>
    </div>
  );
}

export default function HealthPage() {
  const [listings, setListings] = useState<ScoredListing[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "attention" | "good">("all");

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setListings(data.listings || []);
      setSummary(data.summary || null);
    } catch {
      console.error("Failed to fetch health data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const filteredListings = listings.filter((l) => {
    if (filter === "attention") return l.seoScore.overall < 50;
    if (filter === "good") return l.seoScore.overall >= 80;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <HeartPulse className="w-6 h-6" />
            Listing Health
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor SEO performance across your synced listings
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHealth}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              Total Listings
            </div>
            <p className="text-2xl font-bold mt-1">{summary.totalListings}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              Avg Score
            </div>
            <p className="text-2xl font-bold mt-1">{summary.avgScore}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertTriangle className="w-4 h-4" />
              Needs Attention
            </div>
            <p className="text-2xl font-bold mt-1">{summary.needsAttention}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-green-500">
              <CheckCircle2 className="w-4 h-4" />
              Top Performers
            </div>
            <p className="text-2xl font-bold mt-1">{summary.topPerformers}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "attention", "good"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f === "attention" ? "Needs Attention" : "Top Performers"}
          </Button>
        ))}
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No listings found</h3>
          <p className="text-muted-foreground mt-1">
            {listings.length === 0
              ? "Connect a marketplace and sync your listings to see health scores"
              : "No listings match the current filter"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredListings.map((listing) => {
            const isExpanded = expandedId === listing.id;
            return (
              <div key={listing.id} className="rounded-lg border bg-card">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                  className="w-full p-4 flex items-center gap-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <ScoreIndicator score={listing.seoScore.overall} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{listing.title || "Untitled"}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {listing.marketplace}
                      </Badge>
                      {listing.asin && (
                        <span className="text-xs text-muted-foreground">ASIN: {listing.asin}</span>
                      )}
                      {listing.price && (
                        <span className="text-xs text-muted-foreground">${listing.price}</span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t pt-4 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Score Breakdown</h4>
                      <ScoreBreakdownRow label="Title" score={listing.seoScore.titleScore} />
                      <ScoreBreakdownRow label="Bullets" score={listing.seoScore.bulletScore} />
                      <ScoreBreakdownRow label="Description" score={listing.seoScore.descriptionScore} />
                      <ScoreBreakdownRow label="Keywords" score={listing.seoScore.keywordScore} />
                      <ScoreBreakdownRow label="Images" score={listing.seoScore.imageScore} />
                    </div>

                    {listing.seoScore.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {listing.seoScore.recommendations.map((rec, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <AlertTriangle className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
