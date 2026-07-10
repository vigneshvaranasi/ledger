"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { inr, dayLabel } from "@/lib/format";
import type { Expense } from "@/lib/types";

type SortKey = "date" | "name" | "category" | "method" | "amount";
type Dir = "asc" | "desc";

const PAGE_SIZE = 15;

export function RecentTable({ rows }: { rows: Expense[] }) {
  const [sort, setSort] = useState<SortKey>("date");
  const [dir, setDir] = useState<Dir>("desc");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [rows]);

  function toggle(key: SortKey) {
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    let cmp = 0;
    switch (sort) {
      case "amount":
        cmp = a.amount - b.amount;
        break;
      case "date":
        cmp = (a.date ?? "").localeCompare(b.date ?? "");
        break;
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "category":
        cmp = (a.category ?? "").localeCompare(b.category ?? "");
        break;
      case "method":
        cmp = (a.method ?? "").localeCompare(b.method ?? "");
        break;
    }
    return dir === "asc" ? cmp : -cmp;
  });

  const SortHead = ({
    label,
    k,
    className,
  }: {
    label: string;
    k: SortKey;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => toggle(k)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        {sort === k ? (
          dir === "asc" ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );

  if (rows.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No transactions match these filters.
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, totalPages - 1);
  const start = current * PAGE_SIZE;
  const pageRows = sorted.slice(start, start + PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Date" k="date" />
            <SortHead label="Transaction" k="name" />
            <SortHead label="Category" k="category" />
            <SortHead label="Method" k="method" />
            <SortHead label="Amount" k="amount" className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.map((e) => {
            const income = e.type === "Income";
            return (
              <TableRow key={e.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground tabular-nums">
                  {dayLabel(e.date)}
                </TableCell>
                <TableCell className="font-medium">{e.name || "—"}</TableCell>
                <TableCell>
                  {e.category ? (
                    <Badge variant="secondary" className="font-normal">
                      {e.category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {e.method ?? "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right font-medium tabular-nums",
                    income ? "text-primary" : "text-foreground"
                  )}
                >
                  {income ? "+" : "−"}
                  {inr(e.amount)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

      {/* Pager */}
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span className="tabular-nums">
          {start + 1}–{Math.min(start + PAGE_SIZE, sorted.length)} of{" "}
          {sorted.length}
        </span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums">
            Page {current + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={current === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={current >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
