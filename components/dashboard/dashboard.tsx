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
import { inr, rangeLabel } from "@/lib/format";
import type { Expense } from "@/lib/types";
import {
  applyFilters,
  byKey,
  distinctValues,
  kpisRange,
  monthlyTrend,
  pctChange,
  prevRange,
  thisMonth,
  today,
  type Filters,
} from "@/lib/aggregate";
import { Donut, TrendBars } from "./charts";
import { RecentTable } from "./recent-table";
import { KpiCard, DeltaSub } from "./kpi-card";
import { FilterSelect } from "./filter-select";
import { DateRangeFilter } from "./date-range-filter";
import { SpendCalendar } from "./spend-calendar";

export function Dashboard({ expenses }: { expenses: Expense[] }) {
  const categories = useMemo(
    () => distinctValues(expenses, "category"),
    [expenses]
  );
  const methods = useMemo(() => distinctValues(expenses, "method"), [expenses]);

  const [filters, setFilters] = useState<Filters>({
    from: `${thisMonth()}-01`,
    to: today(),
    category: "all",
    method: "all",
  });

  const filtered = useMemo(
    () => applyFilters(expenses, filters),
    [expenses, filters]
  );

  const k = useMemo(
    () => kpisRange(expenses, filters.from, filters.to),
    [expenses, filters.from, filters.to]
  );

  const prev =
    filters.from && filters.to ? prevRange(filters.from, filters.to) : null;
  const kPrev = useMemo(
    () => (prev ? kpisRange(expenses, prev.from, prev.to) : null),
    [expenses, prev?.from, prev?.to]
  );
  const incomeDelta = kPrev ? pctChange(k.income, kPrev.income) : null;
  const spentDelta = kPrev ? pctChange(k.spent, kPrev.spent) : null;
  const savingsRate = k.income > 0 ? Math.round((k.net / k.income) * 100) : null;

  const catData = useMemo(() => byKey(filtered, "category"), [filtered]);
  const methodData = useMemo(() => byKey(filtered, "method"), [filtered]);
  const trend = useMemo(() => monthlyTrend(expenses), [expenses]);

  const rangeText = rangeLabel(filters.from, filters.to);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center">
        <DateRangeFilter
          value={{ from: filters.from, to: filters.to }}
          onChange={(v) =>
            setFilters((f) => ({ ...f, from: v.from, to: v.to }))
          }
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
          label={`Income · ${rangeText}`}
          value={inr(k.income)}
          icon={<ArrowUpRight className="size-4" />}
          accent="income"
          sub={
            prev ? (
              <DeltaSub pct={incomeDelta} prevLabel="prev period" />
            ) : undefined
          }
        />
        <KpiCard
          label={`Spent · ${rangeText}`}
          value={inr(k.spent)}
          icon={<ArrowDownRight className="size-4" />}
          accent="spend"
          sub={
            prev ? (
              <DeltaSub pct={spentDelta} prevLabel="prev period" />
            ) : undefined
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
      <SpendCalendar
        expenses={expenses}
        onSelectDay={(iso) => setFilters((f) => ({ ...f, from: iso, to: iso }))}
      />

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
