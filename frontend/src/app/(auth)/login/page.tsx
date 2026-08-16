"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const data = res.data;

      if (data.mustChangePassword) {
        router.push(`/reset-password?token=${data.tempToken}`);
        return;
      }

      setAuth(data.user, data.accessToken);
      
      if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/projects");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Identifiants invalides. Veuillez vérifier votre email et mot de passe.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-[#0b0f19] text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-[#232f44] bg-[#111827] p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="mb-8 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            DEDSEC Workspace
          </h1>
          <p className="text-slate-400 text-xs mt-1">Plateforme de gestion de projets et sécurité</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Adresse email</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="votre.email@dedsec.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl py-2.5"
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mot de passe</span>
              </Label>
              <button
                type="button"
                className="text-[11px] text-cyan-400 hover:underline font-medium"
                onClick={() => router.push("/forgot-password")}
              >
                Mot de passe oublié ?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl py-2.5"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm py-2.5 gap-2 shadow-lg shadow-emerald-500/20 transition-all mt-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion en cours...</span>
              </>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
