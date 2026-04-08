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

const MARKETPLACE_LOGOS: Record<Marketplace, string> = {
  amazon: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
  shopify: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451571f2b49ab16b57.svg",
  walmart: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
  etsy: "https://upload.wikimedia.org/wikipedia/commons/8/89/Etsy_logo.svg",
};

interface Connection {
  id: string;
  marketplace: Marketplace;
  store_name: string;
  status: string;
  sync_status: string;
  last_sync_at: string | null;
  error_message: string | null;
}

const MARKETPLACE_INFO: Record<Marketplace, { name: string; color: string; description: string }> = {
  amazon: {
    name: "Amazon",
    color: "bg-[#FF9900]",
    description: "Connect your Amazon Seller Central account via SP-API",
  },
  shopify: {
    name: "Shopify",
    color: "bg-[#95BF47]",
    description: "Connect your Shopify store to sync products",
  },
  walmart: {
    name: "Walmart",
    color: "bg-[#0071CE]",
    description: "Connect your Walmart Marketplace account",
  },
  etsy: {
    name: "Etsy",
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
          const logoUrl = MARKETPLACE_LOGOS[marketplace];
          const conn = getConnection(marketplace);
          const isConnecting = connecting === marketplace;
          const isSyncing = syncing === conn?.id;

          return (
            <div key={marketplace} className="rounded-lg border border-[#E5E7EB] bg-white p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center p-2">
                    <img src={logoUrl} alt={info.name} className="w-full h-full object-contain" />
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
