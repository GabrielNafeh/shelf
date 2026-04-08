"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  LayoutDashboard,
  PenTool,
  Upload,
  Mic2,
  Settings,
  LogOut,
  CreditCard,
  Sparkles,
  Link2,
  HeartPulse,
  Dna,
  Swords,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardUser {
  id: string;
  email: string;
  fullName: string;
  plan: string;
  listingsUsed: number;
  listingsLimit: number;
}

const NAV_SECTIONS = [
  {
    label: "Generate",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/generate", label: "Generate Listing", icon: PenTool },
      { href: "/dashboard/bulk", label: "Bulk Upload", icon: Upload },
      { href: "/dashboard/brand-voice", label: "Brand Voice", icon: Mic2 },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/dashboard/connections", label: "Connections", icon: Link2 },
      { href: "/dashboard/health", label: "Listing Health", icon: HeartPulse },
      { href: "/dashboard/brand-dna", label: "Brand DNA", icon: Dna },
      { href: "/dashboard/competitors", label: "Competitors", icon: Swords },
      { href: "/dashboard/keywords", label: "Keywords", icon: Search },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/dashboard/team", label: "Team", icon: Users },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: DashboardUser;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const usagePercent = Math.min(
    (user.listingsUsed / user.listingsLimit) * 100,
    100
  );

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Shelf</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href);
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-9",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Usage Card */}
        <div className="p-4 border-t">
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Listings</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {user.plan}
              </Badge>
            </div>
            <Progress value={usagePercent} />
            <p className="text-xs text-muted-foreground">
              {user.listingsUsed} / {user.listingsLimit} used this month
            </p>
            {user.plan === "free" && (
              <Link href="/dashboard/billing">
                <Button size="sm" className="w-full gradient-bg border-0 text-xs">
                  <Sparkles className="w-3 h-3" />
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
              {user.fullName?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.fullName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
