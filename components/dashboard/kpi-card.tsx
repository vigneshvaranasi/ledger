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
    <Card className="min-w-0">
      <CardHeader className="pb-2">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <CardDescription className="min-w-0 truncate">{label}</CardDescription>
          <span className={cn("shrink-0", ACCENT[accent])}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-2xl font-semibold tabular-nums", ACCENT[accent])}
        >
          {value}
        </div>
        {sub ? <div className="mt-1">{sub}</div> : null}
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
