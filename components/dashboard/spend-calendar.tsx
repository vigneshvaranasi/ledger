"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/format";
import type { Expense } from "@/lib/types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["", "Mon", "", "Wed", "", "Fri", ""];

const RAMP = ["#fde68a", "#fcd34d", "#fbbf24", "#f59e0b"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

type Cell = { iso: string; day: number; spent: number } | null;
type Month = { index: number; weeks: Cell[][] };

export function SpendCalendar({
  expenses,
  onSelectDay,
}: {
  expenses: Expense[];
  onSelectDay?: (iso: string) => void;
}) {
  const thisYear = new Date().getFullYear();
  const [year, setYear] = useState(thisYear);

  const years = useMemo(() => {
    let min = thisYear;
    for (const e of expenses) {
      if (!e.date) continue;
      const y = Number(e.date.slice(0, 4));
      if (y < min) min = y;
    }
    const arr: number[] = [];
    for (let y = thisYear; y >= min; y--) arr.push(y);
    return arr;
  }, [expenses, thisYear]);

  const { months, total, max } = useMemo(() => {
    const perDay = new Map<string, number>();
    for (const e of expenses) {
      if (e.type === "Income" || !e.date) continue;
      if (e.date.slice(0, 4) !== String(year)) continue;
      perDay.set(e.date, (perDay.get(e.date) ?? 0) + e.amount);
    }

    let max = 0;
    let total = 0;
    for (const v of perDay.values()) {
      if (v > max) max = v;
      total += v;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isCurrent = year === thisYear;
    const lastMonth = isCurrent ? today.getMonth() : 11;

    const months: Month[] = [];
    for (let mo = 0; mo <= lastMonth; mo++) {
      const daysInMonth = new Date(year, mo + 1, 0).getDate();
      const lead = new Date(year, mo, 1).getDay();
      const maxDay =
        isCurrent && mo === today.getMonth() ? today.getDate() : daysInMonth;

      const cells: Cell[] = [];
      for (let i = 0; i < lead; i++) cells.push(null);
      for (let d = 1; d <= maxDay; d++) {
        const iso = `${year}-${pad(mo + 1)}-${pad(d)}`;
        cells.push({ iso, day: d, spent: perDay.get(iso) ?? 0 });
      }

      const weeks: Cell[][] = [];
      for (let i = 0; i < cells.length; i += 7) {
        const wk = cells.slice(i, i + 7);
        while (wk.length < 7) wk.push(null);
        weeks.push(wk);
      }
      months.push({ index: mo, weeks });
    }
    return { months, total, max };
  }, [expenses, year, thisYear]);

  function bg(spent: number): string | undefined {
    if (spent <= 0) return undefined;
    const r = max > 0 ? spent / max : 0;
    const idx = r > 0.75 ? 3 : r > 0.5 ? 2 : r > 0.25 ? 1 : 0;
    return RAMP[idx];
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Spending calendar</CardTitle>
          <span className="text-xs text-muted-foreground">
            Total · <span className="tabular-nums">{inr(total)}</span>
          </span>
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          {years.map((y) => (
            <Button
              key={y}
              size="sm"
              variant={y === year ? "secondary" : "ghost"}
              className="h-9 shrink-0 px-4 text-sm tabular-nums sm:h-7 sm:px-2.5 sm:text-xs"
              onClick={() => setYear(y)}
            >
              {y}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-2">
            {/* Weekday labels */}
            <div className="flex flex-col">
              <div className="mb-1 h-4" />
              <div className="flex flex-col gap-0.75">
                {WEEKDAYS.map((l, i) => (
                  <div
                    key={i}
                    className="flex h-3 items-center justify-end pr-1 text-[10px] leading-none text-muted-foreground"
                  >
                    {l}
                  </div>
                ))}
              </div>
            </div>

            {/* One separated group per month */}
            {months.map((m) => (
              <div key={m.index} className="flex flex-col">
                <div className="mb-1 h-4 text-[10px] text-muted-foreground">
                  {MONTHS[m.index]}
                </div>
                <div className="flex gap-0.75">
                  {m.weeks.map((wk, wi) => (
                    <div key={wi} className="flex flex-col gap-0.75">
                      {wk.map((c, di) =>
                        c === null ? (
                          <div key={di} className="size-3" />
                        ) : (
                          <button
                            key={di}
                            type="button"
                            onClick={() => onSelectDay?.(c.iso)}
                            title={`${inr(c.spent)} · ${c.day} ${MONTHS[m.index]} ${year}`}
                            data-empty={c.spent <= 0}
                            style={{ backgroundColor: bg(c.spent) }}
                            className="size-3 rounded-xs outline-none ring-ring transition hover:ring-2 focus-visible:ring-2 data-[empty=true]:bg-muted"
                          />
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <span>Less</span>
          <span className="size-3 rounded-xs bg-muted" />
          {RAMP.map((c) => (
            <span
              key={c}
              className="size-3 rounded-xs"
              style={{ backgroundColor: c }}
            />
          ))}
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
