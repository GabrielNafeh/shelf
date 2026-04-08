"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Swords,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  BarChart3,
  MessageSquare,
  Loader2,
  Search,
  X,
} from "lucide-react";

interface CompetitorSnapshot {
  id: string;
  price: number | null;
  bsr: number | null;
  rating: number | null;
  review_count: number;
  captured_at: string;
}

interface Competitor {
  id: string;
  marketplace: string;
  asin: string | null;
  url: string | null;
  title: string;
  brand: string | null;
  current_price: number | null;
  current_bsr: number | null;
  current_rating: number | null;
  current_review_count: number;
  image_url: string | null;
  category: string | null;
  last_checked_at: string | null;
  snapshots: CompetitorSnapshot[];
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [asinInput, setAsinInput] = useState("");

  const fetchCompetitors = useCallback(async () => {
    try {
      const res = await fetch("/api/competitors/analyze");
      const data = await res.json();
      setCompetitors(data.competitors || []);
    } catch {
      console.error("Failed to fetch competitors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetitors();
  }, [fetchCompetitors]);

  const handleAdd = async () => {
    if (!asinInput.trim()) return;
    setAdding(true);
    try {
      const isUrl = asinInput.startsWith("http");
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isUrl ? { url: asinInput } : { asin: asinInput }),
      });
      if (res.ok) {
        setAsinInput("");
        setShowAddForm(false);
        await fetchCompetitors();
      }
    } catch {
      console.error("Failed to add competitor");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch("/api/competitors/analyze", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setCompetitors((prev) => prev.filter((c) => c.id !== id));
    } catch {
      console.error("Failed to remove competitor");
    }
  };

  const formatBsr = (bsr: number | null) => {
    if (!bsr) return "—";
    return `#${bsr.toLocaleString()}`;
  };

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
            <Swords className="w-6 h-6" />
            Competitor Monitoring
          </h1>
          <p className="text-muted-foreground mt-1">
            Track competitor pricing, rankings, and reviews
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showAddForm ? "Cancel" : "Add Competitor"}
        </Button>
      </div>

      {/* Add Competitor Form */}
      {showAddForm && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-3">Track a Competitor</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter ASIN (e.g., B0EXAMPLE01) or product URL"
              value={asinInput}
              onChange={(e) => setAsinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} disabled={adding || !asinInput.trim()}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-1" />}
              {adding ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Enter an Amazon ASIN or product URL to start tracking. Demo data will be used until API credentials are configured.
          </p>
        </div>
      )}

      {/* Competitors Grid */}
      {competitors.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Swords className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No competitors tracked yet</h3>
          <p className="text-muted-foreground mt-1">
            Add a competitor ASIN or URL to start monitoring their pricing and performance
          </p>
          <Button className="mt-4" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add Your First Competitor
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {competitors.map((comp) => (
            <div key={comp.id} className="rounded-lg border bg-card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3 flex-1 min-w-0">
                  {comp.image_url && (
                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                      <img src={comp.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm leading-tight line-clamp-2">{comp.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {comp.brand && (
                        <span className="text-xs text-muted-foreground">{comp.brand}</span>
                      )}
                      <Badge variant="secondary" className="text-xs capitalize">
                        {comp.marketplace}
                      </Badge>
                    </div>
                    {comp.asin && (
                      <span className="text-xs text-muted-foreground">ASIN: {comp.asin}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-red-500"
                  onClick={() => handleRemove(comp.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    Price
                  </div>
                  <p className="font-bold text-lg">
                    {comp.current_price ? `$${comp.current_price.toFixed(2)}` : "—"}
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    BSR
                  </div>
                  <p className="font-bold text-lg">{formatBsr(comp.current_bsr)}</p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Star className="w-3.5 h-3.5" />
                    Rating
                  </div>
                  <p className="font-bold text-lg">
                    {comp.current_rating ? `${comp.current_rating} / 5` : "—"}
                  </p>
                </div>
                <div className="rounded-md bg-muted/50 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Reviews
                  </div>
                  <p className="font-bold text-lg">
                    {comp.current_review_count?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>

              {/* Mini Price Trend */}
              {comp.snapshots.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {comp.snapshots[0]?.price && comp.snapshots[1]?.price ? (
                    comp.snapshots[0].price < comp.snapshots[1].price ? (
                      <>
                        <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-green-500">Price dropped</span>
                      </>
                    ) : comp.snapshots[0].price > comp.snapshots[1].price ? (
                      <>
                        <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-500">Price increased</span>
                      </>
                    ) : (
                      <span>Price stable</span>
                    )
                  ) : null}
                  {comp.last_checked_at && (
                    <span className="ml-auto">
                      Checked {new Date(comp.last_checked_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
