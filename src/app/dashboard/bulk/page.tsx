"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  Download,
  Check,
  AlertCircle,
} from "lucide-react";
import type { Marketplace } from "@/lib/types";

const MARKETPLACE_OPTIONS: { id: Marketplace; label: string }[] = [
  { id: "amazon", label: "Amazon" },
  { id: "shopify", label: "Shopify" },
  { id: "walmart", label: "Walmart" },
  { id: "etsy", label: "Etsy" },
];

interface BulkProduct {
  name: string;
  brand?: string;
  category?: string;
  description?: string;
  features?: string;
  price?: string;
}

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [products, setProducts] = useState<BulkProduct[]>([]);
  const [selectedMarketplaces, setSelectedMarketplaces] = useState<Marketplace[]>(["amazon"]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFile = acceptedFiles[0];
    if (!csvFile) return;
    setFile(csvFile);
    setError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        setError("CSV must have a header row and at least one product row");
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""));
      const nameIdx = headers.findIndex((h) => h === "name" || h === "product name" || h === "title" || h === "product_name");

      if (nameIdx === -1) {
        setError('CSV must have a "name" or "product name" or "title" column');
        return;
      }

      const parsed: BulkProduct[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length <= nameIdx || !values[nameIdx]?.trim()) continue;

        const product: BulkProduct = { name: values[nameIdx].trim() };
        headers.forEach((h, idx) => {
          if (idx === nameIdx) return;
          const val = values[idx]?.trim();
          if (!val) return;
          if (h === "brand") product.brand = val;
          else if (h === "category") product.category = val;
          else if (h === "description") product.description = val;
          else if (h === "features") product.features = val;
          else if (h === "price") product.price = val;
        });
        parsed.push(product);
      }

      setProducts(parsed);
    };
    reader.readAsText(csvFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  function toggleMarketplace(mp: Marketplace) {
    setSelectedMarketplaces((prev) =>
      prev.includes(mp) ? prev.filter((m) => m !== mp) : [...prev, mp]
    );
  }

  async function handleProcess() {
    if (products.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setResults([]);
    setError("");

    const allResults: Record<string, unknown>[] = [];

    for (let i = 0; i < products.length; i++) {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product: {
              name: products[i].name,
              brand: products[i].brand,
              category: products[i].category,
              description: products[i].description,
              features: products[i].features?.split(";").map((f) => f.trim()) || [],
            },
            marketplaces: selectedMarketplaces,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          allResults.push({ product: products[i].name, status: "success", outputs: data.outputs });
        } else {
          allResults.push({ product: products[i].name, status: "error", error: data.error });
        }
      } catch {
        allResults.push({ product: products[i].name, status: "error", error: "Network error" });
      }

      setProgress(((i + 1) / products.length) * 100);
    }

    setResults(allResults);
    setProcessing(false);
  }

  function downloadResults() {
    if (results.length === 0) return;
    const headers = ["Product", "Marketplace", "Title", "Bullets", "Description", "Backend Keywords", "Meta Title", "Meta Description", "Tags", "SEO Score", "Status"];
    const rows: string[][] = [];

    results.forEach((r) => {
      if (r.status === "success" && Array.isArray(r.outputs)) {
        (r.outputs as Record<string, unknown>[]).forEach((o) => {
          rows.push([
            `"${(r.product as string).replace(/"/g, '""')}"`,
            o.marketplace as string,
            `"${(o.title as string || "").replace(/"/g, '""')}"`,
            `"${((o.bullets as string[]) || []).join(" | ").replace(/"/g, '""')}"`,
            `"${(o.description as string || "").replace(/"/g, '""')}"`,
            `"${(o.backendKeywords as string || "").replace(/"/g, '""')}"`,
            `"${(o.metaTitle as string || "").replace(/"/g, '""')}"`,
            `"${(o.metaDescription as string || "").replace(/"/g, '""')}"`,
            `"${((o.tags as string[]) || []).join(", ").replace(/"/g, '""')}"`,
            String(o.seoScore || 0),
            "success",
          ]);
        });
      } else {
        rows.push([`"${(r.product as string).replace(/"/g, '""')}"`, "", "", "", "", "", "", "", "", "", `error: ${r.error}`]);
      }
    });

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shelf-bulk-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bulk Upload</h1>
        <p className="text-muted-foreground mt-1">
          Upload a CSV to generate optimized listings for all your products at once.
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Product CSV</CardTitle>
          <CardDescription>
            CSV must have a &quot;name&quot; column. Optional columns: brand, category, description,
            features (semicolon-separated), price.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-input hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            {file ? (
              <div>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <span className="font-medium">{file.name}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {products.length} products found
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium mb-1">
                  Drop your CSV here, or click to browse
                </p>
                <p className="text-sm text-muted-foreground">
                  Supports .csv files
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview & Settings */}
      {products.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Products Preview</CardTitle>
              <CardDescription>
                {products.length} products ready to process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {products.slice(0, 20).map((p, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 text-sm">
                    <span className="text-muted-foreground w-8">{i + 1}.</span>
                    <span className="font-medium flex-1">{p.name}</span>
                    {p.brand && <Badge variant="outline">{p.brand}</Badge>}
                  </div>
                ))}
                {products.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    ...and {products.length - 20} more products
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Target Marketplaces</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button
            onClick={handleProcess}
            disabled={processing}
            className="w-full gradient-bg border-0"
            size="lg"
          >
            {processing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing {products.length} products...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Generate All Listings ({products.length} products)
              </>
            )}
          </Button>
        </>
      )}

      {/* Progress */}
      {processing && (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Processing...</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Results</CardTitle>
              <Button variant="outline" onClick={downloadResults}>
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                  <span className="text-sm font-medium">{r.product as string}</span>
                  <Badge variant={r.status === "success" ? "success" : "destructive"}>
                    {r.status as string}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Download */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Need a CSV template?</h3>
              <p className="text-sm text-muted-foreground">
                Download our template with the correct column headers.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const csv = "name,brand,category,description,features,price\n\"Example Product\",\"Brand Name\",\"Category\",\"Raw product description\",\"Feature 1;Feature 2;Feature 3\",\"29.99\"";
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "shelf-template.csv";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-4 h-4" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
