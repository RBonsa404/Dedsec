"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Trash2, 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  Filter,
  Layers,
  Inbox
} from "lucide-react";
import { useRouter } from "next/navigation";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [feedback, setFeedback] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (link) router.push(link);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showFeedback("All notifications cleared and marked as read.");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "READ") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-accent-primary flex items-center gap-2">
            &gt; /sys/notifications
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            DISPATCH TELEMETRY & EVENT STREAM LOGS
          </p>
        </div>

        {unreadCount > 0 && (
          <Button onClick={handleMarkAllRead} variant="outline" className="font-mono gap-1.5 text-xs">
            <CheckCheck className="w-4 h-4 text-accent-primary" /> MARK_ALL_ACKNOWLEDGED()
          </Button>
        )}
      </div>

      {feedback && (
        <div className="rounded-md border border-accent-primary/50 bg-accent-primary/10 p-3 text-sm text-accent-primary font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {feedback}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between rounded-lg border border-border-color bg-bg-secondary p-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          {(["ALL", "UNREAD", "READ"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded font-bold transition-colors ${
                filter === f
                  ? "bg-accent-primary/20 text-accent-primary border border-accent-primary/40"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {f} ({f === "ALL" ? notifications.length : f === "UNREAD" ? unreadCount : notifications.length - unreadCount})
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="rounded-lg border border-border-color bg-bg-secondary overflow-hidden divide-y divide-border-color">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-text-muted font-mono">
            <Inbox className="w-10 h-10 mx-auto mb-2 text-text-muted opacity-50" />
            NO_DISPATCH_SIGNALS_RECORDED
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkAsRead(n.id, n.link)}
              className={`p-4 transition-colors cursor-pointer flex items-start justify-between gap-4 ${
                n.isRead
                  ? "bg-bg-secondary hover:bg-bg-tertiary/40 opacity-70"
                  : "bg-bg-tertiary/70 hover:bg-bg-tertiary border-l-4 border-accent-primary"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-bg-primary border border-border-color text-accent-secondary">
                    {n.type}
                  </span>
                  <span className="font-bold text-sm font-mono text-text-primary">
                    {n.title}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-sans leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-text-muted">
                  <Clock className="w-3 h-3" />
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>

              {n.link && (
                <span className="text-xs font-mono text-accent-primary flex items-center gap-1 shrink-0">
                  ENTER <ExternalLink className="w-3 h-3" />
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
