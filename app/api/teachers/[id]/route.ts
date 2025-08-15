import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { TeacherSchema } from "@/lib/validation";
import { logHistory } from "@/lib/history";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const raw = await redis.get<string>(keys.teacher(params.id));
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(JSON.parse(raw));
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const raw = await redis.get<string>(keys.teacher(params.id));
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const current = JSON.parse(raw);
  const patch = await req.json();
  const updated = { ...current, ...patch, updatedAt: new Date().toISOString() };
  const parsed = TeacherSchema.safeParse(updated);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await redis.set(keys.teacher(params.id), JSON.stringify(updated));
  await logHistory("teacher", params.id, { type: "updated", diff: patch });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const raw = await redis.get<string>(keys.teacher(params.id));
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const current = JSON.parse(raw);
  if (!current.deletedAt) {
    current.deletedAt = new Date().toISOString();
    current.active = false;
    await redis.set(keys.teacher(params.id), JSON.stringify(current));
    await logHistory("teacher", params.id, { type: "deleted" });
  }
  return NextResponse.json({ ok: true });
}
