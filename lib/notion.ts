import "server-only";
import { Client } from "@notionhq/client";
import { normalize, type Expense, type NewExpense } from "./types";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

const DATABASE_ID = process.env.NOTION_DB_ID;
const EXPLICIT_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID;
let cachedDataSourceId: string | undefined;

async function resolveDataSourceId(): Promise<string> {
  if (EXPLICIT_DATA_SOURCE_ID) return EXPLICIT_DATA_SOURCE_ID;
  if (cachedDataSourceId) return cachedDataSourceId;
  if (!DATABASE_ID) {
    throw new Error("NOTION_DB_ID is not set. Add it to .env.local.");
  }

  const db: any = await notion.databases.retrieve({ database_id: DATABASE_ID });
  const first = db?.data_sources?.[0]?.id;
  if (!first) {
    throw new Error(
      "Could not find a data source on the database. Confirm the integration " +
        "is connected to the 'Expense Tracker' database and NOTION_DB_ID is correct."
    );
  }
  cachedDataSourceId = first;
  return first;
}

export async function fetchAllExpenses(): Promise<Expense[]> {
  const dataSourceId = await resolveDataSourceId();
  const rows: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const res: any = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
      sorts: [{ property: "Date", direction: "descending" }],
    });
    rows.push(...res.results);
    cursor = res.has_more ? res.next_cursor ?? undefined : undefined;
  } while (cursor);

  return rows.map(normalize);
}

export async function createExpense(input: NewExpense): Promise<string> {
  const dataSourceId = await resolveDataSourceId();

  const properties: Record<string, any> = {
    Expense: { title: [{ text: { content: input.name } }] },
    Amount: { number: input.amount },
    Type: { select: { name: input.type } },
  };
  if (input.category) properties["Category"] = { select: { name: input.category } };
  if (input.method) properties["Payment Method"] = { select: { name: input.method } };
  if (input.date) properties["Date"] = { date: { start: input.date } };
  if (input.notes) properties["Notes"] = { rich_text: [{ text: { content: input.notes } }] };

  const res: any = await notion.pages.create({
    parent: { type: "data_source_id", data_source_id: dataSourceId },
    properties,
  });
  return res.id;
}
