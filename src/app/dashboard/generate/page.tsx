"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  Download,
  Plus,
  X,
} from "lucide-react";
import type { Marketplace, ProductInput, ListingOutput } from "@/lib/types";
import { MARKETPLACE_CONFIG } from "@/lib/types";

const MARKETPLACE_OPTIONS: { id: Marketplace; label: string }[] = [
  { id: "amazon", label: "Amazon" },
  { id: "shopify", label: "Shopify" },
  { id: "walmart", label: "Walmart" },
  { id: "etsy", label: "Etsy" },
];

export default function GeneratePage() {
  const [product, setProduct] = useState<ProductInput>({
    name: "",
    description: "",
    brand: "",
    category: "",
    features: [],
    targetKeywords: [],
  });
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Marketplace[]>(["amazon"]);
  const [featureInput, setFeatureInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [outputs, setOutputs] = useState<ListingOutput[] | null>(null);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");

  function toggleMarketplace(mp: Marketplace) {
    setSelectedMarketplaces((prev) =>
      prev.includes(mp) ? prev.filter((m) => m !== mp) : [...prev, mp]
    );
  }

  function addFeature() {
    if (featureInput.trim()) {
      setProduct((p) => ({ ...p, features: [...(p.features || []), featureInput.trim()] }));
      setFeatureInput("");
    }
  }

  function removeFeature(idx: number) {
    setProduct((p) => ({
      ...p,
      features: (p.features || []).filter((_, i) => i !== idx),
    }));
  }

  function addKeyword() {
    if (keywordInput.trim()) {
      setProduct((p) => ({
        ...p,
        targetKeywords: [...(p.targetKeywords || []), keywordInput.trim()],
      }));
      setKeywordInput("");
    }
  }

  function removeKeyword(idx: number) {
    setProduct((p) => ({
      ...p,
      targetKeywords: (p.targetKeywords || []).filter((_, i) => i !== idx),
    }));
  }

  async function handleGenerate() {
    if (!product.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (selectedMarketplaces.length === 0) {
      setError("Select at least one marketplace");
      return;
    }

    setLoading(true);
    setError("");
    setOutputs(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product,
          marketplaces: selectedMarketplaces,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Generation failed");
        return;
      }

      setOutputs(data.outputs);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard(text: string, field: string) {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  }

  function exportCSV() {
    if (!outputs) return;
    const headers = ["Marketplace", "Title", "Bullets", "Description", "Backend Keywords", "Meta Title", "Meta Description", "Tags", "SEO Score"];
    const rows = outputs.map((o) => [
      o.marketplace,
      `"${o.title.replace(/"/g, '""')}"`,
      `"${(o.bullets || []).join(" | ").replace(/"/g, '""')}"`,
      `"${o.description.replace(/"/g, '""')}"`,
      `"${(o.backendKeywords || "").replace(/"/g, '""')}"`,
      `"${(o.metaTitle || "").replace(/"/g, '""')}"`,
      `"${(o.metaDescription || "").replace(/"/g, '""')}"`,
      `"${(o.tags || []).join(", ").replace(/"/g, '""')}"`,
      o.seoScore || 0,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shelf-${product.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Generate Listing</h1>
        <p className="text-muted-foreground mt-1">
          Enter your product details and get AI-optimized listings for any marketplace.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Stainless Steel Water Bottle 32oz"
                  value={product.name}
                  onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="e.g., HydroFlask"
                  value={product.brand}
                  onChange={(e) => setProduct((p) => ({ ...p, brand: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Kitchen & Dining > Water Bottles"
                  value={product.category}
                  onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Raw Description / Specs</Label>
                <Textarea
                  id="description"
                  placeholder="Paste your raw product description, supplier specs, or any details about the product..."
                  rows={5}
                  value={product.description}
                  onChange={(e) => setProduct((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Key Features</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a feature..."
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addFeature}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {product.features && product.features.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.features.map((f, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {f}
                        <button onClick={() => removeFeature(i)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Target Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a keyword..."
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addKeyword}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {product.targetKeywords && product.targetKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.targetKeywords.map((k, i) => (
                      <Badge key={i} variant="outline" className="gap-1">
                        {k}
                        <button onClick={() => removeKeyword(i)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Marketplaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {MARKETPLACE_OPTIONS.map((mp) => (
                  <button
                    key={mp.id}
                    onClick={() => toggleMarketplace(mp.id)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      selectedMarketplaces.includes(mp.id)
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-input hover:border-primary/50"
                    }`}
                  >
                    {mp.label}
                    {selectedMarketplaces.includes(mp.id) && (
                      <Check className="w-4 h-4 inline ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full gradient-bg border-0"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating listings...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Optimized Listings
              </>
            )}
          </Button>
        </div>

        {/* Output */}
        <div>
          {loading && (
            <Card>
              <CardContent className="py-16 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Crafting your listings...</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI is analyzing your product and writing conversion-optimized
                  listings for each marketplace.
                </p>
              </CardContent>
            </Card>
          )}

          {outputs && outputs.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Generated Listings</h2>
                <Button variant="outline" size="sm" onClick={exportCSV}>
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              <Tabs defaultValue={outputs[0].marketplace}>
                <TabsList>
                  {outputs.map((o) => (
                    <TabsTrigger key={o.marketplace} value={o.marketplace}>
                      {MARKETPLACE_CONFIG[o.marketplace].name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {outputs.map((output) => (
                  <TabsContent key={output.marketplace} value={output.marketplace}>
                    <Card>
                      <CardContent className="pt-6 space-y-6">
                        {/* SEO Score */}
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                              (output.seoScore || 0) >= 80
                                ? "bg-emerald-500"
                                : (output.seoScore || 0) >= 60
                                ? "bg-amber-500"
                                : "bg-red-500"
                            }`}
                          >
                            {output.seoScore}
                          </div>
                          <div>
                            <div className="font-semibold">SEO Score</div>
                            <div className="text-sm text-muted-foreground">
                              {(output.seoScore || 0) >= 80
                                ? "Excellent"
                                : (output.seoScore || 0) >= 60
                                ? "Good — room for improvement"
                                : "Needs work"}
                            </div>
                          </div>
                        </div>

                        {/* Title */}
                        <OutputField
                          label="Title"
                          value={output.title}
                          maxLength={MARKETPLACE_CONFIG[output.marketplace].titleMaxLength}
                          onCopy={() => copyToClipboard(output.title, `${output.marketplace}-title`)}
                          copied={copiedField === `${output.marketplace}-title`}
                        />

                        {/* Bullets */}
                        {output.bullets && output.bullets.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Bullet Points</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    output.bullets!.join("\n"),
                                    `${output.marketplace}-bullets`
                                  )
                                }
                              >
                                {copiedField === `${output.marketplace}-bullets` ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                            <ul className="space-y-2">
                              {output.bullets.map((b, i) => (
                                <li
                                  key={i}
                                  className="text-sm p-2 rounded bg-muted/50 border"
                                >
                                  {b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Description */}
                        <OutputField
                          label="Description"
                          value={output.description}
                          multiline
                          onCopy={() =>
                            copyToClipboard(output.description, `${output.marketplace}-desc`)
                          }
                          copied={copiedField === `${output.marketplace}-desc`}
                        />

                        {/* Backend Keywords */}
                        {output.backendKeywords && (
                          <OutputField
                            label="Backend Keywords"
                            value={output.backendKeywords}
                            onCopy={() =>
                              copyToClipboard(
                                output.backendKeywords!,
                                `${output.marketplace}-kw`
                              )
                            }
                            copied={copiedField === `${output.marketplace}-kw`}
                          />
                        )}

                        {/* Meta */}
                        {output.metaTitle && (
                          <OutputField
                            label="Meta Title"
                            value={output.metaTitle}
                            maxLength={60}
                            onCopy={() =>
                              copyToClipboard(output.metaTitle!, `${output.marketplace}-mt`)
                            }
                            copied={copiedField === `${output.marketplace}-mt`}
                          />
                        )}
                        {output.metaDescription && (
                          <OutputField
                            label="Meta Description"
                            value={output.metaDescription}
                            maxLength={160}
                            onCopy={() =>
                              copyToClipboard(
                                output.metaDescription!,
                                `${output.marketplace}-md`
                              )
                            }
                            copied={copiedField === `${output.marketplace}-md`}
                          />
                        )}

                        {/* Tags */}
                        {output.tags && output.tags.length > 0 && (
                          <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2">
                              {output.tags.map((t, i) => (
                                <Badge key={i} variant="secondary">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          )}

          {!loading && !outputs && (
            <Card>
              <CardContent className="py-16 text-center">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Ready to generate</h3>
                <p className="text-sm text-muted-foreground">
                  Fill in your product details on the left and click Generate to
                  create AI-optimized listings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function OutputField({
  label,
  value,
  maxLength,
  multiline,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  maxLength?: number;
  multiline?: boolean;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {maxLength && (
            <span
              className={`text-xs ${
                value.length > maxLength ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {value.length}/{maxLength}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={onCopy}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>
      </div>
      <div
        className={`text-sm p-3 rounded-lg bg-muted/50 border ${
          multiline ? "whitespace-pre-wrap" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
