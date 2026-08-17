"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Search, CheckCheck, Clock, Menu, ExternalLink, Globe, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useSidebarStore } from "@/stores/sidebarStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export function Topbar() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toggle } = useSidebarStore();
  const { lang, toggleLang } = useLangStore();
  const t = translations[lang] || translations.fr;
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifsRes, unreadRes] = await Promise.all([
        api.get("/notifications"),
        api.get("/notifications/unread-count"),
      ]);
      setNotifications(notifsRes.data);
      setUnreadCount(unreadRes.data.count ?? unreadRes.data);
    } catch (error) {
      // ignore
    }
  };

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (link) {
        setIsOpen(false);
        router.push(link);
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  return (
    <header className="flex h-14 md:h-16 lg:h-18 items-center justify-between border-b border-[#1a2336] bg-[#0b0f19]/95 backdrop-blur-md px-3 md:px-6 lg:px-8 select-none sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#182234] md:hidden transition-colors border border-[#233148]"
          title="Menu de navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Quick Search Input */}
        <div className="relative w-40 sm:w-56 md:w-72 lg:w-96 max-w-md hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder={t.search_placeholder}
            className="pl-10 pr-4 py-2 rounded-xl bg-[#141b2a] border-[#222d42] text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:bg-[#182032] focus:ring-0 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3 relative" ref={dropdownRef}>
        {/* Language Switcher Button */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-xl bg-[#141b2a] border border-[#222d42] hover:border-emerald-500/50 text-[10px] md:text-xs font-bold text-slate-300 hover:text-emerald-400 transition-all shadow-xs"
          title="Changer la langue / Switch language"
        >
          <Globe className="w-3 md:w-3.5 h-3 md:h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">{lang === "fr" ? "FR" : "EN"}</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative rounded-xl p-2 md:p-2.5 text-slate-400 hover:bg-[#182234] hover:text-slate-100 transition-all duration-300 border border-[#222d42] hover:border-[#324360] interactive-hover"
          title="Centre de notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 md:h-5 min-w-[16px] md:min-w-[20px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] md:text-[10px] font-bold text-slate-950 shadow-[0_0_10px_#00ff88] pulse-glow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown Drawer */}
        {isOpen && (
          <div className="absolute right-0 top-12 md:top-14 z-50 w-80 sm:w-96 rounded-2xl border border-[#26334a] bg-[#111827] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] bg-[#162032] p-3 md:p-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-xs font-bold text-slate-100">{lang === "fr" ? "NOTIFICATIONS" : "NOTIFICATIONS"}</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 md:px-2 py-0.5 text-[9px] md:text-[10px] font-bold text-emerald-400 border border-emerald-500/40">
                    {unreadCount} {lang === "fr" ? "NOUVEAU" : "NEW"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] md:text-[11px] text-cyan-400 hover:underline font-semibold"
                  >
                    <CheckCheck className="h-2.5 md:h-3 w-2.5 md:w-3" /> <span className="hidden sm:inline">{lang === "fr" ? "Tout lire" : "Mark all read"}</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/notifications");
                  }}
                  className="text-[10px] md:text-[11px] text-emerald-400 hover:underline font-bold"
                >
                  {lang === "fr" ? "Voir tout" : "View all"}
                </button>
              </div>
            </div>

            <div className="max-h-[300px] md:max-h-[380px] overflow-y-auto divide-y divide-[#1e2a3e] custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-6 md:p-8 text-center text-[10px] md:text-xs text-slate-500">
                  {lang === "fr" ? "Aucune nouvelle notification." : "No notifications recorded."}
                </div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkAsRead(n.id, n.link)}
                    className={`p-3 md:p-4 transition-colors cursor-pointer text-[10px] md:text-xs ${
                      n.isRead
                        ? "bg-[#111827] hover:bg-[#182234] opacity-70"
                        : "bg-[#172236] hover:bg-[#1e2c45] border-l-3 border-emerald-500"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-100 truncate text-[11px] md:text-xs">
                        {n.title}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="h-2 md:h-2.5 w-2 md:w-2.5" />
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-300 line-clamp-2 mb-2 leading-relaxed text-[9px] md:text-xs">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between text-[9px] md:text-[10px] text-slate-400">
                      <span className="uppercase font-bold text-cyan-400">
                        {n.type}
                      </span>
                      {n.link && (
                        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                          {lang === "fr" ? "Ouvrir" : "Open"} <ExternalLink className="h-2 md:h-2.5 w-2 md:w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
