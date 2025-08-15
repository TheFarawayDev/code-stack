import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/history";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity");
  const id = searchParams.get("id");
  if (!entity || !id) return NextResponse.json({ error: "Missing entity or id" }, { status: 400 });
  const items = await getHistory(entity, id, { limit: 200 });
  return NextResponse.json(items);
}
