import { fetchAllExpenses } from "@/lib/notion";
import { Dashboard } from "@/components/dashboard/dashboard";
import { LogoutButton } from "@/components/logout-button";
import type { Expense } from "@/lib/types";

export const revalidate = 60;

export default async function Page() {
  let expenses: Expense[] = [];
  let error: string | null = null;

  try {
    expenses = await fetchAllExpenses();
  } catch (err: any) {
    error = err?.message ?? "Failed to load expenses from Notion.";
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-2 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Ledger</h1>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm">
          <p className="font-medium text-destructive">
            Couldn&apos;t load data from Notion
          </p>
          <p className="mt-1 text-muted-foreground">{error}</p>
        </div>
      ) : (
        <Dashboard expenses={expenses} />
      )}

      <footer className="mt-10 flex justify-center border-t pt-6">
        <LogoutButton />
      </footer>
    </main>
  );
}
