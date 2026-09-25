import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { authorizeRequest } from "@/lib/api-auth";

export const runtime = "nodejs";

const DEFAULT_METHOD = "UPI";
const LEDGER_TIMEZONE = "Asia/Kolkata";

const resultSchema = z.object({
  transactions: z.array(z.object({
    name: z.string().min(1),
    amount: z.number().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    category: z.string().nullable(),
    method: z.string().nullable(),
  })),
});

function allowedNames(values: unknown) {
  return Array.isArray(values)
    ? values.filter((value): value is string => typeof value === "string" && value.length > 0)
    : [];
}

function pickMethod(method: string | null, allowed: string[]) {
  if (method && allowed.includes(method)) return method;
  if (allowed.includes(DEFAULT_METHOD)) return DEFAULT_METHOD;
  return allowed[0] ?? DEFAULT_METHOD;
}

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: LEDGER_TIMEZONE });
}

export async function POST(req: Request) {
  if (process.env.IS_AI_ENABLED !== "true") {
    return NextResponse.json({ error: "AI is disabled" }, { status: 404 });
  }
  if (!(await authorizeRequest(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { message, categories, methods } = await req.json().catch(() => ({}));
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "A message is required" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI is not configured. Add OPENAI_API_KEY to .env.local, then restart the server." },
      { status: 503 }
    );
  }

  try {
    const allowedCategories = allowedNames(categories);
    const allowedMethods = allowedNames(methods);
    const { output } = await generateText({
      model: openai(process.env.AI_MODEL || "gpt-4.1-mini"),
      system: `You extract new ledger transactions only. Do not answer questions, calculate totals, or use historical ledger data. If the user asks a question instead of describing a transaction, return an empty transactions array. When the user describes spending, extract EVERY individual expense, including amounts phrased after the item (for example, “dosa which is 40 rupees”). A conjunction, comma, or new sentence can separate transactions. Use today (${today()}) if no date is given. Choose a category only from the supplied category list, otherwise use null. Choose a payment method only from the supplied method list. If the user does not mention a payment method for a row, use ${DEFAULT_METHOD}. If they mention one method for several expenses, apply it to those rows. Every result is a draft and has not been saved.
      
      For each transaction name: keep the user's meaning, but clean typing/speech mistakes. Fix obvious spelling errors (including place names), expand common city/place abbreviations to the standard English name (hyd → Hyderabad, blr → Bengaluru), and use normal title-style capitalization (Movie, Rapido, Dining with friends, Flight from Vijayawada to Hyderabad). Do not add extra words, guess brands or merchants the user did not mention, or rewrite the description into a longer phrase. If a spelling fix is uncertain, keep the original word.`,
      prompt: `Existing categories: ${JSON.stringify(allowedCategories)}\nExisting payment methods: ${JSON.stringify(allowedMethods)}\nDefault payment method: ${DEFAULT_METHOD}\n\nUser message: ${message}`,
      output: Output.object({ schema: resultSchema, name: "ledger_result" }),
    });
    return NextResponse.json({
      transactions: output.transactions.map((transaction) => ({
        ...transaction,
        category: transaction.category && allowedCategories.includes(transaction.category)
          ? transaction.category
          : null,
        method: pickMethod(transaction.method, allowedMethods),
      })),
    });
  } catch (error: unknown) {
    console.error("[/api/ai] failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "OpenAI could not process this request. Check OPENAI_API_KEY and AI_MODEL." },
      { status: 502 }
    );
  }
}
