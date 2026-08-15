"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/forgot-password", { email });
      setMessage("If the account exists, a recovery token has been generated / simulated in server logs.");
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to process request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border-color bg-bg-secondary p-8 shadow-2xl relative overflow-hidden">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-accent-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> BACK_TO_GATEWAY
        </button>

        <div className="mb-8 text-center relative z-10">
          <h1 className="font-mono text-2xl font-bold tracking-tighter text-accent-primary mb-2">
            [ KEY_RECOVERY ]
          </h1>
          <p className="text-text-secondary text-xs font-mono">
            REQUEST EMERGENCY PASSPHRASE OVERRIDE
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email">ACCOUNT IDENTIFIER</Label>
            <Input
              id="email"
              type="email"
              placeholder="operator@dedsec.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-bg-primary"
            />
          </div>

          {message && (
            <div className="rounded-md border border-accent-primary/50 bg-accent-primary/10 p-3 text-xs text-accent-primary font-mono">
              &gt; {message}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger font-mono">
              &gt; ERROR: {error}
            </div>
          )}

          <Button type="submit" className="w-full font-mono text-base tracking-wide" disabled={isLoading}>
            {isLoading ? "TRANSMITTING..." : "DISPATCH_RESET_TOKEN()"}
          </Button>
        </form>
      </div>
    </div>
  );
}
