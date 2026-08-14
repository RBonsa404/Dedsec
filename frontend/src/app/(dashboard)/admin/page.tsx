"use client";

import { useEffect, useState } from "react";
import { Users, ShieldAlert, Activity, Server, Plus, Settings } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  actor: { firstName: string; lastName: string };
  details: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 5,
    activeProjects: 1,
    systemLoad: "Normal",
    uptime: "99.9%"
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    // In a real app, fetch these from /api/audit-logs and /api/stats
    setAuditLogs([
      { id: "1", action: "USER_CREATED", createdAt: new Date().toISOString(), actor: { firstName: "System", lastName: "Admin" }, details: "Created user omar.benali@dedsec.io" },
      { id: "2", action: "PROJECT_CREATED", createdAt: new Date(Date.now() - 3600000).toISOString(), actor: { firstName: "System", lastName: "Admin" }, details: "Created project Phoenix" },
      { id: "3", action: "LOGIN", createdAt: new Date(Date.now() - 7200000).toISOString(), actor: { firstName: "Sophie", lastName: "Martin" }, details: "Successful login" },
    ]);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-accent-primary">
          &gt; /sys/admin
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="font-mono">
            <Plus className="w-4 h-4 mr-2" /> NEW_USER()
          </Button>
          <Button variant="outline" size="sm" className="font-mono">
            <ShieldAlert className="w-4 h-4 mr-2" /> BROADCAST()
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border-color bg-bg-secondary p-6 hover:border-accent-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-text-secondary">TOTAL_OPERATORS</h3>
            <Users className="w-5 h-5 text-accent-primary" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.totalUsers}</p>
          <p className="text-xs text-text-muted mt-1 font-mono">100% active</p>
        </div>

        <div className="rounded-lg border border-border-color bg-bg-secondary p-6 hover:border-accent-secondary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-text-secondary">ACTIVE_PROJECTS</h3>
            <Server className="w-5 h-5 text-accent-secondary" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.activeProjects}</p>
          <p className="text-xs text-text-muted mt-1 font-mono">+1 this week</p>
        </div>

        <div className="rounded-lg border border-border-color bg-bg-secondary p-6 hover:border-accent-warning/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-text-secondary">SYSTEM_LOAD</h3>
            <Activity className="w-5 h-5 text-accent-warning" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.systemLoad}</p>
          <p className="text-xs text-text-muted mt-1 font-mono">CPU & RAM OK</p>
        </div>

        <div className="rounded-lg border border-border-color bg-bg-secondary p-6 hover:border-accent-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-sm font-bold text-text-secondary">UPTIME</h3>
            <Settings className="w-5 h-5 text-accent-primary animate-spin-slow" />
          </div>
          <p className="text-3xl font-bold text-text-primary">{stats.uptime}</p>
          <p className="text-xs text-accent-primary mt-1 font-mono">All systems nominal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Audit Log */}
        <div className="col-span-2 rounded-lg border border-border-color bg-bg-secondary flex flex-col">
          <div className="border-b border-border-color p-4">
            <h3 className="font-mono text-lg font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              SYSTEM_AUDIT_LOG
            </h3>
          </div>
          <div className="flex-1 p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary uppercase bg-bg-tertiary border-b border-border-color font-mono">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border-color hover:bg-bg-tertiary/50">
                    <td className="px-6 py-4 text-text-muted font-mono whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-bg-tertiary border border-border-color px-2 py-1 rounded text-xs font-mono text-accent-secondary">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {log.actor.firstName} {log.actor.lastName}
                    </td>
                    <td className="px-6 py-4 text-text-secondary truncate max-w-[200px]" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Config */}
        <div className="rounded-lg border border-border-color bg-bg-secondary p-6">
          <h3 className="font-mono text-lg font-bold text-text-primary mb-4 border-b border-border-color pb-2">
            QUICK_CONFIG
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded bg-bg-tertiary border border-border-color">
              <span className="text-sm font-bold">Maintence Mode</span>
              <div className="w-10 h-5 rounded-full bg-bg-primary border border-border-color relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-text-muted absolute left-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-bg-tertiary border border-border-color">
              <span className="text-sm font-bold">Registration</span>
              <div className="w-10 h-5 rounded-full bg-accent-primary/20 border border-accent-primary/50 relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-accent-primary absolute right-0.5 top-0.5"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 rounded bg-bg-tertiary border border-border-color">
              <span className="text-sm font-bold">Debug Logs</span>
              <div className="w-10 h-5 rounded-full bg-bg-primary border border-border-color relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-text-muted absolute left-0.5 top-0.5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
