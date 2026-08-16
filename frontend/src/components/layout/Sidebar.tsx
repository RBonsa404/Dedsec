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
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-72 flex-col border-r border-gray-200 bg-white select-none transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:w-64 lg:w-72 xl:w-80",
          isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 md:h-18 items-center justify-between border-b border-gray-200 px-4 md:px-6">
          <Link href="/projects" onClick={close} className="flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <span className="text-sm md:text-base font-bold tracking-tight text-gray-900">DEDSEC</span>
              <span className="block text-[9px] md:text-[10px] font-semibold text-gray-500 tracking-wider">PROJECT MANAGEMENT</span>
            </div>
          </Link>
          <button
            onClick={close}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-900 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 md:py-6 px-3 md:px-4 space-y-4 md:space-y-6">
          <div>
            <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 md:px-3">
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
                      "flex items-center gap-2 md:gap-3 rounded-lg px-2.5 md:px-3.5 py-2 md:py-2.5 text-[11px] md:text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4 shrink-0", isActive ? "text-blue-600" : "text-gray-400")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t border-gray-200 p-3 md:p-4 bg-gray-50">
          <Link
            href="/profile"
            onClick={close}
            className={cn(
              "mb-2 md:mb-3 flex items-center gap-2 md:gap-3 rounded-lg p-2 md:p-2.5 transition-all border",
              pathname === "/profile"
                ? "border-blue-200 bg-blue-50"
                : "border-gray-200 hover:bg-gray-100"
            )}
            title="Profil & Préférences"
          >
            <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-blue-100 flex items-center justify-center text-[10px] md:text-xs font-bold text-blue-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] md:text-xs font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[9px] md:text-[10px] text-gray-500 font-medium truncate uppercase">
                {user?.role}
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 md:py-2.5 text-[11px] md:text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 border border-gray-200"
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
