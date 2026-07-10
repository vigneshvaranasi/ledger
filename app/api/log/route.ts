import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authorizeRequest } from "@/lib/api-auth";
import { createExpense } from "@/lib/notion";
import type { NewExpense, TxType } from "@/lib/types";

export const runtime = "nodejs";

function parse(body: any): { data?: NewExpense; error?: string } {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return { error: "name is required" };

  const amount = Number(body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "amount must be a positive number" };
  }

  const type: TxType = body?.type === "Income" ? "Income" : "Expense";
  const category =
    typeof body?.category === "string" && body.category.trim()
      ? body.category.trim()
      : null;
  const method =
    typeof body?.method === "string" && body.method.trim()
      ? body.method.trim()
      : null;
  let date =
    typeof body?.date === "string" && body.date.trim() ? body.date.trim() : null;
  if (!date) date = new Date().toLocaleDateString("en-CA");

  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  return { data: { name, amount, type, category, method, date, notes } };
}

export async function POST(req: Request) {
  if (!(await authorizeRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data, error } = parse(body);
  if (error || !data) {
    return NextResponse.json({ error: error ?? "Invalid input" }, { status: 400 });
  }

  try {
    const id = await createExpense(data);
    revalidatePath("/");
    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to create expense" },
      { status: 500 }
    );
  }
}
