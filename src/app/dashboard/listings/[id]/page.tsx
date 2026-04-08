import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock } from "lucide-react";
import { MARKETPLACE_CONFIG } from "@/lib/types";
import type { Marketplace } from "@/lib/types";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!listing) notFound();

  const { data: outputs } = await supabase
    .from("listing_outputs")
    .select("*")
    .eq("listing_id", id)
    .order("marketplace");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{listing.product_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={listing.status === "complete" ? "success" : "secondary"}>
              {listing.status}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(listing.created_at).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {outputs && outputs.length > 0 ? (
        <Tabs defaultValue={outputs[0].marketplace}>
          <TabsList>
            {outputs.map((o) => (
              <TabsTrigger key={o.marketplace} value={o.marketplace}>
                {MARKETPLACE_CONFIG[o.marketplace as Marketplace]?.name || o.marketplace}
              </TabsTrigger>
            ))}
          </TabsList>

          {outputs.map((output) => (
            <TabsContent key={output.marketplace} value={output.marketplace}>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Title</CardTitle>
                      <span className="text-xs text-muted-foreground">
                        {output.title.length} chars
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{output.title}</p>
                  </CardContent>
                </Card>

                {output.bullets && output.bullets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Bullet Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {output.bullets.map((b: string, i: number) => (
                          <li key={i} className="text-sm p-2 rounded bg-muted/50">
                            {b}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{output.description}</p>
                  </CardContent>
                </Card>

                {output.backend_keywords && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Backend Keywords</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{output.backend_keywords}</p>
                    </CardContent>
                  </Card>
                )}

                {output.meta_title && (
                  <Card>
                    <CardHeader>
                      <CardTitle>SEO Meta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Meta Title</span>
                        <p className="text-sm">{output.meta_title}</p>
                      </div>
                      {output.meta_description && (
                        <div>
                          <span className="text-xs font-medium text-muted-foreground">
                            Meta Description
                          </span>
                          <p className="text-sm">{output.meta_description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {output.tags && output.tags.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {output.tags.map((t: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {output.seo_score > 0 && (
                  <Card>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                            output.seo_score >= 80
                              ? "bg-emerald-500"
                              : output.seo_score >= 60
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        >
                          {output.seo_score}
                        </div>
                        <div>
                          <p className="font-medium">SEO Score</p>
                          <p className="text-xs text-muted-foreground">
                            {output.seo_score >= 80
                              ? "Excellent"
                              : output.seo_score >= 60
                              ? "Good"
                              : "Needs improvement"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No outputs generated yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
