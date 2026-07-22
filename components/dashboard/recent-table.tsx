"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Download,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import * as XLSX from "xlsx";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { inr, dayLabel, rangeLabel } from "@/lib/format";
import type { Expense } from "@/lib/types";
import type { DateRangeValue } from "./date-range-filter";

type SortKey = "date" | "name" | "type" | "category" | "method" | "amount";
type Dir = "asc" | "desc";

const PAGE_SIZE = 15;

function SortHead({
  label,
  sortKey,
  activeSort,
  dir,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  activeSort: SortKey;
  dir: Dir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = activeSort === sortKey;

  return (
    <TableHead className={className} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-40" />
        )}
      </button>
    </TableHead>
  );
}

export function RecentTable({
  rows,
  dateRange,
}: {
  rows: Expense[];
  dateRange: DateRangeValue;
}) {
  const [sort, setSort] = useState<SortKey>("date");
  const [dir, setDir] = useState<Dir>("desc");
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | Expense["type"]>("all");
  const [category, setCategory] = useState("all");
  const [method, setMethod] = useState("all");

  function toggle(key: SortKey) {
    setPage(0);
    if (key === sort) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSort(key);
      setDir(key === "amount" || key === "date" ? "desc" : "asc");
    }
  }

  const categories = useMemo(
    () => [...new Set(rows.map((row) => row.category).filter(Boolean))].sort(),
    [rows]
  );
  const methods = useMemo(
    () => [...new Set(rows.map((row) => row.method).filter(Boolean))].sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !term || [
        row.name,
        row.type,
        row.category,
        row.method,
        row.notes,
        row.date,
        String(row.amount),
      ].some((value) => value?.toLocaleLowerCase().includes(term));

      return (
        matchesQuery &&
        (type === "all" || row.type === type) &&
        (category === "all" || row.category === category) &&
        (method === "all" || row.method === method)
      );
    });
  }, [rows, query, type, category, method]);

  const sorted = [...filtered].sort((a, b) => {
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
      case "type":
        cmp = a.type.localeCompare(b.type);
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

  function exportXlsx() {
    const exportedAt = new Date();
    const exportTimestamp = exportedAt.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const dateRangeLabel = rangeLabel(dateRange.from, dateRange.to);
    const activeFilters = [
      query.trim() ? `Search: ${query.trim()}` : null,
      type !== "all" ? `Type: ${type}` : null,
      category !== "all" ? `Category: ${category}` : null,
      method !== "all" ? `Method: ${method}` : null,
    ].filter(Boolean).join(" · ") || "None";
    const filenameDate = dateRange.from && dateRange.to
      ? `${dateRange.from}_to_${dateRange.to}`
      : "all-dates";
    const filenameTime = `${exportedAt.getFullYear()}-${String(exportedAt.getMonth() + 1).padStart(2, "0")}-${String(exportedAt.getDate()).padStart(2, "0")}_${String(exportedAt.getHours()).padStart(2, "0")}-${String(exportedAt.getMinutes()).padStart(2, "0")}`;
    const sheet = XLSX.utils.aoa_to_sheet([
      ["Ledger transactions"],
      ["Date range", dateRangeLabel],
      ["Table filters", activeFilters],
      ["Transactions exported", sorted.length],
      ["Exported at", exportTimestamp],
      [],
    ]);
    XLSX.utils.sheet_add_json(sheet, sorted.map((row) => ({
      Date: row.date ?? "",
      Transaction: row.name,
      Type: row.type,
      Category: row.category ?? "",
      "Payment method": row.method ?? "",
      Amount: row.amount,
      Notes: row.notes,
    })), { origin: "A7" });
    sheet["!merges"] = [XLSX.utils.decode_range("A1:G1")];
    sheet["!cols"] = [
      { wch: 14 }, { wch: 30 }, { wch: 12 }, { wch: 20 },
      { wch: 20 }, { wch: 14 }, { wch: 42 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Transactions");
    XLSX.writeFile(
      workbook,
      `ledger-transactions_${filenameDate}_exported-${filenameTime}.xlsx`
    );
  }

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
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-2 sm:grid-cols-2 lg:flex lg:items-center">
          <div className="relative sm:col-span-2 lg:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => { setQuery(event.target.value); setPage(0); }}
              placeholder="Search transactions..."
              className="pl-9"
              aria-label="Search transactions"
            />
          </div>
          <Select value={type} onValueChange={(value) => { setType(value as typeof type); setPage(0); }}>
            <SelectTrigger size="sm" className="w-full lg:w-28"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Expense">Expenses</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={(value) => { setCategory(value ?? "all"); setPage(0); }}>
            <SelectTrigger size="sm" className="w-full lg:w-36"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((value) => <SelectItem key={value} value={value!}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={method} onValueChange={(value) => { setMethod(value ?? "all"); setPage(0); }}>
            <SelectTrigger size="sm" className="w-full lg:w-36"><SelectValue placeholder="Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {methods.map((value) => <SelectItem key={value} value={value!}>{value}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={exportXlsx} disabled={sorted.length === 0}>
          <Download className="size-4" /> Export XLSX
        </Button>
      </div>

      {(query || type !== "all" || category !== "all" || method !== "all") && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <SlidersHorizontal className="size-4" />
          Showing {sorted.length} matching transaction{sorted.length === 1 ? "" : "s"}
          <Button
            variant="link"
            size="xs"
            className="h-auto px-0"
            onClick={() => { setQuery(""); setType("all"); setCategory("all"); setMethod("all"); setPage(0); }}
          >
            Clear filters
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="Date" sortKey="date" activeSort={sort} dir={dir} onSort={toggle} />
            <SortHead label="Transaction" sortKey="name" activeSort={sort} dir={dir} onSort={toggle} />
            <SortHead label="Type" sortKey="type" activeSort={sort} dir={dir} onSort={toggle} />
            <SortHead label="Category" sortKey="category" activeSort={sort} dir={dir} onSort={toggle} />
            <SortHead label="Method" sortKey="method" activeSort={sort} dir={dir} onSort={toggle} />
            <SortHead label="Amount" sortKey="amount" activeSort={sort} dir={dir} onSort={toggle} className="text-right" />
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
                  <Badge variant={income ? "default" : "outline"} className="font-normal">
                    {e.type}
                  </Badge>
                </TableCell>
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

      {sorted.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">
          No transactions match your search or table filters.
        </div>
      )}

      {/* Pager */}
      {sorted.length > 0 && <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
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
      </div>}
    </div>
  );
}
