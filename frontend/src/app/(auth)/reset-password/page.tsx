"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import api from "@/lib/api";

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
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

    setIsLoading(true);

    try {
      const res = await api.post("/auth/change-password", { newPassword, tempToken: token });
      const data = res.data;

      setAuth(data.user, data.accessToken);

      if (data.user.role === "SUPER_ADMIN" || data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/projects");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to update password";
      setError(errorMessage);
      
      // Extract detailed password errors if available
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setPasswordErrors(err.response.data.errors);
      } else {
        setPasswordErrors([]);
      }
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
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-bg-primary"
            />
            <div className="text-[10px] text-text-secondary mt-1">
              Minimum 8 characters. Avoid very common passwords.
            </div>
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
              {passwordErrors.length > 0 && (
                <ul className="mt-2 ml-4 list-disc text-xs">
                  {passwordErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              )}
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
