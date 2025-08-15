import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { keys } from "@/lib/keys";
import { newId, nowIso } from "@/lib/ids";
import { logHistory } from "@/lib/history";
import { TeacherSchema } from "@/lib/validation";

export async function GET() {
  const ids = await redis.smembers<string>(keys.teacherList());
  if (!ids?.length) return NextResponse.json([]);
  const pipe = redis.pipeline();
  ids.forEach((id) => pipe.get(keys.teacher(id)));
  const res = (await pipe.exec()).map(([, v]) => (v ? JSON.parse(v as string) : null)).filter(Boolean);
  return NextResponse.json(res);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = body.id ?? newId();
  const now = nowIso();
  const teacher = {
    id,
    name: body.name,
    email: body.email ?? null,
    subjects: Array.isArray(body.subjects) ? body.subjects : [],
    active: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
  const parsed = TeacherSchema.safeParse(teacher);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  await redis.set(keys.teacher(id), JSON.stringify(teacher));
  await redis.sadd(keys.teacherList(), id);
  await logHistory("teacher", id, { type: "created" });
  return NextResponse.json(teacher, { status: 201 });
}
