import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { redis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { logHistory } from "@/lib/history";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const raw = await redis.get<string>(keys.fileMeta(params.id));
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const meta = JSON.parse(raw);
  if (!meta.deletedAt && meta.blobUrl) {
    try {
      await del(meta.blobUrl);
    } catch (_) {}
    meta.deletedAt = new Date().toISOString();
    meta.blobUrl = null;
    await redis.set(keys.fileMeta(params.id), JSON.stringify(meta));
    await logHistory("file", params.id, { type: "file.deleted" });
  }
  return NextResponse.json({ ok: true });
}
