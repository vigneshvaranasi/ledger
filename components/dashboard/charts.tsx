"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { inr, inrCompact, monthShort } from "@/lib/format";
import type { Slice, TrendRow } from "@/lib/aggregate";

const PALETTE = [
  "hsl(217 91% 60%)",
  "hsl(173 58% 45%)",
  "hsl(27 87% 60%)",
  "hsl(280 65% 62%)",
  "hsl(142 71% 45%)",
  "hsl(340 75% 58%)",
  "hsl(43 84% 55%)",
  "hsl(197 70% 48%)",
  "hsl(12 76% 61%)",
  "hsl(250 70% 65%)",
  "hsl(160 60% 40%)",
  "hsl(0 0% 55%)",
];

function colorFor(i: number): string {
  if (i < PALETTE.length) return PALETTE[i];
  const hue = Math.round((i * 137.508) % 360);
  const light = i % 2 === 0 ? 58 : 46;
  return `hsl(${hue} 68% ${light}%)`;
}

export function Donut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-55 items-center justify-center text-sm text-muted-foreground">
        No spend in this period.
      </div>
    );
  }

  const config: ChartConfig = {};
  data.forEach((d, i) => {
    config[d.name] = { label: d.name, color: colorFor(i) };
  });

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <ChartContainer
        config={config}
        className="aspect-square h-47.5 w-47.5 shrink-0"
      >
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="name"
                hideLabel
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-3">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="font-medium tabular-nums">
                      {inr(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={colorFor(i)} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      <ul className="w-full min-w-0 flex-1 space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-xs"
              style={{ backgroundColor: colorFor(i) }}
            />
            <span className="min-w-0 truncate text-foreground">{d.name}</span>
            <span className="ml-auto shrink-0 font-medium tabular-nums">
              {inr(d.value)}
            </span>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {Math.round((d.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TrendBars({ data }: { data: TrendRow[] }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const years = useMemo(
    () => [...new Set(data.map((row) => Number(row.month.slice(0, 4))))]
      .sort((a, b) => b - a),
    [data]
  );
  const selectedYear = years.includes(year) ? year : (years[0] ?? currentYear);
  const rows = data
    .filter((row) => row.month.startsWith(`${selectedYear}-`))
    .map((row) => ({ ...row, label: monthShort(row.month) }));

  if (data.length === 0) {
    return (
      <div className="flex h-70 items-center justify-center text-sm text-muted-foreground">
        No data yet.
      </div>
    );
  }

  const config = {
    income: { label: "Income", color: "hsl(217 91% 60%)" },
    spent: { label: "Spent", color: "hsl(25 95% 58%)" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-3">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1">
        {years.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={value === selectedYear ? "secondary" : "ghost"}
            className="h-7 shrink-0 px-2.5 text-xs tabular-nums"
            onClick={() => setYear(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="flex h-70 items-center justify-center text-sm text-muted-foreground">
          No data for {selectedYear}.
        </div>
      ) : (
      <ChartContainer config={config} className="h-70 w-full min-w-0">
        <BarChart data={rows} margin={{ left: 4, right: 4, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickFormatter={(v) => inrCompact(Number(v))}
          tickLine={false}
          axisLine={false}
          width={52}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-3">
                  <span className="capitalize text-muted-foreground">
                    {name}
                  </span>
                  <span className="font-medium tabular-nums">
                    {inr(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="income"
          fill="var(--color-income)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="spent"
          fill="var(--color-spent)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
        </BarChart>
      </ChartContainer>
      )}
    </div>
  );
}
