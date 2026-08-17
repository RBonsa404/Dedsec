"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  FolderKanban, 
  CheckSquare, 
  Users, 
  Terminal, 
  CalendarOff, 
  Radio, 
  Bell, 
  LogOut,
  X,
  ShieldAlert
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { isOpen, close } = useSidebarStore();
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/projects", label: t.nav_projects, icon: FolderKanban, roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
    { href: "/my-tasks", label: t.nav_my_tasks, icon: CheckSquare, roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
    { href: "/users", label: t.nav_users, icon: Users, roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"] },
    { href: "/absences", label: t.nav_absences, icon: CalendarOff, roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
    { href: "/announcements", label: t.nav_announcements, icon: Radio, roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
    { href: "/notifications", label: t.nav_notifications, icon: Bell, roles: ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"] },
    { href: "/admin", label: t.nav_admin, icon: Terminal, roles: ["SUPER_ADMIN", "ADMIN"] },
  ];

  const filteredNav = navItems.filter((item) => user?.role && item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-[#1a2336] bg-[#0b0f19] select-none transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 lg:w-72 xl:w-80",
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 md:h-18 items-center justify-between border-b border-[#1a2336] px-4 md:px-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 opacity-50 pointer-events-none"></div>
          <Link href="/projects" onClick={close} className="flex items-center gap-2 md:gap-3 relative z-10">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.15)] interactive-hover">
              <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm md:text-base font-bold tracking-tight text-slate-100 font-mono neon-text">DEDSEC</span>
              <span className="block text-[9px] md:text-[10px] font-semibold text-emerald-400 font-mono tracking-wider">PROJECT CORE</span>
            </div>
          </Link>
          <button
            onClick={close}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 md:hidden transition-all duration-300 hover:bg-[#1e293b] interactive-hover z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6">
          <div>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 md:px-3">
              {lang === "fr" ? "ESPACE DE TRAVAIL" : "WORKSPACE"}
            </span>
            <nav className="mt-2 md:mt-3 space-y-1 md:space-y-1.5">
              {filteredNav.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/projects" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-2 md:gap-3 rounded-xl px-2.5 md:px-3.5 py-2 md:py-2.5 text-[11px] md:text-xs font-semibold transition-all duration-300 relative overflow-hidden",
                      isActive
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(0,255,136,0.1)] glow-border"
                        : "text-slate-400 hover:bg-[#131b2b] hover:text-slate-100 border border-transparent hover:border-[#232f44]"
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4 shrink-0", isActive ? "text-emerald-400" : "text-slate-400")} />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {isActive && <div className="absolute inset-0 bg-emerald-500/10 slide-left pointer-events-none"></div>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-[#1a2336] p-3 md:p-4 bg-[#080c14]">
          <Link
            href="/profile"
            onClick={close}
            className={cn(
              "mb-2 md:mb-3 flex items-center gap-2 md:gap-3 rounded-xl p-2 md:p-2.5 transition-all border",
              pathname === "/profile"
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-[#1e2a3e] hover:bg-[#141b2b] hover:border-[#2b3a55]"
            )}
            title="Profil & Préférences"
          >
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 flex items-center justify-center border border-cyan-500/40 text-[10px] md:text-xs font-bold text-cyan-300 shadow-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] md:text-xs font-bold text-slate-100 truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[9px] md:text-[10px] text-slate-400 font-semibold truncate uppercase">
                {user?.role}
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2 md:py-2.5 text-[11px] md:text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50"
          >
            <LogOut className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden md:inline">{t.nav_disconnect}</span>
            <span className="md:hidden">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
