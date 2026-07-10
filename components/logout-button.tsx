"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <Button
      variant="link"
      size="sm"
      onClick={onLogout}
      disabled={loading}
      className="text-muted-foreground hover:text-foreground"
    >
      <LogOut className="size-3.5" />
      {loading ? "Logging out…" : "Log out"}
    </Button>
  );
}
