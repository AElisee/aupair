"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, LayoutDashboard, Users, Shield, DollarSign, BarChart2, FileText, HelpCircle, Mail, LogOut, Bell } from "lucide-react";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/utilisateurs", icon: Users, label: "Utilisateurs" },
  { href: "/admin/moderation", icon: Shield, label: "Modération" },
  { href: "/admin/paiements", icon: DollarSign, label: "Paiements" },
  { href: "/admin/pays", icon: Globe, label: "Pays" },
  { href: "/admin/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/admin/blog", icon: FileText, label: "Blog" },
  { href: "/admin/faq", icon: HelpCircle, label: "FAQ" },
  { href: "/admin/tickets", icon: Mail, label: "Tickets support" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1A1A2E] min-h-screen fixed left-0 top-0 z-40">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#E87722] rounded-full flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">AuPair<span className="text-[#E87722]">A.EU</span></span>
            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-bold">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? "bg-[#E87722] text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-white/10 hover:text-white w-full transition-all">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="md:ml-60 flex-1">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-sm font-semibold text-gray-500">Administration — AuPair A.EU</h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-500 hover:text-[#E87722]">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-8 h-8 bg-[#E87722] rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </div>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
