"use client";

import { useEffect, useState } from "react";
import { format, parseISO, startOfMonth, subDays, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { rangeLabel } from "@/lib/format";

export type DateRangeValue = { from: string | null; to: string | null };

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const PRESETS: { label: string; range: () => DateRangeValue }[] = [
  { label: "Today", range: () => ({ from: iso(new Date()), to: iso(new Date()) }) },
  {
    label: "Last 7 days",
    range: () => ({ from: iso(subDays(new Date(), 6)), to: iso(new Date()) }),
  },
  {
    label: "Last 30 days",
    range: () => ({ from: iso(subDays(new Date(), 29)), to: iso(new Date()) }),
  },
  {
    label: "This month",
    range: () => ({ from: iso(startOfMonth(new Date())), to: iso(new Date()) }),
  },
  {
    label: "Last 3 months",
    range: () => ({ from: iso(subMonths(new Date(), 3)), to: iso(new Date()) }),
  },
  { label: "All dates", range: () => ({ from: null, to: null }) },
];

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const on = () => setDesktop(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

function toDraft(v: DateRangeValue): DateRange | undefined {
  if (!v.from) return undefined;
  return { from: parseISO(v.from), to: v.to ? parseISO(v.to) : undefined };
}

function matchPreset(v: DateRangeValue): string | null {
  for (const p of PRESETS) {
    const r = p.range();
    if (r.from === v.from && r.to === v.to) return p.label;
  }
  return null;
}

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>(toDraft(value));
  const isDesktop = useIsDesktop();
  const activePreset = matchPreset(value);

  useEffect(() => {
    if (open) setDraft(toDraft(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function apply(v: DateRangeValue) {
    onChange(v);
    setOpen(false);
  }

  function applyDraft() {
    if (draft?.from) {
      apply({ from: iso(draft.from), to: iso(draft.to ?? draft.from) });
    } else {
      apply({ from: null, to: null });
    }
  }

  return (
    <div className="flex w-full items-center gap-2 sm:w-auto">
      <span className="w-20 shrink-0 text-sm text-muted-foreground sm:w-auto">
        Dates
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="min-w-0 flex-1 justify-start font-normal sm:w-48 sm:flex-none"
          >
            <CalendarIcon className="size-4 shrink-0" />
            <span className="truncate">
              {activePreset ?? rangeLabel(value.from, value.to)}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[calc(100vw-1.5rem)] p-0 sm:w-auto"
          align="start"
          collisionPadding={12}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="grid grid-cols-2 gap-1 border-b p-2 sm:flex sm:flex-col sm:border-b-0 sm:border-r">
              {PRESETS.map((p) => (
                <Button
                  key={p.label}
                  variant={activePreset === p.label ? "secondary" : "ghost"}
                  size="sm"
                  className="justify-center whitespace-nowrap px-2 font-normal sm:justify-start"
                  onClick={() => apply(p.range())}
                >
                  {p.label}
                </Button>
              ))}
            </div>
            <div className="flex flex-col p-2">
              <Calendar
                mode="range"
                numberOfMonths={isDesktop ? 2 : 1}
                selected={draft}
                onSelect={setDraft}
                defaultMonth={draft?.from}
                disabled={{ after: new Date() }}
                autoFocus
                className="mx-auto"
              />
              <div className="mt-2 flex justify-end gap-2 border-t pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => apply({ from: null, to: null })}
                >
                  Clear
                </Button>
                <Button size="sm" onClick={applyDraft} disabled={!draft?.from}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
