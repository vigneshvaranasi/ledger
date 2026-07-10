import { NextResponse } from "next/server";
import { fetchAllExpenses } from "@/lib/notion";

export const revalidate = 60;

export async function GET() {
  try {
    const expenses = await fetchAllExpenses();
    return NextResponse.json({ count: expenses.length, expenses });
  } catch (err: any) {
    console.error("[/api/expenses] failed:", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}
