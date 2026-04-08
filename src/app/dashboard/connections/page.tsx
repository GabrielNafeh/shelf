"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Link2,
  Unlink,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Info,
  Store,
} from "lucide-react";
import type { Marketplace } from "@/lib/types";

function AmazonLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M29.2 30.4c-6.8 5-16.6 7.6-25.1 7.6-1.2 0-2.3-.1-3.4-.2-.3 0-.3.3 0 .5 7.2 5.2 16.8 6.8 25.2 3.8 1-.4 2.1-.9 3-1.4.5-.2.2-.7-.3-.5" fill="#FF9900"/>
      <path d="M31.4 27.8c-.4-.5-2.8-.3-3.9-.1-.3 0-.4.3-.1.5 1 .7 2.5 1 3.4.8.3-.1.6-.3.6-.5 0-.2 0-.5 0-.7" fill="#FF9900"/>
      <path d="M27.6 8.8c0-2.2.1-4-1-5.9-1-1.6-2.5-2.6-4.2-2.6-2.3 0-3.7 1.8-3.7 4.4 0 4.6 4.2 5.4 8.9 5.4V8.8zM33.4 18.6c-.2.2-.5.2-.7.1-1-.8-1.2-1.2-1.7-2-1.6 1.7-2.8 2.2-4.9 2.2-2.5 0-4.4-1.5-4.4-4.6 0-2.4 1.3-4 3.1-4.8 1.6-.7 3.8-.8 5.5-1v-.4c0-.7.1-1.5-.4-2.1-.4-.5-1.1-.7-1.7-.7-1.2 0-2.2.6-2.5 1.8-.1.3-.3.5-.5.5l-2.7-.3c-.2-.1-.5-.2-.4-.6C23.8 3.2 27 2 29.9 2c1.5 0 3.4.4 4.5 1.5 1.5 1.4 1.4 3.3 1.4 5.3v4.8c0 1.4.6 2.1 1.2 2.8.2.3.2.6 0 .8-.6.5-1.7 1.5-2.3 2-.2.2-.5.2-.7.1l-1.3-1.1.7.4z" fill="#111827"/>
    </svg>
  );
}

function ShopifyLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M39.2 9.2c0-.2-.2-.3-.3-.3s-2.4-.2-2.4-.2l-1.8-1.8c-.2-.2-.5-.1-.7-.1l-1 .3C32.4 5.7 31.4 4.8 30 4.8h-.3c-.5-.6-1-1-1.7-1-4.2.1-6.2 5.3-6.8 8-.7.2-1.2.4-1.8.6-.6.2-.6.2-.6.8-.1.4-1.6 12.4-1.6 12.4L28.8 48l12.8-2.8S39.2 9.4 39.2 9.2zM31.6 7.6l-1.2.4V7.4c0-.8-.1-1.4-.3-2 .8.1 1.2 1 1.5 2.2zM28.8 5.6c.2.5.3 1.3.3 2.2v.2l-2.6.8c.5-1.9 1.4-2.8 2.3-3.2zM27.8 4.2c.2 0 .3.1.5.2-1.1.5-2.3 1.8-2.8 4.4l-2 .6c.6-1.9 1.8-5.2 4.3-5.2z" fill="#95BF47"/>
      <path d="M38.9 8.9c-.2 0-2.4-.2-2.4-.2l-1.8-1.8c-.1-.1-.2-.1-.3-.1l-1.8 36.8L45.4 41S39.2 9.4 39.2 9.2c-.1-.2-.2-.3-.3-.3z" fill="#5E8E3E"/>
      <path d="M30 16.2l-1.2 3.4s-1-.5-2.2-.5c-1.8.1-1.8 1.2-1.8 1.5.1 1.6 4.2 1.9 4.4 5.6.2 2.9-1.5 4.8-4 5-2.9.2-4.5-1.5-4.5-1.5l.6-2.6s1.6 1.2 2.9 1.1c.8 0 1.2-.7 1.1-1.1-.1-2-3.4-1.9-3.6-5.3-.2-2.8 1.7-5.7 5.8-6 1.6 0 2.4.3 2.4.3z" fill="white"/>
    </svg>
  );
}

function WalmartLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 4l3.2 9.8h-.1L24 18.2l-3.1-4.4H21L24 4z" fill="#FFC220"/>
      <path d="M24 44l-3.2-9.8h.1L24 29.8l3.1 4.4h.1L24 44z" fill="#FFC220"/>
      <path d="M4 24l9.8-3.2v.1L18.2 24l-4.4 3.1v.1L4 24z" fill="#FFC220"/>
      <path d="M44 24l-9.8 3.2v-.1L29.8 24l4.4-3.1v-.1L44 24z" fill="#FFC220"/>
      <path d="M13.8 13.8l9.8 3.2-.1.1L24 21.4l-3.1-4.4-.1.1-7.1-3.3z" fill="#FFC220"/>
      <path d="M34.2 34.2l-9.8-3.2.1-.1L24 26.6l3.1 4.4.1-.1 7.1 3.3z" fill="#FFC220"/>
    </svg>
  );
}

function EtsyLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 8c0-1.2.1-1.6 1.8-1.6h8.4c3.4 0 3.8 2.4 4.2 4.4h1.8l-.4-7.2H10.6l-.2 1.4c1.6.2 2 .6 2 2v20.6c0 1.4-.4 1.8-2 2l.2 1.4h19.6l.8-7.6h-1.8c-.6 2.8-1.4 5.2-5 5.2h-6.8c-1.8 0-1.8-.4-1.8-1.6v-9.4h5c2.4 0 2.8 1.4 3.2 3.4h1.6V14h-1.6c-.4 2-1 3.4-3.2 3.4h-5V8z" fill="#F1641E"/>
    </svg>
  );
}

interface Connection {
  id: string;
  marketplace: Marketplace;
  store_name: string;
  status: string;
  sync_status: string;
  last_sync_at: string | null;
  error_message: string | null;
}

const MARKETPLACE_INFO: Record<Marketplace, { name: string; logo: React.FC<{ className?: string }>; color: string; description: string }> = {
  amazon: {
    name: "Amazon",
    logo: AmazonLogo,
    color: "bg-[#FF9900]",
    description: "Connect your Amazon Seller Central account via SP-API",
  },
  shopify: {
    name: "Shopify",
    logo: ShopifyLogo,
    color: "bg-[#95BF47]",
    description: "Connect your Shopify store to sync products",
  },
  walmart: {
    name: "Walmart",
    logo: WalmartLogo,
    color: "bg-[#0071CE]",
    description: "Connect your Walmart Marketplace account",
  },
  etsy: {
    name: "Etsy",
    logo: EtsyLogo,
    color: "bg-[#F1641E]",
    description: "Connect your Etsy shop to sync listings",
  },
};

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<Marketplace | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch("/api/connections");
      const data = await res.json();
      setConnections(data.connections || []);
    } catch {
      console.error("Failed to fetch connections");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const handleConnect = async (marketplace: Marketplace) => {
    setConnecting(marketplace);
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketplace }),
      });
      const data = await res.json();

      if (data.demo) {
        // Demo mode — connection created directly
        await fetchConnections();
      } else if (data.oauthUrl) {
        window.location.href = data.oauthUrl;
      }
    } catch {
      console.error("Failed to connect");
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      await fetch(`/api/connections/${connectionId}`, { method: "DELETE" });
      await fetchConnections();
    } catch {
      console.error("Failed to disconnect");
    }
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      const res = await fetch(`/api/sync/${connectionId}`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        await fetchConnections();
      }
    } catch {
      console.error("Failed to sync");
    } finally {
      setSyncing(null);
    }
  };

  const getConnection = (marketplace: Marketplace) =>
    connections.find((c) => c.marketplace === marketplace && c.status === "connected");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketplace Connections</h1>
        <p className="text-muted-foreground mt-1">
          Connect your stores to sync listings and monitor performance
        </p>
      </div>

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-400">Demo Mode Active</p>
          <p className="text-sm text-blue-600 dark:text-blue-300 mt-0.5">
            Marketplace APIs are running with sample data. Add your API credentials in <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">.env.local</code> to connect real accounts.
          </p>
        </div>
      </div>

      {/* Marketplace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(Object.keys(MARKETPLACE_INFO) as Marketplace[]).map((marketplace) => {
          const info = MARKETPLACE_INFO[marketplace];
          const Logo = info.logo;
          const conn = getConnection(marketplace);
          const isConnecting = connecting === marketplace;
          const isSyncing = syncing === conn?.id;

          return (
            <div key={marketplace} className="rounded-lg border bg-card p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center p-1.5">
                    <Logo className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{info.name}</h3>
                    <p className="text-sm text-muted-foreground">{info.description}</p>
                  </div>
                </div>
                {conn ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground">
                    Not connected
                  </Badge>
                )}
              </div>

              {conn && (
                <div className="rounded-md bg-muted/50 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{conn.store_name}</span>
                  </div>
                  {conn.last_sync_at && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      Last sync: {new Date(conn.last_sync_at).toLocaleString()}
                    </div>
                  )}
                  {conn.error_message && (
                    <div className="flex items-center gap-2 text-sm text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      {conn.error_message}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {conn ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleSync(conn.id)}
                      disabled={isSyncing}
                    >
                      {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-1" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-1" />
                      )}
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDisconnect(conn.id)}
                    >
                      <Unlink className="w-4 h-4 mr-1" />
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(marketplace)}
                    disabled={isConnecting}
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-1" />
                    )}
                    {isConnecting ? "Connecting..." : `Connect ${info.name}`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
