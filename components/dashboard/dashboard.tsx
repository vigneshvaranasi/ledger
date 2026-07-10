"use client";

import { useMemo, useState } from "react";
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
import { inr, monthLabel, monthShort } from "@/lib/format";
import type { Expense } from "@/lib/types";
import {
  applyFilters,
  byKey,
  distinctMonths,
  distinctValues,
  kpis,
  monthlyTrend,
  pctChange,
  prevMonth,
  thisMonth,
  type Filters,
} from "@/lib/aggregate";
import { Donut, TrendBars } from "./charts";
import { RecentTable } from "./recent-table";
import { KpiCard, DeltaSub } from "./kpi-card";
import { FilterSelect } from "./filter-select";

export function Dashboard({ expenses }: { expenses: Expense[] }) {
  const months = useMemo(() => distinctMonths(expenses), [expenses]);
  const categories = useMemo(
    () => distinctValues(expenses, "category"),
    [expenses]
  );
  const methods = useMemo(() => distinctValues(expenses, "method"), [expenses]);

  const [filters, setFilters] = useState<Filters>({
    month: "all",
    category: "all",
    method: "all",
  });

  const filtered = useMemo(
    () => applyFilters(expenses, filters),
    [expenses, filters]
  );

  const kpiMonth = filters.month === "all" ? thisMonth() : filters.month;
  const k = useMemo(() => kpis(expenses, kpiMonth), [expenses, kpiMonth]);

  const kPrev = useMemo(
    () => kpis(expenses, prevMonth(kpiMonth)),
    [expenses, kpiMonth]
  );
  const incomeDelta = pctChange(k.income, kPrev.income);
  const spentDelta = pctChange(k.spent, kPrev.spent);
  const prevLabel = monthShort(prevMonth(kpiMonth));
  const savingsRate = k.income > 0 ? Math.round((k.net / k.income) * 100) : null;

  const catData = useMemo(() => byKey(filtered, "category"), [filtered]);
  const methodData = useMemo(() => byKey(filtered, "method"), [filtered]);
  const trend = useMemo(() => monthlyTrend(expenses), [expenses]);

  const monthText =
    filters.month === "all"
      ? monthLabel(thisMonth())
      : monthLabel(filters.month);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <FilterSelect
          label="Month"
          value={filters.month}
          onValueChange={(v) => setFilters((f) => ({ ...f, month: v ?? "all" }))}
          options={months.map((m) => ({ value: m, label: monthLabel(m) }))}
          allLabel="All months"
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, category: v ?? "all" }))
          }
          options={categories.map((c) => ({ value: c, label: c }))}
          allLabel="All categories"
        />
        <FilterSelect
          label="Method"
          value={filters.method}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, method: v ?? "all" }))
          }
          options={methods.map((m) => ({ value: m, label: m }))}
          allLabel="All methods"
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label={`Income · ${monthText}`}
          value={inr(k.income)}
          icon={<ArrowUpRight className="size-4" />}
          accent="income"
          sub={<DeltaSub pct={incomeDelta} prevLabel={prevLabel} />}
        />
        <KpiCard
          label={`Spent · ${monthText}`}
          value={inr(k.spent)}
          icon={<ArrowDownRight className="size-4" />}
          accent="spend"
          sub={<DeltaSub pct={spentDelta} prevLabel={prevLabel} />}
        />
        <KpiCard
          label="Spent today"
          value={inr(k.todaySpent)}
          icon={<CalendarDays className="size-4" />}
          accent="muted"
        />
        <KpiCard
          label={`Net saved · ${monthText}`}
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
          <RecentTable rows={filtered} />
        </CardContent>
      </Card>
    </div>
  );
}
