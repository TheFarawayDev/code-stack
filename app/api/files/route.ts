import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { redis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { newId, nowIso } from "@/lib/ids";
import { logHistory } from "@/lib/history";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

  const id = newId();
  const { url } = await put(`code/${id}/${file.name}`, file, { access: "private" });

  const meta = {
    id,
    name: file.name,
    size: file.size,
    blobUrl: url,
    createdAt: nowIso(),
    deletedAt: null,
  };

  await redis.set(keys.fileMeta(id), JSON.stringify(meta));
  await logHistory("file", id, { type: "file.uploaded", diff: { name: file.name, size: file.size } });

  return NextResponse.json(meta, { status: 201 });
}
