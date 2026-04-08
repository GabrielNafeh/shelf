"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUpRight,
  Loader2,
  X,
  BarChart3,
} from "lucide-react";

interface KeywordRank {
  id: string;
  marketplace: string;
  keyword: string;
  asin: string | null;
  current_rank: number | null;
  previous_rank: number | null;
  best_rank: number | null;
  search_volume: number | null;
  trend: string;
  last_checked_at: string | null;
}

function TrendIcon({ trend }: { trend: string }) {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    default:
      return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
}

function RankChange({ current, previous }: { current: number | null; previous: number | null }) {
  if (!current || !previous) return null;
  const diff = previous - current;
  if (diff === 0) return <span className="text-xs text-muted-foreground">—</span>;
  const isUp = diff > 0;
  return (
    <span className={`text-xs font-medium ${isUp ? "text-green-500" : "text-red-500"}`}>
      {isUp ? "+" : ""}{diff}
    </span>
  );
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [keywordInput, setKeywordInput] = useState("");
  const [asinInput, setAsinInput] = useState("");

  const fetchKeywords = useCallback(async () => {
    try {
      const res = await fetch("/api/keywords");
      const data = await res.json();
      setKeywords(data.keywords || []);
    } catch {
      console.error("Failed to fetch keywords");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeywords();
  }, [fetchKeywords]);

  const handleAdd = async () => {
    if (!keywordInput.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: keywordInput,
          asin: asinInput || undefined,
        }),
      });
      if (res.ok) {
        setKeywordInput("");
        setAsinInput("");
        setShowAddForm(false);
        await fetchKeywords();
      }
    } catch {
      console.error("Failed to add keyword");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/keywords", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch {
      console.error("Failed to delete keyword");
    }
  };

  const formatVolume = (vol: number | null) => {
    if (!vol) return "—";
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
    return vol.toString();
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
            <Search className="w-6 h-6" />
            Keyword Rank Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your search rankings for important keywords
          </p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {showAddForm ? "Cancel" : "Track Keyword"}
        </Button>
      </div>

      {/* Add Keyword Form */}
      {showAddForm && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h3 className="font-semibold">Track a New Keyword</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Keyword</label>
              <Input
                className="mt-1"
                placeholder="e.g., insulated water bottle"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div>
              <label className="text-sm font-medium">ASIN (optional)</label>
              <Input
                className="mt-1"
                placeholder="e.g., B0EXAMPLE01"
                value={asinInput}
                onChange={(e) => setAsinInput(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={adding || !keywordInput.trim()}>
            {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
            {adding ? "Adding..." : "Add Keyword"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Demo data is used until real keyword tracking APIs are configured.
          </p>
        </div>
      )}

      {/* Keywords Table */}
      {keywords.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No keywords tracked yet</h3>
          <p className="text-muted-foreground mt-1">
            Add keywords to monitor your search rankings over time
          </p>
          <Button className="mt-4" onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Track Your First Keyword
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">Keyword</th>
                  <th className="text-center p-3 font-medium w-20">Rank</th>
                  <th className="text-center p-3 font-medium w-20">Change</th>
                  <th className="text-center p-3 font-medium w-20">Best</th>
                  <th className="text-center p-3 font-medium w-24">Volume</th>
                  <th className="text-center p-3 font-medium w-20">Trend</th>
                  <th className="text-right p-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((kw) => (
                  <tr key={kw.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div>
                        <span className="font-medium">{kw.keyword}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {kw.marketplace}
                          </Badge>
                          {kw.asin && (
                            <span className="text-xs text-muted-foreground">{kw.asin}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="font-bold text-lg">
                        {kw.current_rank ? `#${kw.current_rank}` : "—"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <RankChange current={kw.current_rank} previous={kw.previous_rank} />
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-muted-foreground">
                        {kw.best_rank ? `#${kw.best_rank}` : "—"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                        <span>{formatVolume(kw.search_volume)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center">
                        <TrendIcon trend={kw.trend} />
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-red-500 h-8 w-8"
                        onClick={() => handleDelete(kw.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
