export type TxType = "Expense" | "Income";

export type Expense = {
  id: string;
  name: string;
  amount: number;
  type: TxType;
  category: string | null;
  method: string | null;
  date: string | null;
  notes: string;
};

export type NewExpense = {
  name: string;
  amount: number;
  type: TxType;
  category: string | null;
  method: string | null;
  date: string | null;
  notes: string;
};

export function normalize(row: any): Expense {
  const p = row?.properties ?? {};
  const rawType = p["Type"]?.select?.name;
  return {
    id: row?.id ?? "",
    name: p["Expense"]?.title?.[0]?.plain_text ?? "",
    amount: p["Amount"]?.number ?? 0,
    type: rawType === "Income" ? "Income" : "Expense",
    category: p["Category"]?.select?.name ?? null,
    method: p["Payment Method"]?.select?.name ?? null,
    date: p["Date"]?.date?.start ?? null,
    notes: p["Notes"]?.rich_text?.[0]?.plain_text ?? "",
  };
}
