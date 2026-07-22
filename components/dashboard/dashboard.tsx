"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  PiggyBank,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { inr, rangeLabel } from "@/lib/format";
import type { Expense } from "@/lib/types";
import {
  applyFilters,
  byKey,
  kpisRange,
  monthlyTrend,
  pctChange,
  prevRange,
  thisMonth,
  today,
} from "@/lib/aggregate";
import { Donut, TrendBars } from "./charts";
import { RecentTable } from "./recent-table";
import { KpiCard, DeltaSub } from "./kpi-card";
import { SpendCalendar } from "./spend-calendar";
import { DateRangeFilter, type DateRangeValue } from "./date-range-filter";

export function Dashboard({
  expenses,
  action,
}: {
  expenses: Expense[];
  action: ReactNode;
}) {
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    from: `${thisMonth()}-01`,
    to: today(),
  });
  const filteredExpenses = useMemo(
    () =>
      applyFilters(expenses, {
        from: dateRange.from,
        to: dateRange.to,
        category: "all",
        method: "all",
      }),
    [expenses, dateRange]
  );

  const k = useMemo(
    () => kpisRange(expenses, dateRange.from, dateRange.to),
    [expenses, dateRange]
  );

  const prev = dateRange.from && dateRange.to
    ? prevRange(dateRange.from, dateRange.to)
    : null;
  const kPrev = useMemo(
    () => (prev ? kpisRange(expenses, prev.from, prev.to) : null),
    [expenses, prev]
  );
  const incomeDelta = kPrev ? pctChange(k.income, kPrev.income) : null;
  const spentDelta = kPrev ? pctChange(k.spent, kPrev.spent) : null;
  const savingsRate = k.income > 0 ? Math.round((k.net / k.income) * 100) : null;

  const catData = useMemo(() => byKey(filteredExpenses, "category"), [filteredExpenses]);
  const methodData = useMemo(() => byKey(filteredExpenses, "method"), [filteredExpenses]);
  const trend = useMemo(() => monthlyTrend(expenses), [expenses]);
  const rangeText = rangeLabel(dateRange.from, dateRange.to);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
        {action}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={`Income · ${rangeText}`}
          value={inr(k.income)}
          icon={<ArrowUpRight className="size-4" />}
          accent="income"
          sub={
            <DeltaSub pct={incomeDelta} prevLabel="prev period" />
          }
        />
        <KpiCard
          label={`Spent · ${rangeText}`}
          value={inr(k.spent)}
          icon={<ArrowDownRight className="size-4" />}
          accent="spend"
          sub={
            <DeltaSub pct={spentDelta} prevLabel="prev period" />
          }
        />
        <KpiCard
          label="Spent today"
          value={inr(k.todaySpent)}
          icon={<CalendarDays className="size-4" />}
          accent="muted"
        />
        <KpiCard
          label={`Net saved · ${rangeText}`}
          value={inr(k.net)}
          icon={<PiggyBank className="size-4" />}
          accent={k.net >= 0 ? "income" : "spend"}
          sub={
            savingsRate != null ? (
              <span className="text-xs text-muted-foreground">
                {savingsRate}% of income saved
              </span>
            ) : undefined
          }
        />
      </div>

      {/* Donuts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={catData} />
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Spend by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <Donut data={methodData} />
          </CardContent>
        </Card>
      </div>

      {/* Heatmap */}
      <SpendCalendar expenses={expenses} />

      {/* Monthly trend */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Income vs Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <TrendBars data={trend} />
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentTable rows={filteredExpenses} dateRange={dateRange} />
        </CardContent>
      </Card>
    </div>
  );
}
