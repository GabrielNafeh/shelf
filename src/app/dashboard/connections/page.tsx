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

function MarketplaceLogo({ marketplace }: { marketplace: Marketplace }) {
  switch (marketplace) {
    case "amazon":
      return (
        <div className="w-12 h-12 rounded-lg bg-[#232F3E] flex items-center justify-center">
          <span className="text-[#FF9900] font-bold text-lg">a</span>
        </div>
      );
    case "shopify":
      return (
        <div className="w-12 h-12 rounded-lg bg-[#96BF48] flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white"><path d="M15.34 3.8c-.04 0-.08.04-.12.04-.04 0-1.04.32-1.04.32-.2-.56-.52-1.08-1.12-1.08h-.08c-.32-.4-.72-.56-1.08-.56-2.68.04-3.96 3.36-4.36 5.08l-1.8.56c-.56.16-.56.2-.64.72C5.02 9.4 3.82 18.78 3.82 18.78L14.14 21l5.52-1.2S15.42 3.84 15.34 3.8zm-2.72 1.84v.2l-2.28.72c.44-1.68 1.28-2.52 2-2.72.12.44.24.96.28 1.8zm-1.2-2.36c.12 0 .28.04.4.16-.96.44-1.96 1.56-2.4 3.8l-1.8.56c.52-1.72 1.64-4.56 3.8-4.52zm.52 10.92s-.76-.4-1.68-.4c-1.36.08-1.36.96-1.36 1.16.08 1.2 3.24 1.48 3.4 4.32.16 2.24-1.16 3.76-3.08 3.88-2.28.12-3.56-1.2-3.56-1.2l.48-2.04s1.24.96 2.24.88c.68-.04.88-.56.88-.88-.08-1.56-2.68-1.48-2.84-4.08-.12-2.2 1.28-4.4 4.44-4.6 1.2-.08 1.84.24 1.84.24l-.76 2.72z"/></svg>
        </div>
      );
    case "walmart":
      return (
        <div className="w-12 h-12 rounded-lg bg-[#0071CE] flex items-center justify-center">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FFC220"><path d="M12 2l1.5 5.5L12 9l-1.5-1.5L12 2zM12 22l-1.5-5.5L12 15l1.5 1.5L12 22zM2 12l5.5 1.5L9 12l-1.5-1.5L2 12zM22 12l-5.5-1.5L15 12l1.5 1.5L22 12zM5.6 5.6l5.5 1.5.4.4-1.5 1.5-.4-.4L5.6 5.6zM18.4 18.4l-5.5-1.5-.4-.4 1.5-1.5.4.4 4 3z"/></svg>
        </div>
      );
    case "etsy":
      return (
        <div className="w-12 h-12 rounded-lg bg-[#F1641E] flex items-center justify-center">
          <span className="text-white font-bold text-lg">Etsy</span>
        </div>
      );
  }
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
          const conn = getConnection(marketplace);
          const isConnecting = connecting === marketplace;
          const isSyncing = syncing === conn?.id;

          return (
            <div key={marketplace} className="rounded-lg border border-[#E5E7EB] bg-white p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MarketplaceLogo marketplace={marketplace} />
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
