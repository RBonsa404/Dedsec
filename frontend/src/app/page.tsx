"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/projects");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary">
      <div className="text-center font-mono text-accent-primary animate-pulse">
        &gt; INITIALIZING_SYSTEM_CORE...
      </div>
    </div>
  );
}
