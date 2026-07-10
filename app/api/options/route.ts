import { NextResponse } from "next/server";
import { authorizeRequest } from "@/lib/api-auth";
import { fetchOptions } from "@/lib/notion";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await authorizeRequest(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const options = await fetchOptions();
    return NextResponse.json(options);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Failed to load options" },
      { status: 500 }
    );
  }
}
