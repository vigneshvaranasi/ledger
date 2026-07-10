import type { Expense } from "./types";

const isIncome = (e: Expense) => e.type === "Income";
const isExpense = (e: Expense) => e.type !== "Income";
const ym = (iso: string) => iso.slice(0, 7);

function pad(n: number) {
  return String(n).padStart(2, "0");
}
export function thisMonth(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}
export function today(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function parseDay(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function shiftDays(iso: string, n: number): string {
  const d = parseDay(iso);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000
  ) + 1;
}
export function prevRange(from: string, to: string): { from: string; to: string } {
  const len = daysBetween(from, to);
  const prevTo = shiftDays(from, -1);
  const prevFrom = shiftDays(prevTo, -(len - 1));
  return { from: prevFrom, to: prevTo };
}

export function pctChange(cur: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((cur - prev) / prev) * 100);
}

export type Kpis = {
  income: number;
  spent: number;
  net: number;
  todaySpent: number;
};

export function kpisRange(
  data: Expense[],
  from: string | null,
  to: string | null
): Kpis {
  const td = today();
  let income = 0;
  let spent = 0;
  let todaySpent = 0;
  for (const e of data) {
    const d = e.date;
    if (d && (!from || d >= from) && (!to || d <= to)) {
      if (isIncome(e)) income += e.amount;
      else spent += e.amount;
    }
    if (isExpense(e) && d === td) todaySpent += e.amount;
  }
  return { income, spent, net: income - spent, todaySpent };
}

export type Slice = { name: string; value: number };

export function byKey(
  data: Expense[],
  key: "category" | "method",
  month?: string
): Slice[] {
  const map = new Map<string, number>();
  for (const e of data) {
    if (!isExpense(e)) continue;
    if (month && e.date?.slice(0, 7) !== month) continue;
    const k = (e[key] as string | null) ?? "Uncategorized";
    map.set(k, (map.get(k) ?? 0) + e.amount);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export type TrendRow = { month: string; spent: number; income: number };

export function monthlyTrend(data: Expense[]): TrendRow[] {
  const map = new Map<string, TrendRow>();
  for (const e of data) {
    if (!e.date) continue;
    const k = ym(e.date);
    const row = map.get(k) ?? { month: k, spent: 0, income: 0 };
    if (isIncome(e)) row.income += e.amount;
    else row.spent += e.amount;
    map.set(k, row);
  }
  return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
}

export function distinctValues(
  data: Expense[],
  key: "category" | "method"
): string[] {
  const set = new Set<string>();
  for (const e of data) {
    const v = e[key];
    if (v) set.add(v);
  }
  return [...set].sort();
}

export type Filters = {
  from: string | null;
  to: string | null;
  category: string | "all";
  method: string | "all";
};

export function applyFilters(data: Expense[], f: Filters): Expense[] {
  return data.filter((e) => {
    const d = e.date;
    if (f.from && (!d || d < f.from)) return false;
    if (f.to && (!d || d > f.to)) return false;
    if (f.category !== "all" && (e.category ?? "Uncategorized") !== f.category)
      return false;
    if (f.method !== "all" && (e.method ?? "—") !== f.method) return false;
    return true;
  });
}
