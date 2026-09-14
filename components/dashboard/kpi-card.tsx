import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ACCENT: Record<string, string> = {
  income: "text-primary",
  spend: "text-[var(--warning)]",
  muted: "text-muted-foreground",
};

const ICON_SURFACE: Record<string, string> = {
  income: "bg-primary/10",
  spend: "bg-[var(--warning)]/10",
  muted: "bg-muted",
};

export function KpiCard({
  label,
  value,
  icon,
  accent,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: keyof typeof ACCENT;
  sub?: React.ReactNode;
}) {
  return (
    <Card className="min-w-0 gap-3 border-border/70 py-5 shadow-none transition-shadow hover:shadow-sm">
      <CardHeader className="gap-0 px-5 pb-0">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <CardDescription className="min-w-0 truncate text-sm">
            {label}
          </CardDescription>
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              ICON_SURFACE[accent],
              ACCENT[accent]
            )}
          >
            {icon}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-5">
        <div
          className={cn(
            "text-2xl font-semibold tracking-tight tabular-nums",
            ACCENT[accent]
          )}
        >
          {value}
        </div>
        <div className="mt-2 min-h-5">{sub}</div>
      </CardContent>
    </Card>
  );
}

export function DeltaSub({
  pct,
  prevLabel,
}: {
  pct: number | null;
  prevLabel: string;
}) {
  if (pct === null) {
    return (
      <span className="text-xs text-muted-foreground">no {prevLabel} data</span>
    );
  }
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
      <Icon className="size-3.5" />
      {up ? "+" : ""}
      {pct}% vs {prevLabel}
    </span>
  );
}
