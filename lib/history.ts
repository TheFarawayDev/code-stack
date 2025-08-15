import { redis } from "./redis";
import { nowIso } from "./ids";
import { keys } from "./keys";

export type HistoryEvent<T = unknown> = {
  at: string;
  actor?: string;
  type: string;
  diff?: T;
};

export async function logHistory(entity: string, id: string, event: HistoryEvent){
  const k = keys.history(entity, id);
  await redis.lpush(k, JSON.stringify({ at: nowIso(), ...event }));
}

export async function getHistory(entity: string, id: string, {offset=0, limit=100}={}) {
  const k = keys.history(entity, id);
  const items = await redis.lrange<string[]>(k, offset, offset + limit - 1);
  return items.map((s) => JSON.parse(s));
}
