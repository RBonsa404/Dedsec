"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      // First try change-password endpoint with tempToken Bearer
      const res = await fetch("http://localhost:4000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      setAuth(data.user, data.accessToken);

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/projects");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg border border-border-color bg-bg-secondary p-8 shadow-2xl relative overflow-hidden">
        <div className="mb-8 text-center relative z-10">
          <h1 className="font-mono text-2xl font-bold tracking-tighter text-accent-primary mb-2">
            [ ROTATE_CREDENTIALS ]
          </h1>
          <p className="text-text-secondary text-xs font-mono">
            SECURITY POLICY: INITIAL PASSPHRASE ROTATION REQUIRED
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="newPassword">NEW PASSPHRASE</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Min 8 chars, mixed case, symbols"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-bg-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">CONFIRM PASSPHRASE</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-bg-primary"
            />
          </div>

          {error && (
            <div className="rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger font-mono">
              &gt; ERROR: {error}
            </div>
          )}

          <Button type="submit" className="w-full font-mono text-base tracking-wide" disabled={isLoading}>
            {isLoading ? "UPDATING_CIPHER..." : "COMMIT_PASSPHRASE()"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-8 text-accent-primary font-mono">LOADING_SUBSYSTEM...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
