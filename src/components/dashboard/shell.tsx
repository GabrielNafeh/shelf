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
  Gauge,
  Bell,
  Send,
  FlaskConical,
  Microscope,
  MessageSquare,
  Package,
  Megaphone,
  DollarSign,
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
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/generate", label: "Generate", icon: PenTool },
      { href: "/dashboard/publish", label: "Publish", icon: Send },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/inventory", label: "Inventory", icon: Package },
      { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquare },
      { href: "/dashboard/ads", label: "Ads", icon: Megaphone },
      { href: "/dashboard/connections", label: "Connections", icon: Link2 },
    ],
  },
  {
    label: "Account",
    items: [
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
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#E5E7EB] bg-[#F9FAFB] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#E5E7EB]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-[#111827]">Shelf</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <p className="px-3 mb-1 text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
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
                      <button
                        className={cn(
                          "w-full flex items-center gap-3 h-9 px-3 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[#22C55E]/10 text-[#22C55E]"
                            : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6]"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Usage Card */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#111827]">Listings</span>
              <span className="text-xs capitalize bg-[#F3F4F6] text-[#6B7280] px-2 py-0.5 rounded-full">
                {user.plan}
              </span>
            </div>
            <Progress value={usagePercent} />
            <p className="text-xs text-[#9CA3AF]">
              {user.listingsUsed} / {user.listingsLimit} used this month
            </p>
            {user.plan === "free" && (
              <Link href="/dashboard/billing">
                <button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-medium py-2 rounded-md flex items-center justify-center gap-1 transition-colors">
                  <Sparkles className="w-3 h-3" />
                  Upgrade Plan
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* User */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 flex items-center justify-center text-sm font-medium text-[#22C55E]">
              {user.fullName?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827] truncate">{user.fullName || "User"}</p>
              <p className="text-xs text-[#9CA3AF] truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} title="Log out" className="text-[#9CA3AF] hover:text-[#111827] p-1 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
